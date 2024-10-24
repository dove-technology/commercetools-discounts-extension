import { Configuration } from '../types/index.types';

export const getConfig = (
  overrides?: Partial<Configuration>
): Configuration => {
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
