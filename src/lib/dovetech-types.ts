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

export interface DoveTechDiscountsResponse {}
