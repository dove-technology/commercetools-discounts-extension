import type { Cart, Order } from '@commercetools/platform-sdk';
import map from './commerce-tools-cart-mapper';
import { DoveTechDiscountsDataInstance } from '../types/dovetech.types';
import { evaluate } from './dovetech-discounts-service';
import responseMapper from './dovetech-response-mapper';
import { ExtensionResponse } from '../types/index.types';
import { Configuration } from '../types/index.types';

export const proxy = async (
  configuration: Configuration,
  commerceToolsCart: Cart | Order
): Promise<ExtensionResponse> => {
  const doveTechRequest = map(
    commerceToolsCart,
    DoveTechDiscountsDataInstance.Live
  );

  // need to handle non successful responses and map to errors
  const dovetechResponse = await evaluate(configuration, doveTechRequest);

  const response = responseMapper(dovetechResponse, commerceToolsCart);

  return response;
};
