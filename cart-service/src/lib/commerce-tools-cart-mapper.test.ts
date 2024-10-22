import { test, expect } from '@jest/globals';
import cartMapper from './commerce-tools-cart-mapper';
import { DoveTechDiscountsDataInstance } from '../types/dovetech.types';
import CommerceToolsCartBuilder from '../test-helpers/commerce-tools-cart-builder';
import CommerceToolsLineItemBuilder from '../test-helpers/commerce-tools-line-item-builder';
import {
  AddCouponCodeCartAction,
  CartActionType,
  CartOrOrder,
} from '../types/custom-commerce-tools.types';
import * as cartWithSingleShippingMode from '../test-helpers/cart-with-single-shipping-mode.json';

test('single line item mapped correctly', async () => {
  const currencyCode = 'USD';
  const originalLineItemCentAmount = 5000;

  const lineItem = new CommerceToolsLineItemBuilder(
    originalLineItemCentAmount,
    currencyCode
  )
    .setQuantity(2)
    .build();

  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addLineItem(lineItem)
    .build();

  const result = cartMapper(ctCart, DoveTechDiscountsDataInstance.Live);

  expect(result.basket.items).toHaveLength(1);
  const mappedLineItem = result.basket.items[0];
  expect(mappedLineItem.quantity).toBe(2);
  expect(mappedLineItem.price).toBe(50);
  expect(mappedLineItem.productId).toBe(lineItem.productId);
  expect(mappedLineItem.productKey).toBe(lineItem.productKey);

  expect(result.context?.currencyCode).toBe(currencyCode);
  expect(result.settings.commit).toBe(false);
});

test('line item with discounted price mapped correctly', async () => {
  const currencyCode = 'USD';
  const originalLineItemCentAmount = 5000;

  const lineItem = new CommerceToolsLineItemBuilder(
    originalLineItemCentAmount,
    currencyCode
  )
    .setDiscountedPrice(4000)
    .setQuantity(2)
    .build();

  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addLineItem(lineItem)
    .build();

  const result = cartMapper(ctCart, DoveTechDiscountsDataInstance.Live);

  expect(result.basket.items).toHaveLength(1);
  expect(result.basket.items[0].quantity).toBe(2);
  expect(result.basket.items[0].price).toBe(40);
  expect(result.context?.currencyCode).toBe(currencyCode);
  expect(result.settings.commit).toBe(false);
});

test('empty cart mapped correctly', async () => {
  const currencyCode = 'USD';

  const ctCart = new CommerceToolsCartBuilder(currencyCode).build();

  const result = cartMapper(ctCart, DoveTechDiscountsDataInstance.Live);

  expect(result.basket.items).toHaveLength(0);
  expect(result.context?.currencyCode).toBe(currencyCode);
  expect(result.settings.commit).toBe(false);
});

test('new coupon code mapped correctly', async () => {
  const currencyCode = 'USD';

  const addCouponCodeAction: AddCouponCodeCartAction = {
    type: CartActionType.AddCouponCode,
    code: 'TEST_COUPON',
  };
  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addCartAction(addCouponCodeAction)
    .build();

  const result = cartMapper(ctCart, DoveTechDiscountsDataInstance.Live);

  expect(result.couponCodes).toHaveLength(1);
  expect(result.couponCodes![0].code).toBe('TEST_COUPON');
});

test('existing coupon codes mapped correctly', async () => {
  const currencyCode = 'USD';

  const addCouponCodeAction: AddCouponCodeCartAction = {
    type: CartActionType.AddCouponCode,
    code: 'NEW_COUPON',
  };
  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addCartAction(addCouponCodeAction)
    .addCouponCode({ code: 'EXISTING_COUPON' })
    .build();

  const result = cartMapper(ctCart, DoveTechDiscountsDataInstance.Live);

  expect(result.couponCodes).toHaveLength(2);
  expect(result.couponCodes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: 'NEW_COUPON' }),
      expect.objectContaining({ code: 'EXISTING_COUPON' }),
    ])
  );
});

test.each([
  ['USD', 2, 5097, 50.97],
  ['JPY', 0, 5097, 5097],
  ['KWD', 3, 5000, 5],
])(
  'line item with price with %s currency and %d fractional digits mapped correctly',
  async (
    currencyCode,
    fractionDigits,
    originalLineItemCentAmount,
    expectedPrice
  ) => {
    const lineItem = new CommerceToolsLineItemBuilder(
      originalLineItemCentAmount,
      currencyCode,
      fractionDigits
    ).build();

    const ctCart = new CommerceToolsCartBuilder(currencyCode, fractionDigits)
      .addLineItem(lineItem)
      .build();

    const result = cartMapper(ctCart, DoveTechDiscountsDataInstance.Live);

    expect(result.basket.items).toHaveLength(1);
    expect(result.basket.items[0].price).toBe(expectedPrice);
    expect(result.context?.currencyCode).toBe(currencyCode);
  }
);

test('should set commit to true when type is Order', async () => {
  const currencyCode = 'USD';

  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .setType('Order')
    .build();

  const result = cartMapper(ctCart, DoveTechDiscountsDataInstance.Live);

  expect(result.settings.commit).toBe(true);
});

test('should map shipping info when cart shipping mode is single', async () => {
  const ctCart = cartWithSingleShippingMode as CartOrOrder;

  const result = cartMapper(ctCart, DoveTechDiscountsDataInstance.Live);

  expect(result.costs).toHaveLength(1);
  expect(result.costs![0].name).toBe('Shipping');
  expect(result.costs![0].value).toBe(100);
});
