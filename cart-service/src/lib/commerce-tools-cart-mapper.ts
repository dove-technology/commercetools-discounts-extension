import { CART_ACTION, COUPON_CODES } from './cart-constants';
import type {
  LineItem,
  ShippingInfo,
  TypedMoney,
} from '@commercetools/platform-sdk';
import {
  AddCouponCodeCartAction,
  CartAction,
  CartActionType,
  CartOrOrder,
} from '../types/custom-commerce-tools.types';
import {
  DoveTechDiscountsBasket,
  DoveTechDiscountsCost,
  DoveTechDiscountsCouponCode,
  DoveTechDiscountsDataInstance,
  DoveTechDiscountsRequest,
  DoveTechDiscountsSettings,
  ShippingObject,
} from '../types/dovetech.types';
import Decimal from 'decimal.js';
import { SHIPPING_COST_NAME } from './dovetech-property-constants';
import { Configuration } from '../types/index.types';
import { logger } from '../utils/logger.utils';

export default (
  configuration: Configuration,
  commerceToolsCart: CartOrOrder,
  dataInstance: DoveTechDiscountsDataInstance
): DoveTechDiscountsRequest => {
  const basket: DoveTechDiscountsBasket = {
    items: commerceToolsCart.lineItems.map((lineItem) => ({
      quantity: lineItem.quantity,
      price: getLineItemPriceInCurrencyUnits(lineItem),
      productId: lineItem.productId,
      productKey: lineItem.productKey,
    })),
  };

  const costs: DoveTechDiscountsCost[] = [];
  const couponCodes: DoveTechDiscountsCouponCode[] = [];

  const context = {
    currencyCode: commerceToolsCart.totalPrice.currencyCode,
  };

  const serialisedCartAction = commerceToolsCart.custom?.fields[CART_ACTION];

  if (serialisedCartAction) {
    const cartAction: CartAction = JSON.parse(serialisedCartAction);

    if (cartAction.type === CartActionType.AddCouponCode) {
      const addCouponCodeAction = cartAction as AddCouponCodeCartAction;
      couponCodes.push({
        code: addCouponCodeAction.code,
      });
    }
  }

  const serialisedCouponCodes = commerceToolsCart.custom?.fields[COUPON_CODES];

  if (serialisedCouponCodes) {
    const couponCodesFromCart = JSON.parse(serialisedCouponCodes);
    couponCodes.push(...couponCodesFromCart);
  }

  const shippingCostInCurrency = getShippingCostInCurrencyUnits(
    configuration,
    commerceToolsCart
  );

  if (shippingCostInCurrency !== undefined) {
    costs.push({
      name: SHIPPING_COST_NAME,
      value: shippingCostInCurrency,
    });
  }

  const settings: DoveTechDiscountsSettings = {
    dataInstance,
    commit: commerceToolsCart.type === 'Order',
    explain: false,
  };

  const dtRequest: DoveTechDiscountsRequest = {
    basket,
    costs,
    couponCodes,
    context,
    settings,
  };

  const shippingObject = buildShippingObject(commerceToolsCart);

  if (shippingObject) {
    dtRequest.shipping = shippingObject;
  }

  return dtRequest;
};

const getLineItemPriceInCurrencyUnits = (lineItem: LineItem) => {
  const price = getLineItemPrice(lineItem);

  const fractionDigits = price.fractionDigits;

  return new Decimal(price.centAmount)
    .div(new Decimal(10).pow(fractionDigits))
    .toNumber();
};

const getLineItemPrice = (lineItem: LineItem) => {
  return lineItem.price.discounted
    ? lineItem.price.discounted.value
    : lineItem.price.value;
};

const getShippingCostInCurrencyUnits = (
  configuration: Configuration,
  commerceToolsCart: CartOrOrder
) => {
  if (commerceToolsCart.shippingMode === 'Multiple') {
    logger.warn(
      'Shipping cost for Multiple shipping methods are not mapped to Dovetech at present so shipping discounts will not apply'
    );
    return undefined;
  }

  if (!commerceToolsCart.shippingInfo) {
    return undefined;
  }

  if (configuration.useDirectDiscountsForShipping) {
    // use non-discounted amount because direct discounts may have already applied
    // also, once direct discounts are applied any commerce tools discounts will be removed
    return getMoneyInCurrencyUnits(commerceToolsCart.shippingInfo.price);
  }

  const price = getShippingInfoPrice(commerceToolsCart.shippingInfo);

  return getMoneyInCurrencyUnits(price);
};

const getShippingInfoPrice = (shippingInfo: ShippingInfo) => {
  return shippingInfo.discountedPrice
    ? shippingInfo.discountedPrice.value
    : shippingInfo.price;
};

const getMoneyInCurrencyUnits = (centPrecisionMoney: TypedMoney) => {
  return getCentsValueInCurrencyUnits(
    centPrecisionMoney.centAmount,
    centPrecisionMoney.fractionDigits
  );
};

const getCentsValueInCurrencyUnits = (
  centAmount: number,
  fractionDigits: number
) => {
  return new Decimal(centAmount)
    .div(new Decimal(10).pow(fractionDigits))
    .toNumber();
};

const buildShippingObject = (
  commerceToolsCart: CartOrOrder
): ShippingObject | undefined => {
  // note, shippingInfo will be undefined if shippingMode is Multiple (not mapped at present)
  if (!commerceToolsCart.shippingInfo?.shippingMethod?.id) {
    return undefined;
  }

  return {
    methodId: commerceToolsCart.shippingInfo.shippingMethod?.id,
  };
};
