import { it, expect } from "vitest";
import map from "./dovetech-response-mapper";
import type {
  DoveTechDiscountsResponse,
  DoveTechDiscountsResponseLineItem,
} from "./dovetech-types";
import CommerceToolsCartBuilder from "./test-helpers/commerce-tools-cart-builder";
import CommerceToolsLineItemBuilder from "./test-helpers/commerce-tools-line-item-builder";
import {
  AddCouponCodeCartAction,
  CartActionType,
} from "./custom-commerce-tools-types";
import { CartSetLineItemTotalPriceAction } from "@commercetools/platform-sdk";

it("should return an no actions if there are no items in the DoveTech response", () => {
  const ctCart = new CommerceToolsCartBuilder("USD").build();

  const dtResponse: DoveTechDiscountsResponse = {
    basket: { items: [], total: 0, totalAmountOff: 0 },
    actions: [],
    commitId: null,
    aggregates: { total: 0, totalAmountOff: 0 },
    costs: [],
  };

  const result = map(dtResponse, ctCart);
  expect(result).toEqual([]);
});

it("should map DoveTech response items to CommerceTools actions", () => {
  const currencyCode = "USD";
  const originalLineItemCentAmount = 40000;

  const lineItem = new CommerceToolsLineItemBuilder(
    originalLineItemCentAmount,
    currencyCode
  ).build();

  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addLineItem(lineItem)
    .build();

  // these amounts cause issues when multiplying in Vanilla JavaScript, so using them in the test here
  const dtResponse: DoveTechDiscountsResponse = {
    basket: {
      totalAmountOff: 2.2,
      total: 37.8,
      items: [
        {
          totalAmountOff: 2.2,
          total: 37.8,
        } as DoveTechDiscountsResponseLineItem,
      ],
    },
    actions: [], // TODO: should be set
    commitId: null,
    aggregates: { total: 37.8, totalAmountOff: 2.2 },
    costs: [],
  };

  const expectedAction: CartSetLineItemTotalPriceAction = {
    action: "setLineItemTotalPrice",
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
  expect(result).toEqual([expectedAction]);
});

it("should map CouponCodeAccepted actions correctly", () => {
  const couponCode = "TEST_COUPON";
  const addCouponCodeAction: AddCouponCodeCartAction = {
    type: CartActionType.AddCouponCode,
    code: couponCode,
  };

  const ctCart = new CommerceToolsCartBuilder("USD")
    .addCartAction(addCouponCodeAction)
    .build();

  const dtResponse: DoveTechDiscountsResponse = {
    basket: { items: [], total: 0, totalAmountOff: 0 },
    actions: [
      {
        type: "CouponCodeAccepted",
        id: "404bea14-94ca-401e-8958-bf9ce0b88748",
        code: couponCode,
      },
    ],
    commitId: null,
    aggregates: { total: 0, totalAmountOff: 0 },
    costs: [],
  };

  const result = map(dtResponse, ctCart);

  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        action: "setCustomType",
        type: {
          key: "dovetech-cartMetadata",
          typeId: "type",
        },
        fields: {
          "dovetech-couponCodes": '[{"code":"TEST_COUPON"}]',
        },
      }),
    ])
  );
});

it("CouponCodeRejected action for new coupon code should return error", () => {
  const couponCode = "INVALID_COUPON";
  const addCouponCodeAction: AddCouponCodeCartAction = {
    type: CartActionType.AddCouponCode,
    code: couponCode,
  };

  const ctCart = new CommerceToolsCartBuilder("USD")
    .addCartAction(addCouponCodeAction)
    .build();

  const dtResponse: DoveTechDiscountsResponse = {
    basket: { items: [], total: 0, totalAmountOff: 0 },
    actions: [
      {
        type: "CouponCodeRejected",
        id: "404bea14-94ca-401e-8958-bf9ce0b88748",
        code: couponCode,
        reason: "Coupon code not valid",
      },
    ],
    commitId: null,
    aggregates: { total: 0, totalAmountOff: 0 },
    costs: [],
  };

  const result = map(dtResponse, ctCart);
  expect(result).toEqual({
    statusCode: 400,
    message: "Discount code is not applicable",
    errors: [
      {
        code: "InvalidInput",
        message: "Discount code is not applicable",
      },
    ],
  });
});

