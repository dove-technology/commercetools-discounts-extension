import type {
  CommerceToolsCart,
  CommerceToolsAction,
} from "./commerce-tools-types";
import map from "./commerce-tools-cart-mapper";
import { DoveTechDiscountsDataInstance } from "./dovetech-types";

export const proxy = async (
  commerceToolsCart: CommerceToolsCart
): Promise<CommerceToolsAction[]> => {
  console.log(
    JSON.stringify(
      map(commerceToolsCart, DoveTechDiscountsDataInstance.Live, false)
    )
  );

  return [];
};
