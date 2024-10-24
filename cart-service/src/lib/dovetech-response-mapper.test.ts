import { it, expect } from '@jest/globals';
import map from './dovetech-response-mapper';
import {
  AmountOffAction,
  CouponCodeAcceptedAction,
  CouponCodeRejectedAction,
  CouponCodeValidationError,
  DoveTechActionType,
} from '../types/dovetech.types';
import CommerceToolsCartBuilder from '../test-helpers/commerce-tools-cart-builder';
import CommerceToolsLineItemBuilder from '../test-helpers/commerce-tools-line-item-builder';
import DoveTechResponseBuilder from '../test-helpers/dovetech-response-builder';
import {
  AddCouponCodeCartAction,
  CartActionType,
  CartOrOrder,
} from '../types/custom-commerce-tools.types';
import {
  CartSetLineItemTotalPriceAction,
  CartSetDirectDiscountsAction,
  CartAddCustomLineItemAction,
  CartChangeCustomLineItemMoneyAction,
} from '@commercetools/platform-sdk';
import crypto from 'crypto';
import {
  buildAmountOffBasketAction,
  buildAmountOffCostAction,
} from '../test-helpers/dovetech-action-builders';
import * as cartWithSingleShippingModeDiscounted from '../test-helpers/cart-with-single-shipping-mode-discounted.json';
import * as cartWithSingleShippingModeDirectDiscounts from '../test-helpers/cart-with-single-shipping-mode-direct-discounts.json';
import * as cartWithSingleShippingModeCustomLineItemShippingDiscount from '../test-helpers/cart-with-single-shipping-mode-custom-line-item-shipping-discount.json';
import { getConfig } from '../test-helpers/test-config-helper';
import { SHIPPING_CUSTOM_LINE_ITEM_SLUG } from './cart-constants';
import { SHIPPING_COST_NAME } from './dovetech-property-constants';

it('should return no actions if there are no line items', () => {
  const ctCart = new CommerceToolsCartBuilder('USD').build();
  const dtResponse = new DoveTechResponseBuilder().build();

  const result = map(getConfig(), dtResponse, ctCart);

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

  const result = map(getConfig(), dtResponse, ctCart);

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

    const result = map(getConfig(), dtResponse, ctCart);
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

  const result = map(getConfig(), dtResponse, ctCart);
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

  const result = map(getConfig(), dtResponse, ctCart);
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

  const result = map(getConfig(), dtResponse, ctCart);

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

  const result = map(getConfig(), dtResponse, ctCart);

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

  const result = map(getConfig(), dtResponse, ctCart);

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

  const result = map(getConfig(), dtResponse, ctCart);

  expect(result).toEqual({
    success: true,
    actions: [expectedAction],
  });
});

it('no actions should be returned if type is Order', () => {
  const currencyCode = 'USD';
  const originalLineItemCentAmount = 40000;

  const lineItem = new CommerceToolsLineItemBuilder(
    originalLineItemCentAmount,
    currencyCode
  ).build();

  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addLineItem(lineItem)
    .setType('Order')
    .build();

  const dtResponse = new DoveTechResponseBuilder()
    .addLineItem({
      totalAmountOff: 0,
      total: 30,
      actions: [],
    })
    .build();

  const result = map(getConfig(), dtResponse, ctCart);

  expect(result).toEqual({
    success: true,
    actions: [],
  });
});

describe('shipping costs - direct discounts enabled', () => {
  it('should return set direct discounts action if shipping cost returned', () => {
    const ctCart = cartWithSingleShippingModeDiscounted as CartOrOrder;

    const amountOffInCurrencyUnits = 2.2;

    // original shipping amount is 10000

    const amountOffCostAction: AmountOffAction = buildAmountOffCostAction(
      amountOffInCurrencyUnits
    );

    const dtResponse = new DoveTechResponseBuilder()
      .addAction(amountOffCostAction)
      .addLineItem({
        totalAmountOff: 0,
        total: 52.99,
        actions: [],
      })
      .addCost({
        totalAmountOff: amountOffInCurrencyUnits,
        name: SHIPPING_COST_NAME,
        value: 97.8,
      })
      .build();

    const result = map(getConfig(), dtResponse, ctCart);

    const expectedAction: CartSetDirectDiscountsAction = {
      action: 'setDirectDiscounts',
      discounts: [
        {
          value: {
            type: 'absolute',
            money: [
              {
                centAmount: 220,
                currencyCode: 'EUR',
              },
            ],
          },
          target: {
            type: 'shipping',
          },
        },
      ],
    };

    expect(result).toEqual({
      success: true,
      actions: [expectedAction],
    });
  });

  it('should return empty direct discounts action if cart has direct discounts and no shipping cost returned', () => {
    const ctCart = cartWithSingleShippingModeDirectDiscounts as CartOrOrder;

    const dtResponse = new DoveTechResponseBuilder()
      .addLineItem({
        totalAmountOff: 0,
        total: 52.99,
        actions: [],
      })
      .build();

    const result = map(getConfig(), dtResponse, ctCart);

    const expectedAction: CartSetDirectDiscountsAction = {
      action: 'setDirectDiscounts',
      discounts: [],
    };

    expect(result).toEqual({
      success: true,
      actions: [expectedAction],
    });
  });

  it('should return no direct discounts action if cart has no direct discounts and no shipping cost returned', () => {
    const ctCart = cartWithSingleShippingModeDiscounted as CartOrOrder;

    const dtResponse = new DoveTechResponseBuilder()
      .addLineItem({
        totalAmountOff: 0,
        total: 52.99,
        actions: [],
      })
      .build();

    const result = map(getConfig(), dtResponse, ctCart);

    expect(result).toEqual({
      success: true,
      actions: [],
    });
  });
});

