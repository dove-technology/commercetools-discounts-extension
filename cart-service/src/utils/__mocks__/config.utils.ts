export const readConfiguration = jest.fn(() => ({
  clientId: 'mockedClientId',
  clientSecret: 'mockedClientSecret',
  projectKey: 'mockedProjectKey',
  region: 'mockedRegion',
  dovetechApiHost: 'https://example.com',
  dovetechApiKey: 'API-KEY',
}));
