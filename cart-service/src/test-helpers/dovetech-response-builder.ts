import {
  DoveTechAction,
  DoveTechDiscountsResponse,
  DoveTechDiscountsResponseBasket,
  DoveTechDiscountsResponseCost,
  DoveTechDiscountsResponseLineItem,
} from '../types/dovetech.types';

export default class DoveTechResponseBuilder {
  private basket: DoveTechDiscountsResponseBasket | null = null;
  private actions: DoveTechAction[] = [];
  private costs: DoveTechDiscountsResponseCost[] = [];

  addAction(action: DoveTechAction) {
    this.actions.push(action);
    return this;
  }

  addLineItem(lineItem: DoveTechDiscountsResponseLineItem) {
    if (!this.basket) {
      this.basket = {
        total: 0,
        totalAmountOff: 0,
        items: [],
      };
    }

    this.basket.items.push(lineItem);
    this.basket.total += lineItem.total;
    this.basket.totalAmountOff += lineItem.totalAmountOff;

    return this;
  }

  addCost(cost: DoveTechDiscountsResponseCost) {
    this.costs.push(cost);
    return this;
  }

  build(): DoveTechDiscountsResponse {
    return {
      actions: this.actions,
      basket: this.basket,
      commitId: null,
      aggregates: {
        total: this.basket ? this.basket.total : 0,
        totalAmountOff: this.basket ? this.basket.totalAmountOff : 0,
      },
      costs: this.costs,
    };
  }
}
