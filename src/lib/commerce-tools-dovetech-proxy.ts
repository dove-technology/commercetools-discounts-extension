import type {
  CommerceToolsCart,
  CommerceToolsAction,
} from "./commerce-tools-types";
import map from "./commerce-tools-cart-mapper";
import { DoveTechDiscountsDataInstance } from "./dovetech-types";
import { evaluate } from "./dovetech-discounts-service";

export const proxy = async (
  commerceToolsCart: CommerceToolsCart
): Promise<CommerceToolsAction[]> => {
  const doveTechRequest = map(
    commerceToolsCart,
    DoveTechDiscountsDataInstance.Live,
    false
  );
  console.log(JSON.stringify(doveTechRequest));

  // need to handle non successful responses and map to errors
  var dovetechResponse = await evaluate(doveTechRequest);

  console.log(JSON.stringify(dovetechResponse));

  return [];
};
