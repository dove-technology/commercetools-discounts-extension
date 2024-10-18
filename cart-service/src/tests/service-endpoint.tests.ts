import { expect } from '@jest/globals';
import request from 'supertest';
import app from '../app';
import fetchMock from 'jest-fetch-mock';
import CommerceToolsCartBuilder from '../test-helpers/commerce-tools-cart-builder';
import { readConfiguration } from '../../src/utils/config.utils';
import DoveTechResponseBuilder from '../test-helpers/dovetech-response-builder';
import {
  AmountOffAction,
  CouponCodeAcceptedAction,
  DoveTechActionType,
} from '../types/dovetech.types';
import CommerceToolsLineItemBuilder from '../test-helpers/commerce-tools-line-item-builder';
import {
  CartSetLineItemTotalPriceAction,
  CartSetCustomTypeAction,
  Cart,
} from '@commercetools/platform-sdk';
import {
  AddCouponCodeCartAction,
  CartActionType,
} from '../types/custom-commerce-tools.types';
import { buildAmountOffBasketAction } from '../test-helpers/dovetech-action-builders';
jest.mock('../../src/utils/config.utils');

beforeEach(() => {
  (readConfiguration as jest.Mock).mockClear();
  fetchMock.resetMocks();
});

test('should return empty actions when Dovetech service returns no discounts', async () => {
  const dtResponse = new DoveTechResponseBuilder().build();
  fetchMock.mockResponseOnce(JSON.stringify(dtResponse));

  const ctCart = new CommerceToolsCartBuilder('USD').build();

  const response = await postCart(ctCart);

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    actions: [],
  });
});

test('should return set item price actions when Dovetech service returns discounted basket', async () => {
  const currencyCode = 'USD';
  const originalLineItemCentAmount = 4000;

  const amountOff = 2;
  const total = 38;

  const lineItem = new CommerceToolsLineItemBuilder(
    originalLineItemCentAmount,
    currencyCode
  ).build();

  const ctCart = new CommerceToolsCartBuilder(currencyCode)
    .addLineItem(lineItem)
    .build();

  const amountOffBasketAction: AmountOffAction =
    buildAmountOffBasketAction(amountOff);

  const dtResponse = new DoveTechResponseBuilder()
    .addAction(amountOffBasketAction)
    .addLineItem({
      totalAmountOff: amountOffBasketAction.amountOff,
      total: total,
      actions: [
        {
          id: amountOffBasketAction.id,
          subItemId: 0,
          amountOff: amountOffBasketAction.amountOff,
        },
      ],
    })
    .build();

  fetchMock.mockResponseOnce(JSON.stringify(dtResponse));

  const response = await postCart(ctCart);

  expect(response.status).toBe(200);

  const expectedAction: CartSetLineItemTotalPriceAction = {
    action: 'setLineItemTotalPrice',
    lineItemId: lineItem.id,
    externalTotalPrice: {
      price: {
        currencyCode,
        centAmount: originalLineItemCentAmount,
      },
      totalPrice: {
        currencyCode,
        centAmount: 3800,
      },
    },
  };

  expect(response.body).toEqual({
    actions: [expectedAction],
  });
});

test('should return action to set coupon codes on cart when Dovetech service returns coupon code accepted action', async () => {
  const couponCode = 'TEST_COUPON';
  const addCouponCodeAction: AddCouponCodeCartAction = {
    type: CartActionType.AddCouponCode,
    code: couponCode,
  };

  const ctCart = new CommerceToolsCartBuilder('USD')
    .addCartAction(addCouponCodeAction)
    .build();

  const couponCodeAcceptedAction: CouponCodeAcceptedAction = {
    type: DoveTechActionType.CouponCodeAccepted,
    id: crypto.randomUUID(),
    code: couponCode,
  };

  const dtResponse = new DoveTechResponseBuilder()
    .addAction(couponCodeAcceptedAction)
    .build();

  fetchMock.mockResponseOnce(JSON.stringify(dtResponse));

  const response = await postCart(ctCart);

  expect(response.status).toBe(200);

  const expectedAction: CartSetCustomTypeAction = {
    action: 'setCustomType',
    type: {
      key: 'dovetech-cartMetadata',
      typeId: 'type',
    },
    fields: {
      'dovetech-couponCodes': '[{"code":"TEST_COUPON"}]',
    },
  };

  expect(response.body).toEqual({
    actions: [expectedAction],
  });
});

test('should return 404 when non existing route', async () => {
  const response = await request(app).post('/does-not-exist');
  expect(response.status).toBe(404);
  expect(response.body).toEqual({
    message: 'Path not found.',
  });
});

test('should return 400 bad request when post invalid resource', async () => {
  const response = await request(app).post('/cart-service').send({});

  expect(response.status).toBe(400);
  expect(response.body).toEqual({
    message: 'Bad request - Missing resource object.',
  });
});

test('should return empty actions when Dovetech service returns 400', async () => {
  const dtResponse = {
    type: 'https://httpstatuses.io/400',
    title: 'Bad Request',
    status: 400,
    detail:
      "A currency code of 'Invalid' doesn't match any currencies in the project",
  };

  fetchMock.mockResponseOnce(JSON.stringify(dtResponse), { status: 400 });

  const ctCart = new CommerceToolsCartBuilder('USD').build();

  const response = await postCart(ctCart);

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    actions: [],
  });
});

test('should return empty actions when Dovetech service returns 500', async () => {
  fetchMock.mockResponseOnce('', { status: 500 });

  const ctCart = new CommerceToolsCartBuilder('USD').build();

  const response = await postCart(ctCart);

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    actions: [],
  });
});

const postCart = async (ctCart: Cart) => {
  return await request(app)
    .post('/cart-service')
    .send({
      resource: {
        obj: ctCart,
      },
    });
};
