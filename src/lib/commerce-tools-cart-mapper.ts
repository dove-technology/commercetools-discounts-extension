// map commerce tools cart to dovetech request

import { CommerceToolsCart } from "./commerce-tools-types";
import {
  DoveTechDiscountsBasket,
  DoveTechDiscountsCost,
  DoveTechDiscountsCouponCode,
  DoveTechDiscountsDataInstance,
  DoveTechDiscountsRequest,
  DoveTechDiscountsSettings,
} from "./dovetech-types";

export default (
  commerceToolsCart: CommerceToolsCart,
  dataInstance: DoveTechDiscountsDataInstance,
  commit: boolean
): DoveTechDiscountsRequest => {
  const basket: DoveTechDiscountsBasket = {
    items: commerceToolsCart.lineItems.map((lineItem) => ({
      quantity: lineItem.quantity,
      price: lineItem.price.value.centAmount / 100, // todo: handle fractionDigits
    })),
  };

  const costs: DoveTechDiscountsCost[] = [];
  const couponCodes: DoveTechDiscountsCouponCode[] = [];

  const context = {
    currencyCode: commerceToolsCart.totalPrice.currencyCode,
  };

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
