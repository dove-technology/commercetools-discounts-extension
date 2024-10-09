import { test, expect } from "vitest";
import cartMapper from "./commerce-tools-cart-mapper";
import { CommerceToolsCart } from "./commerce-tools-types";
import { DoveTechDiscountsDataInstance } from "./dovetech-types";

test("single line item mapped correctly", async () => {
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
          value: {
            centAmount: 5000,
            currencyCode,
            fractionDigits: 2,
            type: "centPrecision",
          },
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

test("line item with discounted price mapped correctly", async () => {
  const currencyCode = "USD";

  const commerceToolsCart: CommerceToolsCart = {
    id: "36a9ece3-7fed-4eed-90d6-dce8c7eed5a4",
    version: 1,
    lineItems: [
      {
        id: "26cd7f70-f0ae-46a6-9704-8fce5a05b529",
        productId: "3e468095-1b3d-4ef1-99d5-827dc025a662",
        quantity: 2,
        price: {
          value: {
            centAmount: 5000,
            currencyCode,
            fractionDigits: 2,
            type: "centPrecision",
          },
          discounted: {
            value: {
              centAmount: 4000,
              currencyCode,
              fractionDigits: 2,
              type: "centPrecision",
            },
          },
        },
      },
    ],
    totalPrice: {
      currencyCode,
      centAmount: 8000,
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
  expect(result.basket.items[0].price).toBe(40);
  expect(result.context?.currencyCode).toBe(currencyCode);
  expect(result.settings.commit).toBe(false);
});

test("empty cart mapped correctly", async () => {
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
