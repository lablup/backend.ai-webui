---
title: Client SDK for TypeScript
order: 176
---
# Client SDK for TypeScript

Backend.AI provides a TypeScript/JavaScript client library for communicating
with the Backend.AI API server. This library is used internally by the
Backend.AI WebUI and handles authentication, session management, and API
request construction.

## Availability

The TypeScript client library is **not published as a standalone npm package**.
It is bundled within the Backend.AI WebUI project and is intended primarily for
internal use by the web-based management console.

The source code is located at:

```text
src/lib/backend.ai-client-esm.ts
```

within the [Backend.AI WebUI repository](https://github.com/lablup/backend.ai-webui).

:::note
Because this library is tightly coupled to the WebUI codebase, it does not
follow the typical npm package release cycle. Its API may change between WebUI
releases without separate versioning or a migration guide.
:::

## Key Classes and Methods

The client library exposes the following core constructs:

- **`Client`** -- The main class for establishing a connection to the
  Backend.AI API server. It handles endpoint configuration, keypair-based
  authentication, and token management.
- **`ClientConfig`** -- Configuration object that holds the endpoint URL,
  access key, secret key, and other connection parameters.
- **Resource managers** -- Internal classes (e.g., `ComputeSession`, `VFolder`,
  `Image`, `KeyPair`) that map to Backend.AI resource types and provide methods
  for CRUD operations.

## Authentication and Session Management

The TypeScript client authenticates using the same keypair mechanism as the
Python SDK. A typical initialization flow looks like this:

```text
// Pseudocode illustrating the authentication flow
// 1. Create a ClientConfig with endpoint and keypair
// 2. Instantiate a Client with the config
// 3. The client signs each request using HMAC-SHA256
```

The client supports two authentication modes:

- **Keypair authentication** -- Uses `BACKEND_ACCESS_KEY` and
  `BACKEND_SECRET_KEY` to sign API requests directly.
- **Session-based authentication** -- Authenticates through the console server
  (used when `BACKEND_ENDPOINT_TYPE` is set to `session`), which issues a
  session cookie after login.

## Internal Architecture

The WebUI uses the client library through a global singleton instance that is
initialized at application startup. Key architectural points include:

- The client maintains a persistent connection to the API server and
  automatically refreshes authentication tokens as needed.
- GraphQL queries in the WebUI (via Relay) complement the client library for
  data fetching, while the client library handles imperative operations such as
  session creation and file uploads.
- WebSocket connections for real-time features (e.g., terminal access, log
  streaming) are managed through the WebUI's proxy layer, not directly by the
  client library.

## Recommendations for External Integration

If you need to interact with Backend.AI from a JavaScript or TypeScript
application outside the WebUI, consider these alternatives:

:::info
**For external integrations**, you should use the Backend.AI REST API directly
or the Python SDK rather than importing the TypeScript client library. The
TypeScript library is not designed for standalone use and lacks the packaging,
documentation, and stability guarantees of the Python SDK.
:::

- **REST API** -- Backend.AI exposes a well-documented REST API that you can
  call from any HTTP client in any language. This is the most portable option
  for custom integrations.
- **Python SDK** -- The officially supported SDK with comprehensive high-level
  functions, a CLI, and stable releases on PyPI. See the
  [Client SDK for Python](client-sdk-for-python.md) page for details.
- **WebUI Plugin System** -- If you want to extend the Backend.AI management
  console itself, explore the WebUI's plugin architecture rather than importing
  the client library directly.

## Source Reference

You can review the full TypeScript client implementation in the WebUI
repository:

- Main client module: `src/lib/backend.ai-client-esm.ts`
- Type definitions and helper utilities are co-located in `src/lib/`

:::warning
The internal API surface of this library is subject to change without notice.
If you depend on specific methods or behaviors, pin your WebUI version and
review the changelog before upgrading.
:::
