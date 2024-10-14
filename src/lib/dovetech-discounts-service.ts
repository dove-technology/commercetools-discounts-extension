import {
  DoveTechDiscountsRequest,
  DoveTechDiscountsResponse,
} from "./dovetech-types";

export const evaluate = async (
  request: DoveTechDiscountsRequest,
): Promise<DoveTechDiscountsResponse> => {
  const DOVETECH_API_HOST = process.env.DOVETECH_API_HOST;

  if (!DOVETECH_API_HOST) {
    throw new Error("DOVETECH_API_HOST env var is required");
  }

  const DOVETECH_API_KEY = process.env.DOVETECH_API_KEY;

  if (!DOVETECH_API_KEY) {
    throw new Error("DOVETECH_API_KEY env var is required");
  }

  const response = await fetch(`${DOVETECH_API_HOST}/evaluate`, {
    method: "POST",
    headers: {
      "x-api-key": DOVETECH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      `Non ok response from dovetech service. status: ${response.status}`,
    );
  }

  const data: DoveTechDiscountsResponse = await response.json();
  return data;
};
