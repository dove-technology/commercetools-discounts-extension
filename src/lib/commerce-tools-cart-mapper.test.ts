import { test, expect } from "vitest";
import cartMapper from "./commerce-tools-cart-mapper";
import { CommerceToolsCart } from "./commerce-tools-types";
import { DoveTechDiscountsDataInstance } from "./dovetech-types";

test("single line item mapped correctly", async () => {
  const currencyCode = "USD";
  const productId = "3e468095-1b3d-4ef1-99d5-827dc025a662";

  const cartId = "36a9ece3-7fed-4eed-90d6-dce8c7eed5a4";
  const lineItemId = "26cd7f70-f0ae-46a6-9704-8fce5a05b529";
  const productKey = "product-key";
  const productNameLocalisedString = { en: "Product Name" };
  const productSlug = { en: "product-slug" };
  const variant = { sku: "variant-sku" };

  const commerceToolsCart: CommerceToolsCart = {
    id: cartId,
    version: 0,
    lineItems: [
      {
        id: lineItemId,
        productId: productId,
        productKey: productKey,
        name: productNameLocalisedString,
        productSlug: productSlug,
        variant,
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
  const mappedLineItem = result.basket.items[0];
  expect(mappedLineItem.quantity).toBe(2);
  expect(mappedLineItem.price).toBe(50);
  expect(mappedLineItem.productId).toBe(productId);
  expect(mappedLineItem.productKey).toBe(productKey);

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
        productKey: "product-key",
        name: { en: "Product Name" },
        productSlug: { en: "product-slug" },
        variant: { sku: "variant-sku" },
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
