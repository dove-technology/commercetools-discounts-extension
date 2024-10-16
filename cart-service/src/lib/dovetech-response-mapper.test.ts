import { it, expect } from 'vitest';
import map from './dovetech-response-mapper';
import {
  AmountOffAction,
  AmountOffType,
  CouponCodeAcceptedAction,
  CouponCodeRejectedAction,
  CouponCodeValidationError,
  DoveTechActionType,
} from './dovetech-types';
import CommerceToolsCartBuilder from './test-helpers/commerce-tools-cart-builder';
import CommerceToolsLineItemBuilder from './test-helpers/commerce-tools-line-item-builder';
import DoveTechResponseBuilder from './test-helpers/dovetech-response-builder';
import {
  AddCouponCodeCartAction,
  CartActionType,
} from './custom-commerce-tools-types';
import { CartSetLineItemTotalPriceAction } from '@commercetools/platform-sdk';
import crypto from 'crypto';

it('should return an no actions if there are no line items', () => {
  const ctCart = new CommerceToolsCartBuilder('USD').build();
  const dtResponse = new DoveTechResponseBuilder().build();

  const result = map(dtResponse, ctCart);

  expect(result).toEqual({
    success: true,
    actions: [],
  });
});

it('should map DoveTech response items to CommerceTools actions', () => {
  const currencyCode = 'USD';
  const originalLineItemCentAmount = 4000;

  // these amounts cause issues when multiplying in Vanilla JavaScript, so using them in the test here
  const amountOff = 2.2;
  const total = 37.8;

  const lineItem = new CommerceToolsLineItemBuilder(
    originalLineItemCentAmount,
    currencyCode
  ).build();

  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addLineItem(lineItem)
    .build();

  const amountOffBasketAction: AmountOffAction =
    buildAmountOffBasketAction(amountOff);

  const dtResponse = new DoveTechResponseBuilder()
    .addAction(amountOffBasketAction)
    .addLineItem({
      totalAmountOff: amountOffBasketAction.amountOff,
      total: total,
      actions: [
        {
          id: amountOffBasketAction.id,
          subItemId: 0,
          amountOff: amountOffBasketAction.amountOff,
        },
      ],
    })
    .build();

  const expectedAction: CartSetLineItemTotalPriceAction = {
    action: 'setLineItemTotalPrice',
    lineItemId: lineItem.id,
    externalTotalPrice: {
      price: {
        currencyCode,
        centAmount: originalLineItemCentAmount,
      },
      totalPrice: {
        currencyCode,
        centAmount: 3780,
      },
    },
  };

  const result = map(dtResponse, ctCart);

  expect(result).toEqual({
    success: true,
    actions: [expectedAction],
  });
});

it.each([
  ['USD', 2, 4000, 3780, 2.2, 37.8],
  ['JPY', 0, 400, 380, 20, 380],
  ['KWD', 3, 40999, 30999, 1.0, 30.999],
])(
  'currency amounts are mapped correctly for %s',
  (
    currencyCode,
    fractionDigits,
    originalLineItemCentAmount,
    discountedLineItemCentAmount,
    amountOff,
    total
  ) => {
    const lineItem = new CommerceToolsLineItemBuilder(
      originalLineItemCentAmount,
      currencyCode,
      fractionDigits
    ).build();

    const ctCart = new CommerceToolsCartBuilder(currencyCode, fractionDigits)
      .addLineItem(lineItem)
      .build();

    const amountOffBasketAction: AmountOffAction =
      buildAmountOffBasketAction(amountOff);

    const dtResponse = new DoveTechResponseBuilder()
      .addAction(amountOffBasketAction)
      .addLineItem({
        totalAmountOff: amountOffBasketAction.amountOff,
        total: total,
        actions: [
          {
            id: amountOffBasketAction.id,
            subItemId: 0,
            amountOff: amountOffBasketAction.amountOff,
          },
        ],
      })
      .build();

    const expectedAction: CartSetLineItemTotalPriceAction = {
      action: 'setLineItemTotalPrice',
      lineItemId: lineItem.id,
      externalTotalPrice: {
        price: {
          currencyCode,
          centAmount: originalLineItemCentAmount,
        },
        totalPrice: {
          currencyCode,
          centAmount: discountedLineItemCentAmount,
        },
      },
    };

    const result = map(dtResponse, ctCart);
    expect(result).toEqual({
      success: true,
      actions: [expectedAction],
    });
  }
);

it('setLineItemTotalPrice actions should be returned if price from Dovetech is different to commerce tools', () => {
  const currencyCode = 'USD';
  const originalLineItemCentAmount = 40000;

  const lineItem = new CommerceToolsLineItemBuilder(
    originalLineItemCentAmount,
    currencyCode
  ).build();

  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addLineItem(lineItem)
    .build();

  const dtResponse = new DoveTechResponseBuilder()
    .addLineItem({
      totalAmountOff: 0,
      total: 30,
      actions: [],
    })
    .build();

  const expectedAction: CartSetLineItemTotalPriceAction = {
    action: 'setLineItemTotalPrice',
    lineItemId: lineItem.id,
    externalTotalPrice: {
      price: {
        currencyCode,
        centAmount: originalLineItemCentAmount,
      },
      totalPrice: {
        currencyCode,
        centAmount: 3000,
      },
    },
  };

  const result = map(dtResponse, ctCart);
  expect(result).toEqual({
    success: true,
    actions: [expectedAction],
  });
});

