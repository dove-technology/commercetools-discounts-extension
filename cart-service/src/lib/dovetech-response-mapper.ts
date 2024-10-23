import {
  CART_ACTION,
  CART_METADATA,
  SHIPPING_CUSTOM_LINE_ITEM_SLUG,
} from './cart-constants';
import type {
  LineItem,
  CartSetLineItemTotalPriceAction,
  CartUpdateAction,
  CartSetCustomTypeAction,
  CartAddCustomLineItemAction,
  CartSetDirectDiscountsAction,
  CartDiscountValueDraft,
  CartDiscountValueRelative,
  DirectDiscountDraft,
  CentPrecisionMoneyDraft,
  Money,
} from '@commercetools/platform-sdk';
import {
  AddCouponCodeCartAction,
  CartAction,
  CartActionType,
  CartOrOrder,
  CouponCode,
} from '../types/custom-commerce-tools.types';
import {
  CouponCodeRejectedAction,
  DoveTechActionType,
  DoveTechDiscountsResponse,
  DoveTechDiscountsResponseLineItem,
} from '../types/dovetech.types';
import Decimal from 'decimal.js';
import { ExtensionResponse } from '../types/index.types';
import { ShippingCostName } from './dovetech-property-constants';

const invalidCouponCodeResponse: ExtensionResponse = {
  success: false,
  errorResponse: {
    statusCode: 400,
    message: 'Discount code is not applicable',
    errors: [
      {
        code: 'InvalidInput',
        message: 'Discount code is not applicable',
      },
    ],
  },
};

export default (
  dtResponse: DoveTechDiscountsResponse,
  commerceToolsCart: CartOrOrder
): ExtensionResponse => {
  if (commerceToolsCart.type === 'Order') {
    return {
      success: true,
      actions: [],
    };
  }

  const dtBasketItems = dtResponse.basket?.items ?? [];

  const actions = getLineItemTotalPriceActions(
    dtBasketItems,
    commerceToolsCart
  );

  const couponCodeRejectedActions = dtResponse.actions.filter(
    (a) => a.type === DoveTechActionType.CouponCodeRejected
  ) as CouponCodeRejectedAction[];

  if (newCouponCodeInvalid(couponCodeRejectedActions, commerceToolsCart)) {
    return invalidCouponCodeResponse;
  }

  const couponCodeAcceptedActions = dtResponse.actions.filter(
    (a) => a.type === DoveTechActionType.CouponCodeAccepted
  ) as CouponCodeRejectedAction[];

  if (
    couponCodeRejectedActions.length > 0 || // if an existing coupon code was rejected, we need to remove it from the cart
    couponCodeAcceptedActions.length > 0
  ) {
    const couponCodes: CouponCode[] = couponCodeAcceptedActions.map((a) => ({
      code: a.code,
    }));
    const serialisedCouponCodes = JSON.stringify(couponCodes);

    const setCustomTypeAction: CartSetCustomTypeAction = {
      action: 'setCustomType',
      type: {
        key: CART_METADATA,
        typeId: 'type',
      },
      fields: {
        // Note. We're removing the "dovetech-cartAction" field by not setting it
        'dovetech-couponCodes': serialisedCouponCodes,
      },
    };

    actions.push(setCustomTypeAction);
  }

  actions.push(...getShippingActions(dtResponse, commerceToolsCart));

  return {
    success: true,
    actions,
  };
};

const getLineItemTotalPriceActions = (
  dtBasketItems: DoveTechDiscountsResponseLineItem[],
  commerceToolsCart: CartOrOrder
): CartUpdateAction[] => {
  const currencyCode = commerceToolsCart.totalPrice.currencyCode;
  const fractionDigits = commerceToolsCart.totalPrice.fractionDigits;

  return dtBasketItems
    .map((item, index) => {
      const ctLineItem = commerceToolsCart.lineItems[index];
      return buildSetLineItemTotalPriceAction(
        item,
        ctLineItem,
        currencyCode,
        fractionDigits
      );
    })
    .filter((a) => {
      return (
        a.externalTotalPrice!.price.centAmount !==
        a.externalTotalPrice!.totalPrice.centAmount
      );
    });
};

