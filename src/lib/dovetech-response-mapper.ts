import { CART_ACTION, CART_METADATA } from "./cart-constants";
import {
  CommerceToolsAction,
  CommerceToolsCart,
  CommerceToolsLineItem,
  SetLineItemTotalPriceAction,
  ValidationFailure,
} from "./commerce-tools-types";
import {
  AddCouponCodeCartAction,
  CartAction,
  CartActionType,
  CouponCode,
} from "./custom-commerce-tools-types";
import {
  DoveTechDiscountsResponse,
  DoveTechDiscountsResponseLineItem,
} from "./dovetech-types";
import Decimal from "decimal.js";

export default (
  dtResponse: DoveTechDiscountsResponse,
  commerceToolsCart: CommerceToolsCart
): CommerceToolsAction[] | ValidationFailure => {
  const currencyCode = commerceToolsCart.totalPrice.currencyCode;
  const fractionDigits = commerceToolsCart.totalPrice.fractionDigits;

  const dtBasketItems = dtResponse.basket?.items ?? [];

  let actions: CommerceToolsAction[] = dtBasketItems
    .filter((item) => item.totalAmountOff)
    .map((item, index) => {
      const ctLineItem = commerceToolsCart.lineItems[index];
      return buildSetLineItemTotalPriceAction(
        item,
        ctLineItem,
        currencyCode,
        fractionDigits
      );
    });

  const couponCodeRejectedActions = dtResponse.actions.filter(
    (a) => a.type === "CouponCodeRejected"
  );

  if (couponCodeRejectedActions.length > 0) {
    // TODO: this logic is duplicated in the commerce-tools-cart-mapper
    const serialisedCartAction = commerceToolsCart.custom?.fields[CART_ACTION];

    if (serialisedCartAction) {
      const cartAction: CartAction = JSON.parse(serialisedCartAction);

      if (cartAction.type === CartActionType.AddCouponCode) {
        const addCouponCodeAction = cartAction as AddCouponCodeCartAction;

        if (
          couponCodeRejectedActions.some(
            (a) => a.code === addCouponCodeAction.code
          )
        ) {
          return {
            errors: [
              {
                code: "InvalidInput",
                message: "Discount code is not applicable",
              },
            ],
          };
        }
      }
    }
  }

  const couponCodeAcceptedActions = dtResponse.actions.filter(
    (a) => a.type === "CouponCodeAccepted"
  );

  if (
    couponCodeRejectedActions.length > 0 || // if an existing coupon code was rejected, we need to remove it from the cart
    couponCodeAcceptedActions.length > 0
  ) {
    const couponCodes: CouponCode[] = couponCodeAcceptedActions.map((a) => ({
      code: a.code,
    }));
    const serialisedCouponCodes = JSON.stringify(couponCodes);

    const setCustomTypeAction = {
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

  return actions;
};

const buildSetLineItemTotalPriceAction = (
  dtLineItem: DoveTechDiscountsResponseLineItem,
  ctLineItem: CommerceToolsLineItem,
  currencyCode: string,
  fractionDigits: number
): SetLineItemTotalPriceAction => {
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
