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
  totalPrice: CommerceToolsMoney;
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
