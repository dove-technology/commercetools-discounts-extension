import {
  CommerceToolsAction,
  CommerceToolsCart,
  CommerceToolsLineItem,
  SetLineItemTotalPriceAction,
} from "./commerce-tools-types";
import {
  DoveTechDiscountsResponse,
  DoveTechDiscountsResponseLineItem,
} from "./dovetech-types";
import Decimal from "decimal.js";

export default (
  dtResponse: DoveTechDiscountsResponse,
  commerceToolsCart: CommerceToolsCart
): CommerceToolsAction[] => {
  const currencyCode = commerceToolsCart.totalPrice.currencyCode;
  const fractionDigits = commerceToolsCart.totalPrice.fractionDigits;

  const dtBasketItems = dtResponse.basket?.items ?? [];

  return dtBasketItems
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
