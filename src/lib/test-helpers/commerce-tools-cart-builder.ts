import {
  CommerceToolsCart,
  CommerceToolsLineItem,
} from "../commerce-tools-types";

export default class CommerceToolsCartBuilder {
  private lineItems: CommerceToolsLineItem[] = [];

  constructor(
    private readonly currencyCode: string,
    private readonly fractionDigits: number = 2
  ) {}

  addBasicLineItem(centAmount: number, quantity: number = 1): this {
    this.lineItems.push({
      id: "74b79e43-ec38-4a99-88a5-e2f6cec9d749",
      productId: "a926d9c8-6250-46a4-8e50-5336f8debd17",
      productKey: "product1",
      quantity,
      name: {
        en: "Product 1",
      },
      productSlug: {
        en: "product-1",
      },
      variant: {
        sku: "variant-1",
      },
      price: {
        value: {
          centAmount,
          currencyCode: "GBP",
          fractionDigits: 2,
          type: "centPrecision",
        },
      },
    });
    return this;
  }

  addLineItem(lineItem: CommerceToolsLineItem): this {
    this.lineItems.push(lineItem);
    return this;
  }

  build(): CommerceToolsCart {
    return {
      id: "25427c1a-7148-4f56-a5b5-c7552d0223d5",
      version: 1,
      totalPrice: {
        currencyCode: this.currencyCode,
        centAmount: this.lineItems.reduce(
          (acc, lineItem) =>
            acc + lineItem.price.value.centAmount * lineItem.quantity,
          0
        ),
        fractionDigits: this.fractionDigits,
        type: "centPrecision",
      },
      lineItems: this.lineItems,
    };
  }
}
