import { CART_ACTION, CART_METADATA } from "./cart-constants";
import type {
  Cart,
  LineItem,
  CartSetLineItemTotalPriceAction,
  CartUpdateAction,
  CartSetCustomTypeAction,
} from "@commercetools/platform-sdk";
import {
  AddCouponCodeCartAction,
  CartAction,
  CartActionType,
  CouponCode,
} from "./custom-commerce-tools-types";
import {
  CouponCodeRejectedAction,
  DoveTechActionType,
  DoveTechDiscountsResponse,
  DoveTechDiscountsResponseLineItem,
} from "./dovetech-types";
import Decimal from "decimal.js";
import { ExtensionResponse } from "./types";

const invalidCouponCodeResponse: ExtensionResponse = {
  success: false,
  errorResponse: {
    statusCode: 400,
    message: "Discount code is not applicable",
    errors: [
      {
        code: "InvalidInput",
        message: "Discount code is not applicable",
      },
    ],
  },
};

export default (
  dtResponse: DoveTechDiscountsResponse,
  commerceToolsCart: Cart,
): ExtensionResponse => {
  const dtBasketItems = dtResponse.basket?.items ?? [];

  let actions = getLineItemTotalPriceActions(dtBasketItems, commerceToolsCart);

  const couponCodeRejectedActions = dtResponse.actions.filter(
    (a) => a.type === DoveTechActionType.CouponCodeRejected,
  ) as CouponCodeRejectedAction[];

  if (newCouponCodeInvalid(couponCodeRejectedActions, commerceToolsCart)) {
    return invalidCouponCodeResponse;
  }

  const couponCodeAcceptedActions = dtResponse.actions.filter(
    (a) => a.type === DoveTechActionType.CouponCodeAccepted,
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
      action: "setCustomType",
      type: {
        key: CART_METADATA,
        typeId: "type",
      },
      fields: {
        // Note. We're removing the "dovetech-cartAction" field by not setting it
        "dovetech-couponCodes": serialisedCouponCodes,
      },
    };

    actions.push(setCustomTypeAction);
  }

  return {
    success: true,
    actions,
  };
};

const getLineItemTotalPriceActions = (
  dtBasketItems: DoveTechDiscountsResponseLineItem[],
  commerceToolsCart: Cart,
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
        fractionDigits,
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
  fractionDigits: number,
): CartSetLineItemTotalPriceAction => {
  const total = new Decimal(dtLineItem.total);

  return {
    action: "setLineItemTotalPrice",
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
  commerceToolsCart: Cart,
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
    (a) => a.code === addCouponCodeAction.code,
  );
};
