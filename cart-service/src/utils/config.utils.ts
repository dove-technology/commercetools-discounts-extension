import CustomError from '../errors/custom.error';
import type { Configuration } from '../types/index.types';
import envValidators from '../validators/env.validators';
import { getValidateMessages } from '../validators/helpers.validators';

export const readConfiguration = (): Configuration => {
  const envVars = {
    clientId: process.env.CTP_CLIENT_ID as string,
    clientSecret: process.env.CTP_CLIENT_SECRET as string,
    projectKey: process.env.CTP_PROJECT_KEY as string,
    scopes: process.env.CTP_SCOPES as string,
    region: process.env.CTP_REGION as string,
    dovetechApiHost: process.env.DOVETECH_API_HOST as string,
    dovetechApiKey: process.env.DOVETECH_API_KEY as string,
    useDirectDiscountsForShipping:
      process.env.USE_DIRECT_DISCOUNTS_FOR_SHIPPING?.toLowerCase() !== 'false',
    taxCategoryId: process.env.CTP_TAX_CATEGORY_ID,
  };

  const validationErrors = getValidateMessages(envValidators, envVars);

  if (validationErrors.length) {
    throw new CustomError(
      'InvalidEnvironmentVariablesError',
      'Invalid Environment Variables please check your .env file',
      validationErrors
    );
  }

  return envVars;
};