it("CouponCodeRejected action for existing coupon code should remove coupon code", () => {
  const existingCouponCode = "EXISTING_COUPON";

  const ctCart = new CommerceToolsCartBuilder("USD")
    .addCouponCode({ code: existingCouponCode })
    .build();

  const dtResponse: DoveTechDiscountsResponse = {
    basket: { items: [], total: 0, totalAmountOff: 0 },
    actions: [
      {
        type: "CouponCodeRejected",
        id: "404bea14-94ca-401e-8958-bf9ce0b88748",
        code: existingCouponCode,
        reason: "Coupon code not valid",
      },
    ],
    commitId: null,
    aggregates: { total: 0, totalAmountOff: 0 },
    costs: [],
  };

  const result = map(dtResponse, ctCart);

  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        action: "setCustomType",
        type: {
          key: "dovetech-cartMetadata",
          typeId: "type",
        },
        fields: {
          "dovetech-couponCodes": "[]",
        },
      }),
    ])
  );
});

//   it("should filter out items with no totalAmountOff", () => {
//     const dtResponse: DoveTechDiscountsResponse = {
//       basket: {
//         items: [
//           { totalAmountOff: 0, total: 10 } as DoveTechDiscountsResponseLineItem,
//           { totalAmountOff: 5, total: 20 } as DoveTechDiscountsResponseLineItem,
//         ],
//       },
//     };
//     const commerceToolsCart: CommerceToolsCart = {
//       totalPrice: { currencyCode: "USD" },
//       lineItems: [
//         {
//           id: "lineItem1",
//           price: { value: { centAmount: 1000 } },
//         } as CommerceToolsLineItem,
//         {
//           id: "lineItem2",
//           price: { value: { centAmount: 2000 } },
//         } as CommerceToolsLineItem,
//       ],
//     };

//     const expectedAction: SetLineItemTotalPriceAction = {
//       action: "setLineItemTotalPrice",
//       lineItemId: "lineItem2",
//       externalTotalPrice: {
//         price: {
//           currencyCode: "USD",
//           centAmount: 2000,
//         },
//         totalPrice: {
//           currencyCode: "USD",
//           centAmount: 2000,
//         },
//       },
//     };

//     const result = map(dtResponse, commerceToolsCart);
//     expect(result).toEqual([expectedAction]);
//   });

//   it("should handle multiple items correctly", () => {
//     const dtResponse: DoveTechDiscountsResponse = {
//       basket: {
//         items: [
//           { totalAmountOff: 5, total: 10 } as DoveTechDiscountsResponseLineItem,
//           {
//             totalAmountOff: 10,
//             total: 20,
//           } as DoveTechDiscountsResponseLineItem,
//         ],
//       },
//     };
//     const commerceToolsCart: CommerceToolsCart = {
//       totalPrice: { currencyCode: "USD" },
//       lineItems: [
//         {
//           id: "lineItem1",
//           price: { value: { centAmount: 1000 } },
//         } as CommerceToolsLineItem,
//         {
//           id: "lineItem2",
//           price: { value: { centAmount: 2000 } },
//         } as CommerceToolsLineItem,
//       ],
//     };

//     const expectedActions: SetLineItemTotalPriceAction[] = [
//       {
//         action: "setLineItemTotalPrice",
//         lineItemId: "lineItem1",
//         externalTotalPrice: {
//           price: {
//             currencyCode: "USD",
//             centAmount: 1000,
//           },
//           totalPrice: {
//             currencyCode: "USD",
//             centAmount: 1000,
//           },
//         },
//       },
//       {
//         action: "setLineItemTotalPrice",
//         lineItemId: "lineItem2",
//         externalTotalPrice: {
//           price: {
//             currencyCode: "USD",
//             centAmount: 2000,
//           },
//           totalPrice: {
//             currencyCode: "USD",
//             centAmount: 2000,
//           },
//         },
//       },
//     ];

//     const result = map(dtResponse, commerceToolsCart);
//     expect(result).toEqual(expectedActions);
//   });
