import { it, expect } from "vitest";
import map from "./dovetech-response-mapper";
import type { SetLineItemTotalPriceAction } from "./commerce-tools-types";
import type {
  DoveTechDiscountsResponse,
  DoveTechDiscountsResponseLineItem,
} from "./dovetech-types";
import CommerceToolsCartBuilder from "./test-helpers/commerce-tools-cart-builder";

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
  const ctCart = new CommerceToolsCartBuilder("USD")
    .addBasicLineItem(40000)
    .build();

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

  const expectedAction: SetLineItemTotalPriceAction = {
    action: "setLineItemTotalPrice",
    lineItemId: "74b79e43-ec38-4a99-88a5-e2f6cec9d749",
    externalTotalPrice: {
      price: {
        currencyCode: "USD",
        centAmount: 40000,
      },
      totalPrice: {
        currencyCode: "USD",
        centAmount: 3780,
      },
    },
  };

  const result = map(dtResponse, ctCart);
  expect(result).toEqual([expectedAction]);
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
