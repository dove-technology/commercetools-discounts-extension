import {
  CommerceToolsLineItem,
  LocalizedString,
} from "../commerce-tools-types";
import crypto from "crypto";

export default class CommerceToolsLineItemBuilder {
  private id: string = crypto.randomUUID();
  private productId: string = crypto.randomUUID();
  private productKey: string = "product1";
  private quantity: number = 1;
  private name: LocalizedString = { en: "Product 1" };
  private productSlug: LocalizedString = { en: "product-1" };
  private sku: string = "variant-1";

  constructor(
    private readonly centAmount: number,
    private readonly currencyCode: string,
    private readonly fractionDigits: number = 2
  ) {}

  setId(id: string): this {
    this.id = id;
    return this;
  }

  setProductId(productId: string): this {
    this.productId = productId;
    return this;
  }

  setProductKey(productKey: string): this {
    this.productKey = productKey;
    return this;
  }

  setQuantity(quantity: number): this {
    this.quantity = quantity;
    return this;
  }

  setName(name: LocalizedString): this {
    this.name = name;
    return this;
  }

  setProductSlug(productSlug: LocalizedString): this {
    this.productSlug = productSlug;
    return this;
  }

  setSku(sku: string): this {
    this.sku = sku;
    return this;
  }

  build(): CommerceToolsLineItem {
    return {
      id: this.id,
      productId: this.productId,
      productKey: this.productKey,
      quantity: this.quantity,
      name: this.name,
      productSlug: this.productSlug,
      variant: {
        sku: this.sku,
      },
      price: {
        value: {
          centAmount: this.centAmount,
          currencyCode: this.currencyCode,
          fractionDigits: this.fractionDigits,
          type: "centPrecision",
        },
      },
    };
  }
}
