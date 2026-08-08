/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 23 shot harness — mounts the REAL Chat/AI-area pages (nothing
 re-created) with a stubbed Backend.AI client + a Relay mock environment, so
 before/after shots compare actual modules without a backend (pattern from
 tickets 15/19's probes):

   ?case=ai-agent      AIAgentPage (no GraphQL — useAIAgent fetches a static
                        JSON catalog; the fetch is intercepted below)
   ?case=model-store   ModelStoreListPageV2 (projectModelCardsV2 grid)
   ?case=chat-empty    ChatPage — brand-new chat, no deployment selected yet
                        (the only state reachable without driving
                        useChat()'s network stream)

 Colour mode follows `prefers-color-scheme` (Playwright's `colorScheme`).

 Serve under the theme-probe Vite harness (ticket-23 port policy 5695-5704):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5695
   -> http://127.0.0.1:5695/theme-probe/chatai.html?case=ai-agent

 The stub client is installed on `globalThis.backendaiclient` BEFORE the app
 hook modules evaluate (their module-level `backendaiClientPromise` reads it
 at import time), which is why the real mount lives behind a dynamic import.
*/

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
  supports: (key: string) => key === 'deployment-replica-nested-filter',
  isManagerVersionCompatibleWith: () => true,
  isAPIVersionCompatibleWith: () => true,
  newSignedRequest: (method: string, url: string) => ({ method, url }),
  _wrapWithPromise: () => Promise.resolve({}),
};

// @ts-ignore — the app reads this global (see react/src/hooks/index.tsx).
globalThis.backendaiclient = stubClient;

// `useAIAgent` fetches `resources/ai-agents.json` (page-relative — does not
// exist under /theme-probe/); `useBackendAIImageMetaData` (ModelCardDrawer)
// fetches `resources/image_metadata.json` likewise (ticket-19 pattern).
// Intercept both.
const AI_AGENTS_BUNDLE = {
  version: 1,
  updatedAt: new Date().toISOString(),
  profiles: [
    {
      id: 'agent-writer',
      name: 'Writing Assistant',
      description:
        'Helps draft, edit, and polish long-form technical documents.',
      version: '1.0.0',
      author: 'Backend.AI',
      icon: '✍️',
      category: 'document_creator',
      systemPrompt: 'You are a precise technical writing assistant.',
      instructions: '',
      toolConfig: {},
      modelPreferences: { preferredModelId: null },
      settingsOverrides: {},
      translations: {},
      tags: ['writing', 'docs'],
      isBuiltin: true,
      isCommunity: false,
      sourceUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'agent-coder',
      name: 'Code Reviewer',
      description: 'Reviews pull requests for correctness and style.',
      version: '1.0.0',
      author: 'Backend.AI',
      icon: '🧑‍💻',
      category: 'code_assistant',
      systemPrompt: 'You are a meticulous senior code reviewer.',
      instructions: '',
      toolConfig: {},
      modelPreferences: { preferredModelId: null },
      settingsOverrides: {},
      translations: {},
      tags: ['code', 'review'],
      isBuiltin: true,
      isCommunity: false,
      sourceUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};
const IMAGE_METADATA = {
  imageInfo: { python: { name: 'Python', icon: 'python.svg' } },
  tagAlias: { ubuntu: 'Ubuntu', py: 'Python' },
  tagReplace: {},
};
const realFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : String(input);
  if (url.includes('ai-agents.json')) {
    return Promise.resolve(
      new Response(JSON.stringify(AI_AGENTS_BUNDLE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
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
void import('./chataiMain');
