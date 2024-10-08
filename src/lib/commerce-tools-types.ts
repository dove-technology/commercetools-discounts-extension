export interface CommerceToolsCart {
  id: string;
  version: number;
  lineItems: CommerceToolsLineItem[];
  totalPrice: CommerceToolsMoney;
}

export interface CommerceToolsLineItem {
  id: string;
  productId: string;
  quantity: number;
  // totalPrice: CommerceToolsMoney;
  price: CommerceToolsPrice;
}

export interface CommerceToolsPrice {
  id: string;
  value: CommerceToolsMoney;
  country: string;
}

export interface CommerceToolsMoney {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export interface CommerceToolsAction {
  action: string;
  [key: string]: any;
}
