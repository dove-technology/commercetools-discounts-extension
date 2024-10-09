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

export default (
  dtResponse: DoveTechDiscountsResponse,
  commerceToolsCart: CommerceToolsCart
): CommerceToolsAction[] => {
  const currencyCode = commerceToolsCart.totalPrice.currencyCode;

  const dtBasketItems = dtResponse.basket?.items ?? [];

  return dtBasketItems
    .filter((item) => item.totalAmountOff)
    .map((item, index) => {
      const ctLineItem = commerceToolsCart.lineItems[index];
      return buildSetLineItemTotalPriceAction(item, ctLineItem, currencyCode);
    });
};

const buildSetLineItemTotalPriceAction = (
  dtLineItem: DoveTechDiscountsResponseLineItem,
  ctLineItem: CommerceToolsLineItem,
  currencyCode: string
): SetLineItemTotalPriceAction => {
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
        centAmount: dtLineItem.total * 100,
      },
    },
  };
};
