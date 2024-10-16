export interface CouponCode {
  code: string;
}

export enum CartActionType {
  AddCouponCode = "addCouponCode",
}

export interface CartAction {
  type: CartActionType;
}

export interface AddCouponCodeCartAction extends CartAction {
  type: CartActionType.AddCouponCode;
  code: string;
}
