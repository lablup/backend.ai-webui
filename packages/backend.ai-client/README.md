# backend.ai-client

Backend.AI API client library for JavaScript/TypeScript

## Installation

```bash
pnpm add backend.ai-client
# or
npm install backend.ai-client
```

## Quickstart

```ts
import { Client, ClientConfig } from 'backend.ai-client';

// API mode (default): authenticate with an access key / secret key pair
const config = new ClientConfig(
  process.env.BACKEND_ACCESS_KEY,
  process.env.BACKEND_SECRET_KEY,
  'https://api.backend.ai',
  'API',
);

const client = new Client(config, 'my-app/1.0');

// List keypairs for the current user
const { keypairs } = await client.keypair.list();
console.log(keypairs);

// List compute sessions
const sessions = await client.computeSession.list();
console.log(sessions);
```

`ClientConfig` can also be constructed from environment variables
(`BACKEND_ACCESS_KEY`, `BACKEND_SECRET_KEY`, `BACKEND_ENDPOINT`):

```ts
import { Client, ClientConfig } from 'backend.ai-client';

const client = new Client(ClientConfig.createFromEnv(), 'my-app/1.0');
```

For `SESSION` connection mode (webserver-backed login with user id / password)
pass `'SESSION'` as the fourth argument to `ClientConfig` and use the user id
and password in place of access key / secret key.

## Runtime support

- ESM-only package (`"type": "module"`)
- Node.js >= 18 (uses the global `fetch` API)
- Modern browsers with `fetch`, `WebCrypto`, and ES2020 support

## Links

- Source repository: https://github.com/lablup/backend.ai-webui
- Issue tracker: https://github.com/lablup/backend.ai-webui/issues

## License

LGPL-3.0-or-later — see [LICENSE](./LICENSE).
