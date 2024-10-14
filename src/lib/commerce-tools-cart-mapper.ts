// map commerce tools cart to dovetech request

import { CART_ACTION, COUPON_CODES } from "./cart-constants";
import type { Cart, LineItem } from "@commercetools/platform-sdk";
import {
  AddCouponCodeCartAction,
  CartAction,
  CartActionType,
} from "./custom-commerce-tools-types";
import {
  DoveTechDiscountsBasket,
  DoveTechDiscountsCost,
  DoveTechDiscountsCouponCode,
  DoveTechDiscountsDataInstance,
  DoveTechDiscountsRequest,
  DoveTechDiscountsSettings,
} from "./dovetech-types";

export default (
  commerceToolsCart: Cart,
  dataInstance: DoveTechDiscountsDataInstance,
  commit: boolean
): DoveTechDiscountsRequest => {
  const basket: DoveTechDiscountsBasket = {
    items: commerceToolsCart.lineItems.map((lineItem) => ({
      quantity: lineItem.quantity,
      price: getLineItemPrice(lineItem),
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

  const settings: DoveTechDiscountsSettings = {
    dataInstance,
    commit,
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

const getLineItemPrice = (lineItem: LineItem) => {
  const centAmount =
    lineItem.price.discounted?.value?.centAmount !== undefined
      ? lineItem.price.discounted.value.centAmount
      : lineItem.price.value.centAmount;

  return centAmount / 100;
};
