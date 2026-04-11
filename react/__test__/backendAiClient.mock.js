// Mock for backend.ai-client package
class MockClient {}
class MockClientConfig {}

module.exports = {
  Client: MockClient,
  ClientConfig: MockClientConfig,
  backend: {
    Client: MockClient,
    ClientConfig: MockClientConfig,
  },
};
