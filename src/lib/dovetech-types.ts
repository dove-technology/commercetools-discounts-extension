export interface DoveTechDiscountsRequest {
  basket: DoveTechDiscountsBasket;
  costs: DoveTechDiscountsCost[] | undefined | null;
  couponCodes: DoveTechDiscountsCouponCode[] | undefined | null;
  context: DoveTechDiscountsContext | undefined | null;
  settings: DoveTechDiscountsSettings;
  [key: string]: any;
}

export interface DoveTechDiscountsBasket {
  items: DoveTechDiscountsLineItem[];
  [key: string]: any;
}

export interface DoveTechDiscountsLineItem {
  quantity: number;
  price: number;
  [key: string]: any;
}

export interface DoveTechDiscountsCost {
  name: string;
  value: number;
}

export interface DoveTechDiscountsCouponCode {
  code: string;
}

export interface DoveTechDiscountsContext {
  currencyCode: string;
  [key: string]: any;
}

export interface DoveTechDiscountsSettings {
  dataInstance: DoveTechDiscountsDataInstance;
  commit: boolean;
  explain: boolean;
}

export enum DoveTechDiscountsDataInstance {
  Live = "Live",
  Staging = "Staging",
}

export interface DoveTechDiscountsResponse {
  actions: DoveTechDiscountsResponseAction[];
  basket: DoveTechDiscountsResponseBasket | null;
  commitId: string | null;
  aggregates: DoveTechDiscountsAggregates;
  costs: DoveTechDiscountsResponseCost[];
}

export interface DoveTechDiscountsResponseBasket {
  total: number;
  totalAmountOff: number;
  items: DoveTechDiscountsResponseLineItem[];
}

export interface DoveTechDiscountsResponseLineItem {
  total: number;
  totalAmountOff: number;
  actions: DoveTechDiscountsResponseLineItemAction[];
}

export interface DoveTechDiscountsResponseLineItemAction {
  id: string;
  subItemId: number;
  amountOff: number;
}

export interface DoveTechDiscountsResponseAction {
  type: string;
  id: string;
}

export interface DoveTechDiscountsAggregates {
  total: number;
  totalAmountOff: number;
}

export interface DoveTechDiscountsResponseCost {
  name: string;
  value: number;
  totalAmountOff: number;
  // actions: DoveTechDiscountsResponseAction[];
}
