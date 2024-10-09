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

  addLineItem(lineItem: CommerceToolsLineItem): this {
    if (lineItem.price.value.currencyCode !== this.currencyCode) {
      throw new Error(
        `Currency code of line item price ${lineItem.price.value.currencyCode} does not match the currency code of the cart ${this.currencyCode}`
      );
    }

    if (lineItem.price.value.fractionDigits !== this.fractionDigits) {
      throw new Error(
        `Fraction digits of line item price ${lineItem.price.value.fractionDigits} does not match the fraction digits of the cart ${this.fractionDigits}`
      );
    }

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
