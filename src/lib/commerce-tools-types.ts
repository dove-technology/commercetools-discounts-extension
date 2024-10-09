export interface CommerceToolsCart {
  id: string;
  version: number;
  lineItems: CommerceToolsLineItem[];
  totalPrice: CentPrecisionMoney;
}

export interface CommerceToolsLineItem {
  id: string;
  productId: string;
  quantity: number;
  // totalPrice: CommerceToolsMoney;
  price: Price;
}

export interface CommerceToolsPrice {
  id: string;
  value: CentPrecisionMoney;
  country: string;
}

export interface CommerceToolsAction {
  action: string;
  [key: string]: any;
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
  discounted: DiscountedPrice | undefined;
}

export interface DiscountedPrice {
  value: CentPrecisionMoney; // Should be TypedMoney
}
