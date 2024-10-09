import {
  CommerceToolsAction,
  CommerceToolsCart,
  SetLineItemTotalPriceAction,
} from "./commerce-tools-types";
import { DoveTechDiscountsResponse } from "./dovetech-types";

export default (
  dtResponse: DoveTechDiscountsResponse,
  commerceToolsCart: CommerceToolsCart
): CommerceToolsAction[] => {
  const currencyCode = commerceToolsCart.totalPrice.currencyCode;

  let ctActions: CommerceToolsAction[] = [];

  for (let i = 0; i < (dtResponse.basket?.items.length ?? 0); i++) {
    if (dtResponse.basket?.items[i].totalAmountOff) {
      const ctLineItem = commerceToolsCart.lineItems[i];

      const setLineItemTotalPriceAction: SetLineItemTotalPriceAction = {
        action: "setLineItemTotalPrice",
        lineItemId: ctLineItem.id,
        externalTotalPrice: {
          price: {
            currencyCode,
            centAmount: ctLineItem.price.value.centAmount,
          },
          totalPrice: {
            currencyCode,
            centAmount: dtResponse.basket.items[i].total * 100,
          },
        },
      };

      ctActions.push(setLineItemTotalPriceAction);
    }
  }

  return ctActions;
};