const buildSetLineItemTotalPriceAction = (
  dtLineItem: DoveTechDiscountsResponseLineItem,
  ctLineItem: LineItem,
  currencyCode: string,
  fractionDigits: number
): CartSetLineItemTotalPriceAction => {
  const total = new Decimal(dtLineItem.total);

  return {
    action: 'setLineItemTotalPrice',
    lineItemId: ctLineItem.id,
    externalTotalPrice: {
      price: {
        currencyCode,
        centAmount: ctLineItem.price.value.centAmount,
      },
      totalPrice: {
        currencyCode,
        centAmount: total.mul(new Decimal(10).pow(fractionDigits)).toNumber(),
      },
    },
  };
};

const newCouponCodeInvalid = (
  couponCodeRejectedActions: CouponCodeRejectedAction[],
  commerceToolsCart: CartOrOrder
) => {
  if (couponCodeRejectedActions.length === 0) {
    return false;
  }

  const serialisedCartAction = commerceToolsCart.custom?.fields[CART_ACTION];

  if (!serialisedCartAction) {
    return false;
  }

  const cartAction: CartAction = JSON.parse(serialisedCartAction);

  if (cartAction.type !== CartActionType.AddCouponCode) {
    return false;
  }

  const addCouponCodeAction = cartAction as AddCouponCodeCartAction;

  return couponCodeRejectedActions.some(
    (a) => a.code === addCouponCodeAction.code
  );
};

const getShippingActions = (
  dtResponse: DoveTechDiscountsResponse,
  commerceToolsCart: CartOrOrder
) => {
  const actions: CartUpdateAction[] = [];

  const shippingCost = dtResponse.costs.find(
    (cost) => cost.name === ShippingCostName
  );

  const customShippingLineItem = (commerceToolsCart.customLineItems || []).find(
    (i) => {
      return i.slug === SHIPPING_CUSTOM_LINE_ITEM_SLUG;
    }
  );

  if (customShippingLineItem) {
    actions.push({
      action: 'removeCustomLineItem',
      customLineItemId: customShippingLineItem.id,
    });
  }

  let shippingDiscounts: DirectDiscountDraft[] = [];

  if (shippingCost?.totalAmountOff) {
    const fractionDigits = commerceToolsCart.totalPrice.fractionDigits;

    const total = new Decimal(shippingCost.totalAmountOff);
    const centAmount = total
      .mul(new Decimal(10).pow(fractionDigits))
      .toNumber();

    const shippingDiscountMoney: Money = {
      centAmount: centAmount,
      currencyCode: commerceToolsCart.totalPrice.currencyCode,
    };

    const shippingDiscount: DirectDiscountDraft = {
      value: {
        type: 'absolute',
        money: [shippingDiscountMoney],
      },
      target: {
        type: 'shipping',
      },
    };
    shippingDiscounts.push(shippingDiscount);

    // const currencyCode = commerceToolsCart.totalPrice.currencyCode;
    // const fractionDigits = commerceToolsCart.totalPrice.fractionDigits;

    // const taxCategoryId = '24b6c133-fcad-43cc-b8a6-fa30bba30ba0';

    // const total = new Decimal(shippingCost.totalAmountOff);
    // const centAmount = total
    //   .mul(new Decimal(10).pow(fractionDigits))
    //   .toNumber();

    // const addAction: CartAddCustomLineItemAction = {
    //   action: 'addCustomLineItem',
    //   name: { en: 'Shipping Discount' },
    //   quantity: 1,
    //   money: {
    //     currencyCode: currencyCode,
    //     type: 'centPrecision',
    //     centAmount: -centAmount,
    //   },
    //   slug: SHIPPING_CUSTOM_LINE_ITEM_SLUG,
    //   taxCategory: {
    //     id: taxCategoryId,
    //     typeId: 'tax-category',
    //   },
    // };
  }

  const addAction: CartSetDirectDiscountsAction = {
    action: 'setDirectDiscounts',
    discounts: shippingDiscounts,
  };
  actions.push(addAction);

  return actions;
};
