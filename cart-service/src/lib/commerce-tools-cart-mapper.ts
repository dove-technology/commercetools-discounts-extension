import { CART_ACTION, COUPON_CODES } from './cart-constants';
import type { LineItem, ShippingInfo } from '@commercetools/platform-sdk';
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
} from '../types/dovetech.types';
import Decimal from 'decimal.js';
import { ShippingCostName } from './dovetech-property-constants';

export default (
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

  if (commerceToolsCart.shippingInfo) {
    costs.push({
      name: ShippingCostName,
      value: getShippingCostInCurrencyUnits(commerceToolsCart.shippingInfo),
    });
  }

  const settings: DoveTechDiscountsSettings = {
    dataInstance,
    commit: commerceToolsCart.type === 'Order',
    explain: false,
  };

  return {
    basket,
    costs,
    couponCodes,
    context,
    settings,
  };
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

const getShippingCostInCurrencyUnits = (shippingInfo: ShippingInfo) => {
  const price = getShippingCost(shippingInfo);

  const fractionDigits = price.fractionDigits;

  return new Decimal(price.centAmount)
    .div(new Decimal(10).pow(fractionDigits))
    .toNumber();
};

const getShippingCost = (shippingInfo: ShippingInfo) => {
  return shippingInfo.discountedPrice
    ? shippingInfo.discountedPrice.value
    : shippingInfo.price;
};
