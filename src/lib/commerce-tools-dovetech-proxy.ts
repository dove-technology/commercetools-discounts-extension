import type {
  CommerceToolsCart,
  CommerceToolsAction,
} from "./commerce-tools-types";
import map from "./commerce-tools-cart-mapper";
import { DoveTechDiscountsDataInstance } from "./dovetech-types";
import { evaluate } from "./dovetech-discounts-service";
import responseMapper from "./dovetech-response-mapper";

export const proxy = async (
  commerceToolsCart: CommerceToolsCart
): Promise<CommerceToolsAction[]> => {
  console.log("######### commerceToolsCart:");
  console.log(JSON.stringify(commerceToolsCart));

  const doveTechRequest = map(
    commerceToolsCart,
    DoveTechDiscountsDataInstance.Live,
    false
  );

  console.log("######### doveTechRequest:");
  console.log(JSON.stringify(doveTechRequest));

  // need to handle non successful responses and map to errors
  var dovetechResponse = await evaluate(doveTechRequest);

  console.log("######### dovetechResponse:");
  console.log(JSON.stringify(dovetechResponse));

  const actions = responseMapper(dovetechResponse, commerceToolsCart);

  console.log("######### actions:");
  console.log(JSON.stringify(actions));

  return actions;
};
