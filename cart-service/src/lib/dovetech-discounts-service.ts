import { Configuration } from '../types/index.types';
import {
  DoveTechDiscountsRequest,
  DoveTechDiscountsResponse,
} from '../types/dovetech-types';

export const evaluate = async (
  configuration: Configuration,
  request: DoveTechDiscountsRequest
): Promise<DoveTechDiscountsResponse> => {
  const response = await fetch(`${configuration.dovetechApiHost}/evaluate`, {
    method: 'POST',
    headers: {
      'x-api-key': configuration.dovetechApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      `Non ok response from dovetech service. status: ${response.status}`
    );
  }

  const data: DoveTechDiscountsResponse = await response.json();
  return data;
};
