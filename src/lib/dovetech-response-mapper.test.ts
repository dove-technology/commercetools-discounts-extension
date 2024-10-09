import { it, expect } from "vitest";
import map from "./dovetech-response-mapper";
import type {
  CommerceToolsCart,
  CommerceToolsLineItem,
  SetLineItemTotalPriceAction,
} from "./commerce-tools-types";
import type {
  DoveTechDiscountsResponse,
  DoveTechDiscountsResponseLineItem,
} from "./dovetech-types";

it("should return an no actions if there are no items in the DoveTech response", () => {
  const commerceToolsCart: CommerceToolsCart = {
    id: "71574d33-b6a5-4b15-8160-ed1a9e18003a",
    version: 1,
    totalPrice: {
      currencyCode: "USD",
      centAmount: 0,
      fractionDigits: 2,
      type: "centPrecision",
    },
    lineItems: [],
  };

  const dtResponse: DoveTechDiscountsResponse = {
    basket: { items: [], total: 0, totalAmountOff: 0 },
    actions: [],
    commitId: null,
    aggregates: { total: 0, totalAmountOff: 0 },
    costs: [],
  };

  const result = map(dtResponse, commerceToolsCart);
  expect(result).toEqual([]);
});

it("should map DoveTech response items to CommerceTools actions", () => {
  const commerceToolsCart: CommerceToolsCart = {
    id: "71574d33-b6a5-4b15-8160-ed1a9e18003a",
    version: 1,
    totalPrice: {
      currencyCode: "USD",
      centAmount: 1000,
      fractionDigits: 2,
      type: "centPrecision",
    },
    lineItems: [
      {
        id: "lineItem1",
        price: { value: { centAmount: 1000 } },
        quantity: 1,
      } as CommerceToolsLineItem,
    ],
  };

  const dtResponse: DoveTechDiscountsResponse = {
    basket: {
      total: 8.0,
      totalAmountOff: 2.0,
      items: [
        {
          totalAmountOff: 2.0,
          total: 8.0,
        } as DoveTechDiscountsResponseLineItem,
      ],
    },
    actions: [], // TODO: should be set
    commitId: null,
    aggregates: { total: 8.0, totalAmountOff: 2.0 },
    costs: [],
  };

  const expectedAction: SetLineItemTotalPriceAction = {
    action: "setLineItemTotalPrice",
    lineItemId: "lineItem1",
    externalTotalPrice: {
      price: {
        currencyCode: "USD",
        centAmount: 1000,
      },
      totalPrice: {
        currencyCode: "USD",
        centAmount: 800,
      },
    },
  };

  const result = map(dtResponse, commerceToolsCart);
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
