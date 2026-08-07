/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 19 shot harness — mounts the REAL Environments-area pages (nothing
 re-created) with a stubbed Backend.AI client + a Relay mock environment, so
 before/after shots compare actual modules without a backend (pattern from
 ticket 15's dashboard probe):

   ?case=images      EnvironmentPage ?tab=image     (ImageList)
   ?case=presets     EnvironmentPage ?tab=preset    (ResourcePresetList)
   ?case=registries  EnvironmentPage ?tab=registry  (ContainerRegistryList)
   ?case=customized  MyEnvironmentPage              (CustomizedImageList)

 Colour mode follows `prefers-color-scheme` (Playwright's `colorScheme`).

 Serve under the theme-probe Vite harness (ticket-19 port policy 5655-5664):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5655
   -> http://127.0.0.1:5655/theme-probe/environments.html?case=images

 The stub client is installed on `globalThis.backendaiclient` BEFORE the app
 hook modules evaluate (their module-level `backendaiClientPromise` reads it at
 import time), which is why the real mount lives behind a dynamic import.
*/

// ---------------------------------------------------------------------------
// Stub Backend.AI client — the minimal surface the mounted area components
// actually touch. Must exist before `../src/hooks` evaluates.
// ---------------------------------------------------------------------------
const RESOURCE_SLOT_DETAILS = {
  cpu: {
    slot_name: 'cpu',
    description: 'CPU',
    human_readable_name: 'CPU',
    display_unit: 'Core',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'cpu',
  },
  mem: {
    slot_name: 'mem',
    description: 'Memory',
    human_readable_name: 'RAM',
    display_unit: 'GiB',
    number_format: { binary: true, round_length: 0 },
    display_icon: 'memory',
  },
  'cuda.device': {
    slot_name: 'cuda.device',
    description: 'CUDA GPU',
    human_readable_name: 'GPU',
    display_unit: 'GPU',
    number_format: { binary: false, round_length: 2 },
    display_icon: 'gpu1',
  },
};

const stubClient = {
  ready: true,
  is_superadmin: true,
  is_admin: true,
  current_group: 'default',
  current_group_id: () => 'project-uuid-0001',
  email: 'probe@lablup.com',
  user_uuid: 'user-uuid-0001',
  accessKey: 'PROBEKEY',
  _config: {
    hideAgents: false,
    domainName: 'default',
  },
  // 'extra-field' is excluded: it mounts BAICodeEditor (CodeMirror), which
  // does not survive this minimal harness and error-boundaries the modal.
  supports: (key: string) => key !== 'extra-field',
  isManagerVersionCompatibleWith: () => true,
  isAPIVersionCompatibleWith: () => true,
  newSignedRequest: (method: string, url: string) => ({ method, url }),
  _wrapWithPromise: (req: { url: string }) => {
    if (req.url.startsWith('/config/resource-slots/details')) {
      return Promise.resolve(RESOURCE_SLOT_DETAILS);
    }
    return Promise.resolve({});
  },
  get_resource_slots: () =>
    Promise.resolve({ cpu: 'count', mem: 'bytes', 'cuda.device': 'count' }),
  scalingGroup: {
    list: () => Promise.resolve({ scaling_groups: [{ name: 'default' }] }),
  },
  maintenance: {
    rescan_images: () => Promise.resolve({ rescan_images: { ok: true } }),
  },
  image: {
    install: () => Promise.resolve({}),
  },
};

// @ts-ignore — the app reads this global (see react/src/hooks/index.tsx).
globalThis.backendaiclient = stubClient;

// `useBackendAIImageMetaData` fetches `resources/image_metadata.json` with a
// page-relative URL that does not exist under /theme-probe/. Intercept it and
// serve a minimal metadata document (tagAlias lookups then fall back to the
// raw tag strings, which is fine for shot comparison).
const IMAGE_METADATA = {
  imageInfo: {
    python: { name: 'Python', icon: 'python.svg' },
  },
  tagAlias: {
    ubuntu: 'Ubuntu',
    py: 'Python',
  },
  tagReplace: {},
};
const realFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : String(input);
  if (url.includes('image_metadata.json')) {
    return Promise.resolve(
      new Response(JSON.stringify(IMAGE_METADATA), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
  return realFetch(input as RequestInfo, init);
}) as typeof globalThis.fetch;

// The hook modules read the global at import time — mount dynamically AFTER
// the stub exists.
void import('./environmentsMain');
