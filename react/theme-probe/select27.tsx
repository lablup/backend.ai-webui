/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 27 measurement harness — mounts two of the ~18 wrappers ticket 27
 converted onto `BAIComplexSelect` (from the built `backend.ai-ui` package;
 nothing re-created here), one per conversion class named in
 CONVERSION-BRIEF.md §2:

   ?case=keypair   BAIKeypairSelectAstryx — class A (name-valued, key =
                   `access_key`) over a mock Relay environment serving
                   `keypair_list` OFFSET pages (10 per page, 35 total).
   ?case=project   BAIAdminProjectSelectAstryx — class B (id-valued, key =
                   `toLocalId(node.id)`) over a mock Relay environment
                   serving `adminProjectsV2` OFFSET pages (10 per page, 24
                   total).
   &mode=dark      dark scheme (default light)

 Both prove the same two things ticket 26 proved for `BAIUserSelectAstryx`:
 scroll -> `endReached` -> Relay `loadNext` -> rows appended, and the
 `labelInValue` value contract round-trips through `onChange`. This is
 deliberately NOT a re-run of the ticket-26 harness (which already proved
 `BAIUserSelectAstryx` live) — it exists to catch recipe-application drift
 across the ~16 wrappers four parallel agents produced in ticket 27.

 Serve (PORT POLICY for this worktree: 5755-5764):

   pnpm --filter backend.ai-ui build          # the probe consumes dist/
   cd react && pnpm exec vite --config theme-probe/vite.config.mts \
     --port 5755 --strictPort
   -> http://127.0.0.1:5755/theme-probe/select27.html?case=keypair

 Then: node react/theme-probe/shoot27.mjs 5755 <outDir>
*/
// The stub MUST evaluate before any module that imports react/src/hooks.
// Keep this import FIRST — do not let a formatter sort it down.
// eslint-disable-next-line import/order
import './select27-env';
import en from '../../resources/i18n/en.json';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import '../src/index.css';
import { ThemeShimProvider } from '../src/theme-shim';
import { Theme } from '@astryxdesign/core/theme';
import { BAIAdminProjectSelectAstryx, BAIKeypairSelectAstryx } from 'backend.ai-ui';
import i18next from 'i18next';
import React, { Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'keypair';
const mode = params.get('mode') === 'dark' ? 'dark' : 'light';

window.localStorage.setItem(
  'backendaiwebui.settings.themeMode',
  JSON.stringify(mode),
);

/* ----- mock Relay environment ---------------------------------------------
 * Same rationale as select26.tsx: page N differs from page N-1, a function
 * of the operation's offset/limit variables, so hand-written resolvers
 * rather than MockPayloadGenerator.
 * -------------------------------------------------------------------------- */

const TOTAL_KEYPAIRS = 35;
const TOTAL_PROJECTS = 24;
const environment = createMockEnvironment();

/** Every paginated fetch the component made, in order. Read by shoot27.mjs. */
const pageFetches: Array<{
  case: string;
  offset: number;
  limit: number;
}> = [];

const keypairAt = (index: number) => ({
  access_key: `PROBEKEY${String(index).padStart(3, '0')}`,
  user_id: `probe-user-${index}@backend.ai`,
  is_active: true,
  __typename: 'KeyPair',
});

const projectIdAt = (index: number) =>
  btoa(`ProjectNode:00000000-0000-0000-0000-${String(index).padStart(12, '0')}`);

const projectAt = (index: number) => ({
  id: projectIdAt(index),
  basicInfo: { name: `Probe Project ${index}` },
  __typename: 'ProjectNode',
});

setInterval(() => {
  for (const op of environment.mock.getAllOperations()) {
    const name = op.request.node.operation.name;
    const vars = op.request.variables as {
      offset?: number;
      limit?: number;
      filter?: unknown;
      skipSelected?: boolean;
      projectIds?: Array<string>;
    };
    try {
      if (name === 'BAIKeypairSelectAstryxPaginatedQuery') {
        const offset = vars.offset ?? 0;
        const limit = vars.limit ?? 10;
        pageFetches.push({ case: 'keypair', offset, limit });
        const items = Array.from(
          { length: Math.max(0, Math.min(limit, TOTAL_KEYPAIRS - offset)) },
          (_unused, i) => keypairAt(offset + i),
        );
        environment.mock.resolve(op, {
          data: {
            keypair_list: { items, total_count: TOTAL_KEYPAIRS },
          },
        });
      } else if (name === 'BAIKeypairSelectAstryxValueQuery') {
        environment.mock.resolve(op, {
          data: vars.skipSelected
            ? {}
            : {
                keypair_list: {
                  items: [keypairAt(0)],
                  total_count: TOTAL_KEYPAIRS,
                },
              },
        });
      } else if (name === 'BAIAdminProjectSelectAstryxPaginatedQuery') {
        const offset = vars.offset ?? 0;
        const limit = vars.limit ?? 10;
        pageFetches.push({ case: 'project', offset, limit });
        const edges = Array.from(
          { length: Math.max(0, Math.min(limit, TOTAL_PROJECTS - offset)) },
          (_unused, i) => ({ node: projectAt(offset + i) }),
        );
        environment.mock.resolve(op, {
          data: { adminProjectsV2: { count: TOTAL_PROJECTS, edges } },
        });
      } else if (name === 'BAIAdminProjectSelectAstryxValueQuery') {
        environment.mock.resolve(op, {
          data: vars.skipSelected
            ? {}
            : { adminProjectsV2: { edges: [{ node: projectAt(0) }] } },
        });
      }
    } catch {
      // already resolved / not resolvable this tick — retried next
    }
  }
}, 100);

/* ----- cases --------------------------------------------------------------- */

const KeypairCase: React.FC = () => {
  const [value, setValue] = useState<string | Array<string> | undefined>();
  return (
    <div style={{ padding: 24, width: 420 }}>
      <BAIKeypairSelectAstryx
        label="Keypair"
        value={value}
        onChange={setValue}
        data-testid="keypair-select"
      />
      <pre data-testid="keypair-value">{JSON.stringify(value ?? null)}</pre>
    </div>
  );
};

const ProjectCase: React.FC = () => {
  const [value, setValue] = useState<string | Array<string> | undefined>();
  return (
    <div style={{ padding: 24, width: 420 }}>
      <BAIAdminProjectSelectAstryx
        label="Project"
        value={value}
        onChange={setValue}
        data-testid="project-select"
      />
      <pre data-testid="project-value">{JSON.stringify(value ?? null)}</pre>
    </div>
  );
};

const probe =
  (window as unknown as { __probe: Record<string, unknown> }).__probe ?? {};
probe.pageFetches = () => pageFetches;
(window as unknown as { __probe: Record<string, unknown> }).__probe = probe;

const cases: Record<string, React.ReactNode> = {
  keypair: <KeypairCase />,
  project: <ProjectCase />,
};

createRoot(document.getElementById('root')!).render(
  <Theme theme={backendAiBrandTheme} mode={mode}>
    <ThemeShimProvider mode={mode}>
      <RelayEnvironmentProvider environment={environment}>
        <div
          style={{
            minHeight: '100vh',
            background: 'var(--color-background-body)',
            color: 'var(--color-text-primary)',
          }}
        >
          <Suspense fallback={<div>loading…</div>}>
            {cases[which] ?? cases.keypair}
          </Suspense>
        </div>
      </RelayEnvironmentProvider>
    </ThemeShimProvider>
  </Theme>,
);
