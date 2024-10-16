import { CartUpdateAction, ErrorResponse } from '@commercetools/platform-sdk';

export type ExtensionResponse =
  | {
      success: true;
      actions: CartUpdateAction[];
    }
  | {
      success: false;
      errorResponse: ErrorResponse;
    };
