import type { Cart } from '@commercetools/platform-sdk';
import map from './commerce-tools-cart-mapper';
import { DoveTechDiscountsDataInstance } from './dovetech-types';
import { evaluate } from './dovetech-discounts-service';
import responseMapper from './dovetech-response-mapper';
import { ExtensionResponse } from './types';

export const proxy = async (
  commerceToolsCart: Cart
): Promise<ExtensionResponse> => {
  const doveTechRequest = map(
    commerceToolsCart,
    DoveTechDiscountsDataInstance.Live,
    false
  );

  // need to handle non successful responses and map to errors
  const dovetechResponse = await evaluate(doveTechRequest);

  const response = responseMapper(dovetechResponse, commerceToolsCart);

  return response;
};
