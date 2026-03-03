// Mock for backend.ai-client-esm (resolved via webpack alias in real builds)
class MockClient {}
class MockClientConfig {}

module.exports = {
  backend: {
    Client: MockClient,
    ClientConfig: MockClientConfig,
  },
};
