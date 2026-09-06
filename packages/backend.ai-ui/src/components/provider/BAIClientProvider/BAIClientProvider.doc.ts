import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIClientProvider',
  displayName: 'BAI Client Provider',
  category: 'Utility',
  hidden: true,
  keywords: [
    'client',
    'provider',
    'context',
    'backend.ai client',
    'api',
    'session',
    'anonymous',
  ],
  usage: {
    description:
      "Puts the host app's Backend.AI client into React context so BUI components can reach the REST API without importing the host's client module. It supplies two separate values: `clientPromise` for the signed-in client (read with `useConnectedBAIClient`, which unwraps the promise with `use()` and therefore suspends until the client connects) and `anonymousClientFactory` for endpoint-scoped unauthenticated clients (read with `useAnonymousBAIClient(apiEndpoint)`). Both hooks throw when their context is missing, so anything calling them must be mounted below this provider. Hosts normally do not render it directly — passing `clientPromise` and `anonymousClientFactory` to `BAIConfigProvider` mounts it for them.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Reach for `BAIConfigProvider` with the two client props instead of mounting this provider yourself, so the locale and query-client layers stay above the client context.',
      },
      {
        guidance: true,
        description:
          'Wrap consumers of `useConnectedBAIClient` in a Suspense boundary — the hook `use()`s `clientPromise` and suspends until the client has connected.',
      },
      {
        guidance: true,
        description:
          'Keep one long-lived `clientPromise` for the app; a promise recreated on each render restarts the suspense every time.',
      },
      {
        guidance: false,
        description:
          'Mount it around the login screen and call `useConnectedBAIClient` there — the signed-in client is not available before authentication; use `useAnonymousBAIClient` for pre-login endpoint calls.',
      },
    ],
  },
  props: [
    {
      name: 'clientPromise',
      type: 'Promise<BAIClient>',
      description:
        'The signed-in Backend.AI client, still pending. `useConnectedBAIClient` unwraps it and suspends the consuming subtree until it resolves.',
      required: true,
    },
    {
      name: 'anonymousClientFactory',
      type: '(api_endpoint: string) => BAIClient',
      description:
        'Builds an unauthenticated client for a given API endpoint. `useAnonymousBAIClient(apiEndpoint)` calls it on every render, so it should be cheap and side-effect free.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The subtree that may read the client contexts. Nothing outside it can call the client hooks.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Mounted by BAIConfigProvider',
      code: `<BAIConfigProvider
  locale={currentLocale}
  clientPromise={backendaiClientPromise}
  anonymousClientFactory={createAnonymousBackendaiClient}
>
  {children}
</BAIConfigProvider>`,
    },
    {
      label: 'Mounted directly',
      code: `<BAIClientProvider
  clientPromise={backendaiClientPromise}
  anonymousClientFactory={createAnonymousBackendaiClient}
>
  <Suspense fallback={<BAISkeleton active />}>
    <FileExplorer vfolderName={name} />
  </Suspense>
</BAIClientProvider>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
