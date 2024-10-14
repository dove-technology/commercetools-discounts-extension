export interface CommerceToolsAction {
  action: string;
  [key: string]: any;
}

export interface ValidationFailure {
  errors: Error[];
}

export interface Error {
  code: string;
  message: string;
}

export interface SetLineItemTotalPriceAction extends CommerceToolsAction {
  action: "setLineItemTotalPrice";
  lineItemId: string;
  externalTotalPrice: ExternalLineItemTotalPrice;
}

export interface ExternalLineItemTotalPrice {
  price: Money;
  totalPrice: Money;
}

export interface CentPrecisionMoney {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export interface Money {
  currencyCode: string;
  centAmount: number;
}

export interface Price {
  value: CentPrecisionMoney; // Should be TypedMoney
  discounted?: DiscountedPrice;
}

export interface DiscountedPrice {
  value: CentPrecisionMoney; // Should be TypedMoney
}

export interface LocalizedString {
  [key: string]: string;
}

export interface ProductVariant {
  sku: string;
  // attributes
}
