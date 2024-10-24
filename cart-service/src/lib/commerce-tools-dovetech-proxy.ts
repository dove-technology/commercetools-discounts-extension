import map from './commerce-tools-cart-mapper';
import { DoveTechDiscountsDataInstance } from '../types/dovetech.types';
import { evaluate } from './dovetech-discounts-service';
import responseMapper from './dovetech-response-mapper';
import { ExtensionResponse } from '../types/index.types';
import { Configuration } from '../types/index.types';
import type { CartOrOrder } from '../types/custom-commerce-tools.types';

export const proxy = async (
  configuration: Configuration,
  commerceToolsCart: CartOrOrder
): Promise<ExtensionResponse> => {
  const doveTechRequest = map(
    configuration,
    commerceToolsCart,
    DoveTechDiscountsDataInstance.Live
  );

  // need to handle non successful responses and map to errors
  const dovetechResponse = await evaluate(configuration, doveTechRequest);

  const response = responseMapper(
    configuration,
    dovetechResponse,
    commerceToolsCart
  );

  return response;
};
