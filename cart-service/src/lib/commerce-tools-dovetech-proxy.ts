import type { Cart } from "@commercetools/platform-sdk";
import map from "./commerce-tools-cart-mapper";
import { DoveTechDiscountsDataInstance } from "./dovetech-types";
import { evaluate } from "./dovetech-discounts-service";
import responseMapper from "./dovetech-response-mapper";
import { ExtensionResponse } from "./types";

export const proxy = async (
  commerceToolsCart: Cart,
): Promise<ExtensionResponse> => {
  console.log("######### commerceToolsCart:");
  console.log(JSON.stringify(commerceToolsCart));

  const doveTechRequest = map(
    commerceToolsCart,
    DoveTechDiscountsDataInstance.Live,
    false,
  );

  console.log("######### doveTechRequest:");
  console.log(JSON.stringify(doveTechRequest));

  // need to handle non successful responses and map to errors
  const dovetechResponse = await evaluate(doveTechRequest);

  console.log("######### dovetechResponse:");
  console.log(JSON.stringify(dovetechResponse));

  const response = responseMapper(dovetechResponse, commerceToolsCart);

  console.log("######### response:");
  console.log(JSON.stringify(response));

  return response;
};