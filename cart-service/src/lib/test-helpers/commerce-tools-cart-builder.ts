import type { Cart, LineItem } from '@commercetools/platform-sdk';
import crypto from 'crypto';
import type {
  CartAction,
  CouponCode,
} from '../../types/custom-commerce-tools-types';

export default class CommerceToolsCartBuilder {
  private lineItems: LineItem[] = [];
  private couponCodes: CouponCode[] = [];
  private cartAction?: CartAction;

  constructor(
    private readonly currencyCode: string,
    private readonly fractionDigits: number = 2
  ) {}

  addLineItem(lineItem: LineItem): this {
    if (lineItem.price.value.currencyCode !== this.currencyCode) {
      throw new Error(
        `Currency code of line item price ${lineItem.price.value.currencyCode} does not match the currency code of the cart ${this.currencyCode}`
      );
    }

    if (lineItem.price.value.fractionDigits !== this.fractionDigits) {
      throw new Error(
        `Fraction digits of line item price ${lineItem.price.value.fractionDigits} does not match the fraction digits of the cart ${this.fractionDigits}`
      );
    }

    this.lineItems.push(lineItem);
    return this;
  }

  addCouponCode(couponCode: CouponCode): this {
    this.couponCodes.push(couponCode);
    return this;
  }

  addCartAction(cartAction: CartAction): this {
    this.cartAction = cartAction;
    return this;
  }

  build(): Cart {
    return {
      id: crypto.randomUUID(),
      version: 1,
      totalPrice: {
        currencyCode: this.currencyCode,
        centAmount: this.lineItems.reduce(
          (acc, lineItem) =>
            acc + lineItem.price.value.centAmount * lineItem.quantity,
          0
        ),
        fractionDigits: this.fractionDigits,
        type: 'centPrecision',
      },
      lineItems: this.lineItems,
      custom: {
        type: { typeId: 'type', id: crypto.randomUUID() },
        fields: {
          'dovetech-couponCodes': JSON.stringify(this.couponCodes),
          'dovetech-cartAction': JSON.stringify(this.cartAction),
        },
      },
      customLineItems: [],
      cartState: 'Active',
      taxMode: 'Platform',
      taxRoundingMode: 'HalfEven',
      taxCalculationMode: 'LineItemLevel',
      inventoryMode: 'None',
      shippingMode: 'Single',
      shippingAddress: { country: 'DE' },
      shipping: [],
      discountCodes: [],
      directDiscounts: [],
      itemShippingAddresses: [],
      refusedGifts: [],
      origin: 'Customer',
      createdAt: '2024-10-09T08:33:10.060Z',
      lastModifiedAt: '2024-10-09T08:33:10.060Z',
    };
  }
}
