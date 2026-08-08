/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 26 measurement harness — mounts the REAL ticket-26 components
 (`BAIComplexSelect` and `BAIUserSelectAstryx` from the built `backend.ai-ui`
 package; nothing re-created here) so the two acceptance criteria can be
 measured in a live browser:

   ?case=relay   BAIUserSelectAstryx over a mock Relay environment that
                 serves `user_nodes` OFFSET pages (10 per page, 57 total).
                 Proves scroll -> `loadNext` -> rows appended.
   ?case=form    antd `Form` + `BAIFormItem` + `BAIComplexSelect`.
                 Proves the `labelInValue` value contract survives the form
                 state engine — `window.__probe.formValue()` reads back what
                 `form.getFieldsValue()` holds.
   &mode=dark    dark scheme (default light)

 Serve (PORT POLICY for this worktree: 5725-5734):

   pnpm --filter backend.ai-ui build          # the probe consumes dist/
   cd react && pnpm exec vite --config theme-probe/vite.config.mts \
     --port 5725 --strictPort
   -> http://127.0.0.1:5725/theme-probe/select26.html?case=relay

 Then: node react/theme-probe/shoot26.mjs
*/
// The stub MUST evaluate before any module that imports react/src/hooks.
// Keep this import FIRST — do not let a formatter sort it down.
// eslint-disable-next-line import/order
import './select26-env';
import en from '../../resources/i18n/en.json';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import BAIFormItem from '../src/components/BAIFormItem';
import '../src/index.css';
import { ThemeShimProvider } from '../src/theme-shim';
import { Theme } from '@astryxdesign/core/theme';
import { Form } from 'antd';
import { BAIComplexSelect, BAIUserSelectAstryx } from 'backend.ai-ui';
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
const which = params.get('case') ?? 'relay';
const mode = params.get('mode') === 'dark' ? 'dark' : 'light';

window.localStorage.setItem(
  'backendaiwebui.settings.themeMode',
  JSON.stringify(mode),
);

/* ----- mock Relay environment ---------------------------------------------
 * Hand-written payloads rather than `MockPayloadGenerator`: the whole point
 * of this probe is that page N differs from page N-1, which means the
 * response has to be a function of the operation's `offset`/`limit`
 * variables. The generator cannot express that.
 * -------------------------------------------------------------------------- */

const TOTAL_USERS = 57;
const environment = createMockEnvironment();

/** Every paginated fetch the component made, in order. Read by shoot26.mjs. */
const pageFetches: Array<{ offset: number; limit: number; filter?: string }> =
  [];

const userAt = (index: number) => ({
  id: btoa(`user:00000000-0000-0000-0000-${String(index).padStart(12, '0')}`),
  email: `probe-user-${String(index).padStart(3, '0')}@backend.ai`,
  username: `probe-user-${index}`,
  full_name: `Probe User ${index}`,
  status: 'ACTIVE',
  role: 'USER',
  __typename: 'UserNode',
});

setInterval(() => {
  for (const op of environment.mock.getAllOperations()) {
    const name = op.request.node.operation.name;
    const vars = op.request.variables as {
      offset?: number;
      limit?: number;
      first?: number;
      filter?: string | null;
      skipSelected?: boolean;
    };
    try {
      if (name === 'BAIUserSelectAstryxPaginatedQuery') {
        const offset = vars.offset ?? 0;
        const limit = vars.limit ?? 10;
        pageFetches.push({
          offset,
          limit,
          filter: vars.filter ?? undefined,
        });
        const edges = Array.from(
          { length: Math.max(0, Math.min(limit, TOTAL_USERS - offset)) },
          (_unused, i) => ({ node: userAt(offset + i) }),
        );
        environment.mock.resolve(op, {
          data: { user_nodes: { count: TOTAL_USERS, edges } },
        });
      } else if (name === 'BAIUserSelectAstryxValueQuery') {
        environment.mock.resolve(op, {
          data: vars.skipSelected
            ? {}
            : { user_nodes: { edges: [{ node: userAt(0) }] } },
        });
      }
    } catch {
      // already resolved / not resolvable this tick — retried next
    }
  }
}, 100);

/* ----- cases --------------------------------------------------------------- */

const RelayCase: React.FC = () => {
  const [value, setValue] = useState<string | Array<string> | undefined>();
  return (
    <div style={{ padding: 24, width: 420 }}>
      <BAIUserSelectAstryx
        label="Owner"
        value={value}
        onChange={setValue}
        data-testid="relay-select"
      />
      <pre data-testid="relay-value">{JSON.stringify(value ?? null)}</pre>
    </div>
  );
};

const FormCase: React.FC = () => {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState<unknown>(null);
  const options = Array.from({ length: 24 }, (_unused, i) => ({
    value: `opt-${i}`,
    label: `Option ${i}`,
    description: `description ${i}`,
  }));
  return (
    <div style={{ padding: 24, width: 420 }}>
      <Form
        form={form}
        initialValues={{
          owner: { label: 'Option 3', value: 'opt-3' },
        }}
        onFinish={(values) => setSubmitted(values)}
      >
        <BAIFormItem
          name="owner"
          label="Owner"
          rules={[{ required: true, message: 'Owner is required' }]}
        >
          <BAIComplexSelect
            label="Owner"
            isLabelHidden
            options={options}
            data-testid="form-select"
          />
        </BAIFormItem>
        <BAIFormItem name="reviewers" label="Reviewers">
          <BAIComplexSelect
            label="Reviewers"
            isLabelHidden
            multiple
            options={options}
            data-testid="form-multi-select"
          />
        </BAIFormItem>
        <button type="button" onClick={() => form.submit()}>
          submit
        </button>
      </Form>
      <pre data-testid="form-submitted">{JSON.stringify(submitted)}</pre>
      {/* Exposed for shoot26.mjs — asserts the raw labelInValue payload. */}
      <ProbeBridge read={() => form.getFieldsValue()} />
    </div>
  );
};

const probe =
  (window as unknown as { __probe: Record<string, unknown> }).__probe ?? {};
probe.pageFetches = () => pageFetches;
(window as unknown as { __probe: Record<string, unknown> }).__probe = probe;

const ProbeBridge: React.FC<{ read: () => unknown }> = ({ read }) => {
  probe.formValue = read;
  return null;
};

const cases: Record<string, React.ReactNode> = {
  relay: <RelayCase />,
  form: <FormCase />,
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
            {cases[which] ?? cases.relay}
          </Suspense>
        </div>
      </RelayEnvironmentProvider>
    </ThemeShimProvider>
  </Theme>,
);