describe('shipping costs - direct discounts not enabled', () => {
  const customLineItemConfig = getConfig({
    useDirectDiscountsForShipping: false,
    taxCategoryId: '683b1494-4a49-4848-8897-24347b32127e',
  });

  it('should return add custom line item action if shipping cost returned', () => {
    const ctCart = cartWithSingleShippingModeDiscounted as CartOrOrder;

    const amountOffInCurrencyUnits = 2.2;

    // original shipping amount is 10000

    const amountOffCostAction: AmountOffAction = buildAmountOffCostAction(
      amountOffInCurrencyUnits
    );

    const dtResponse = new DoveTechResponseBuilder()
      .addAction(amountOffCostAction)
      .addLineItem({
        totalAmountOff: 0,
        total: 52.99,
        actions: [],
      })
      .addCost({
        totalAmountOff: amountOffInCurrencyUnits,
        name: SHIPPING_COST_NAME,
        value: 97.8,
      })
      .build();

    const result = map(customLineItemConfig, dtResponse, ctCart);

    const expectedAction: CartAddCustomLineItemAction = {
      action: 'addCustomLineItem',
      name: { en: 'Shipping Discount' },
      quantity: 1,
      money: {
        currencyCode: 'EUR',
        type: 'centPrecision',
        centAmount: -220,
      },
      slug: SHIPPING_CUSTOM_LINE_ITEM_SLUG,
      taxCategory: {
        id: customLineItemConfig.taxCategoryId,
        typeId: 'tax-category',
      },
    };

    expect(result).toEqual({
      success: true,
      actions: [expectedAction],
    });
  });

  it('should return change custom custom line item money if shipping cost returned and existing custom line item', () => {
    const ctCart =
      cartWithSingleShippingModeCustomLineItemShippingDiscount as CartOrOrder;

    const amountOffInCurrencyUnits = 2.2;

    // original shipping amount is 10000

    const amountOffCostAction: AmountOffAction = buildAmountOffCostAction(
      amountOffInCurrencyUnits
    );

    const dtResponse = new DoveTechResponseBuilder()
      .addAction(amountOffCostAction)
      .addLineItem({
        totalAmountOff: 0,
        total: 52.99,
        actions: [],
      })
      .addCost({
        totalAmountOff: amountOffInCurrencyUnits,
        name: SHIPPING_COST_NAME,
        value: 97.8,
      })
      .build();

    const result = map(customLineItemConfig, dtResponse, ctCart);

    const expectedAction: CartChangeCustomLineItemMoneyAction = {
      action: 'changeCustomLineItemMoney',
      customLineItemId: '75ce6989-14c8-4329-b2b2-011c1776c851',
      money: {
        currencyCode: 'EUR',
        centAmount: -220,
      },
    };

    expect(result).toEqual({
      success: true,
      actions: [expectedAction],
    });
  });

  it('should return remove custom line item action if custom line item exists and no shipping cost returned', () => {
    const ctCart =
      cartWithSingleShippingModeCustomLineItemShippingDiscount as CartOrOrder;

    const dtResponse = new DoveTechResponseBuilder()
      .addLineItem({
        totalAmountOff: 0,
        total: 52.99,
        actions: [],
      })
      .build();

    const result = map(customLineItemConfig, dtResponse, ctCart);

    expect(result).toEqual({
      success: true,
      actions: [
        {
          action: 'removeCustomLineItem',
          customLineItemId: '75ce6989-14c8-4329-b2b2-011c1776c851',
        },
      ],
    });
  });

  it('should return no custom line item action if no custom line item exists and no shipping cost returned', () => {
    const ctCart = cartWithSingleShippingModeDiscounted as CartOrOrder;

    const dtResponse = new DoveTechResponseBuilder()
      .addLineItem({
        totalAmountOff: 0,
        total: 52.99,
        actions: [],
      })
      .build();

    const result = map(customLineItemConfig, dtResponse, ctCart);

    expect(result).toEqual({
      success: true,
      actions: [],
    });
  });
});