it('no actions should be returned if price from Dovetech is the same as commerce tools', () => {
  const currencyCode = 'USD';
  const originalLineItemCentAmount = 3000;

  const lineItem = new CommerceToolsLineItemBuilder(
    originalLineItemCentAmount,
    currencyCode
  ).build();

  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addLineItem(lineItem)
    .build();

  const dtResponse = new DoveTechResponseBuilder()
    .addLineItem({
      totalAmountOff: 0,
      total: 30,
      actions: [],
    })
    .build();

  const result = map(dtResponse, ctCart);
  expect(result).toEqual({
    success: true,
    actions: [],
  });
});

it('should map CouponCodeAccepted actions correctly', () => {
  const couponCode = 'TEST_COUPON';
  const addCouponCodeAction: AddCouponCodeCartAction = {
    type: CartActionType.AddCouponCode,
    code: couponCode,
  };

  const ctCart = new CommerceToolsCartBuilder('USD')
    .addCartAction(addCouponCodeAction)
    .build();

  const couponCodeAcceptedAction: CouponCodeAcceptedAction = {
    type: DoveTechActionType.CouponCodeAccepted,
    id: crypto.randomUUID(),
    code: couponCode,
  };

  const dtResponse = new DoveTechResponseBuilder()
    .addAction(couponCodeAcceptedAction)
    .build();

  const result = map(dtResponse, ctCart);

  expect(result).toEqual({
    success: true,
    actions: [
      {
        action: 'setCustomType',
        type: {
          key: 'dovetech-cartMetadata',
          typeId: 'type',
        },
        fields: {
          'dovetech-couponCodes': '[{"code":"TEST_COUPON"}]',
        },
      },
    ],
  });
});

it('CouponCodeRejected action for new coupon code should return error', () => {
  const couponCode = 'INVALID_COUPON';
  const addCouponCodeAction: AddCouponCodeCartAction = {
    type: CartActionType.AddCouponCode,
    code: couponCode,
  };

  const ctCart = new CommerceToolsCartBuilder('USD')
    .addCartAction(addCouponCodeAction)
    .build();

  const couponCodeRejectedAction: CouponCodeRejectedAction = {
    type: DoveTechActionType.CouponCodeRejected,
    id: crypto.randomUUID(),
    code: couponCode,
    reason: CouponCodeValidationError.NotRecognised,
  };

  const dtResponse = new DoveTechResponseBuilder()
    .addAction(couponCodeRejectedAction)
    .build();

  const result = map(dtResponse, ctCart);

  expect(result).toEqual({
    success: false,
    errorResponse: {
      statusCode: 400,
      message: 'Discount code is not applicable',
      errors: [
        {
          code: 'InvalidInput',
          message: 'Discount code is not applicable',
        },
      ],
    },
  });
});

it('CouponCodeRejected action for existing coupon code should remove coupon code', () => {
  const existingCouponCode = 'EXISTING_COUPON';

  const ctCart = new CommerceToolsCartBuilder('USD')
    .addCouponCode({ code: existingCouponCode })
    .build();

  const couponCodeRejectedAction: CouponCodeRejectedAction = {
    type: DoveTechActionType.CouponCodeRejected,
    id: crypto.randomUUID(),
    code: existingCouponCode,
    reason: CouponCodeValidationError.NotRecognised,
  };

  const dtResponse = new DoveTechResponseBuilder()
    .addAction(couponCodeRejectedAction)
    .build();

  const result = map(dtResponse, ctCart);

  expect(result).toEqual({
    success: true,
    actions: [
      {
        action: 'setCustomType',
        type: {
          key: 'dovetech-cartMetadata',
          typeId: 'type',
        },
        fields: {
          'dovetech-couponCodes': '[]',
        },
      },
    ],
  });
});

it('should handle line item with multiple quantity', () => {
  const currencyCode = 'USD';
  const originalLineItemCentAmount = 4000;

  const totalAmountOff = 10;
  const total = 30;

  const lineItem = new CommerceToolsLineItemBuilder(
    originalLineItemCentAmount,
    currencyCode
  )
    .setQuantity(2)
    .build();

  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addLineItem(lineItem)
    .build();

  const amountOffBasketAction: AmountOffAction =
    buildAmountOffBasketAction(totalAmountOff);

  const dtResponse = new DoveTechResponseBuilder()
    .addAction(amountOffBasketAction)
    .addLineItem({
      totalAmountOff: amountOffBasketAction.amountOff,
      total: total,
      actions: [
        {
          id: amountOffBasketAction.id,
          subItemId: 0,
          amountOff: 5,
        },
        {
          id: amountOffBasketAction.id,
          subItemId: 1,
          amountOff: 5,
        },
      ],
    })
    .build();

  const expectedAction: CartSetLineItemTotalPriceAction = {
    action: 'setLineItemTotalPrice',
    lineItemId: lineItem.id,
    externalTotalPrice: {
      price: {
        currencyCode,
        centAmount: originalLineItemCentAmount,
      },
      totalPrice: {
        currencyCode,
        centAmount: 3000,
      },
    },
  };

  const result = map(dtResponse, ctCart);

  expect(result).toEqual({
    success: true,
    actions: [expectedAction],
  });
});

const buildAmountOffBasketAction = (
  amountOff: number,
  value = amountOff
): AmountOffAction => {
  return {
    id: crypto.randomUUID(),
    amountOff: amountOff,
    discountId: crypto.randomUUID(),
    type: DoveTechActionType.AmountOffBasket,
    amountOffType: AmountOffType.AmountOff,
    value,
  };
};
