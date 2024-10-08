import { test, expect } from "vitest";
import cartMapper from "./commerce-tools-cart-mapper";
import { CommerceToolsCart } from "./commerce-tools-types";
import { DoveTechDiscountsDataInstance } from "./dovetech-types";

test("single line item maps correctly", async () => {
  const currencyCode = "USD";

  const commerceToolsCart: CommerceToolsCart = {
    id: "36a9ece3-7fed-4eed-90d6-dce8c7eed5a4",
    version: 0,
    lineItems: [
      {
        id: "26cd7f70-f0ae-46a6-9704-8fce5a05b529",
        productId: "3e468095-1b3d-4ef1-99d5-827dc025a662",
        quantity: 2,
        price: {
          id: "690bed53-09d2-459b-82af-ef70d6330cc3",
          value: {
            centAmount: 5000,
            currencyCode,
            fractionDigits: 2,
            type: "centPrecision",
          },
          country: "US",
        },
      },
    ],
    totalPrice: {
      currencyCode,
      centAmount: 10000,
      fractionDigits: 2,
      type: "centPrecision",
    },
  };

  const result = cartMapper(
    commerceToolsCart,
    DoveTechDiscountsDataInstance.Live,
    false
  );

  expect(result.basket.items).toHaveLength(1);
  expect(result.basket.items[0].quantity).toBe(2);
  expect(result.basket.items[0].price).toBe(50);
  expect(result.context?.currencyCode).toBe(currencyCode);
  expect(result.settings.commit).toBe(false);
});

test("empty cart maps correctly", async () => {
  const currencyCode = "USD";

  const commerceToolsCart: CommerceToolsCart = {
    id: "36a9ece3-7fed-4eed-90d6-dce8c7eed5a4",
    version: 0,
    lineItems: [],
    totalPrice: {
      currencyCode,
      centAmount: 0,
      fractionDigits: 2,
      type: "centPrecision",
    },
  };

  const result = cartMapper(
    commerceToolsCart,
    DoveTechDiscountsDataInstance.Live,
    false
  );

  expect(result.basket.items).toHaveLength(0);
  expect(result.context?.currencyCode).toBe(currencyCode);
  expect(result.settings.commit).toBe(false);
});

// TODO: review tax, shipping, line item totals, different currencies, etc.
