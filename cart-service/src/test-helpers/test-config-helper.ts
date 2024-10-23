import { Configuration } from '../types/index.types';

export const getConfig = (overrides?: object): Configuration => {
  return {
    clientId: 'mockedClientId',
    clientSecret: 'mockedClientSecret',
    projectKey: 'mockedProjectKey',
    region: 'mockedRegion',
    scopes: 'scopes',
    dovetechApiHost: 'https://example.com',
    dovetechApiKey: 'API-KEY',
    useDirectDiscountsForShipping: true,
    ...overrides,
  };
};
