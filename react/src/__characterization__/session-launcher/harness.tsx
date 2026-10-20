/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Render harness for the session-launcher characterization suite.
 *
 * A test file must register the `vi.mock`s at the top of
 * `page.characterization.test.tsx` (each factory delegates to `./mockState`)
 * before importing this module; the resource suite needs the first six.
 */
import ResourceAllocationFormItems, {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
} from '../../components/SessionFormItems/ResourceAllocationFormItems';
import { Form, type FormInstance } from '../../form-engine';
import { pageRefs, scenario, spies, updateScenario } from './mockState';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider, createStore } from 'jotai';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

type Operation = Parameters<
  Parameters<RelayMockEnvironment['mock']['queueOperationResolver']>[0]
>[0];

/** Per-operation payloads, read from the scenario at request time. */
export const payloadFor = (operation: Operation) => {
  const name = operation.request.node.params.name;
  switch (name) {
    case 'ResourceAllocationFormItemsQuery':
      return MockPayloadGenerator.generate(operation, {
        Query: () => ({
          accessible_scaling_groups: scenario.scalingGroups,
          resource_presets: scenario.gqlPresets,
        }),
      });
    case 'ResourcePresetSelectQuery':
    case 'SessionLauncherPreviewQuery':
      return MockPayloadGenerator.generate(operation, {
        Query: () => ({ resource_presets: scenario.gqlPresets }),
      });
    case 'AgentSelectPaginatedQuery':
      return MockPayloadGenerator.generate(operation, {
        Query: () => ({
          agent_summary_list: {
            items: scenario.agents,
            total_count: scenario.agents.length,
          },
        }),
      });
    case 'ImageEnvironmentSelectFormItemsQuery':
    case 'useDefaultImagesWithFallbackQuery':
      return MockPayloadGenerator.generate(operation, {
        Query: () => ({ images: scenario.images }),
      });
    default:
      throw new Error(
        `Unhandled Relay operation ${name} in characterization harness`,
      );
  }
};

export const createScenarioEnvironment = () => {
  const environment = createMockEnvironment();
  // relay-test-utils drops a resolver after its first non-null answer, so
  // each answer queues a fresh one.
  const makeResolver =
    () =>
    (operation: Operation): ReturnType<typeof payloadFor> => {
      const payload = payloadFor(operation);
      environment.mock.queueOperationResolver(makeResolver());
      return payload;
    };
  environment.mock.queueOperationResolver(makeResolver());
  return environment;
};

const findFieldItem = (container: HTMLElement, label: string) => {
  const labelEl = Array.from(
    container.querySelectorAll<HTMLElement>('label.uic-form-item__label'),
  ).find((el) => el.textContent?.trim() === label);
  const item = labelEl?.closest<HTMLElement>('.uic-form-item');
  if (!item) throw new Error(`No form item labelled "${label}"`);
  return item;
};

export const createDriver = (
  container: HTMLElement,
  getForm: () => FormInstance,
) => {
  const input = (label: string, index = 0) => {
    const el = findFieldItem(container, label).querySelectorAll('input')[index];
    if (!el) throw new Error(`No input #${index} in "${label}"`);
    return el as HTMLInputElement;
  };
  const openSelector = async (
    label: string,
    user: ReturnType<typeof userEvent.setup>,
  ) => {
    const trigger = findFieldItem(container, label).querySelector<HTMLElement>(
      'button[aria-haspopup="listbox"]',
    );
    if (!trigger) throw new Error(`No selector in "${label}"`);
    await act(async () => {
      await user.click(trigger);
    });
    const listbox = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    );
    return Array.from(
      (listbox ?? document).querySelectorAll<HTMLElement>('[role="option"]'),
    );
  };
  const drive = {
    input,
    /** Replace the text of a labelled item's input, as a user would. */
    type: async (label: string, text: string, index = 0) => {
      const el = input(label, index);
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        await user.click(el);
        await user.clear(el);
        if (text) await user.type(el, text);
      });
    },
    blur: async (label: string, index = 0) => {
      const el = input(label, index);
      await act(async () => {
        fireEvent.blur(el);
      });
    },
    focusBlur: async (label: string, index = 0) => {
      const el = input(label, index);
      await act(async () => {
        fireEvent.focus(el);
        fireEvent.blur(el);
      });
    },
    /** Open a labelled item's selector and click the option named `option`. */
    select: async (label: string, option: string) => {
      const user = userEvent.setup({ delay: null });
      const target = (await openSelector(label, user)).find((el) =>
        el.textContent?.trim().startsWith(option),
      );
      if (!target) throw new Error(`No option "${option}" in "${label}"`);
      await act(async () => {
        await user.click(target);
      });
    },
    /** Open a labelled item's selector, read its options, and close it. */
    options: async (label: string) => {
      const user = userEvent.setup({ delay: null });
      const options = (await openSelector(label, user)).map((el) => ({
        label: el.textContent?.trim() ?? '',
        disabled: el.getAttribute('aria-disabled') === 'true',
      }));
      await act(async () => {
        await user.keyboard('{Escape}');
      });
      return options;
    },
    /** Click a segmented-control button or a radio-list input by its value. */
    clickRadio: async (value: string) => {
      const button = container.querySelector<HTMLElement>(
        `[role="radio"][data-value="${value}"], input[type="radio"][value="${value}"]`,
      );
      if (!button) throw new Error(`No radio "${value}"`);
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        await user.click(button);
      });
    },
    /** Click the switch whose visible label (rendered beside it) is `label`. */
    toggleSwitch: async (label: string) => {
      const target = Array.from(
        container.querySelectorAll<HTMLElement>('[role="switch"]'),
      ).find(
        (el) => el.parentElement?.parentElement?.textContent?.trim() === label,
      );
      if (!target) throw new Error(`No switch "${label}"`);
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        await user.click(target);
      });
    },
    /** Press a stepper button (`+1` / `-1`) of a labelled number input. */
    step: async (label: string, direction: 1 | -1) => {
      const item = findFieldItem(container, label);
      const buttons = Array.from(item.querySelectorAll('button'));
      const pattern =
        direction > 0 ? /^(increment|increase)/i : /^(decrement|decrease)/i;
      const button = buttons.find((b) =>
        pattern.test(b.getAttribute('aria-label') ?? ''),
      );
      if (!button) throw new Error(`No stepper in "${label}"`);
      await act(async () => {
        fireEvent.click(button);
      });
    },
    /** Apply a scenario change and let every reader re-render. */
    scenario: async (mutate: Parameters<typeof updateScenario>[0]) => {
      await act(async () => {
        updateScenario(mutate);
      });
    },
    /** A programmatic store write, as an effect elsewhere would do. */
    setFieldValue: async (
      name: Parameters<FormInstance['setFieldValue']>[0],
      value: unknown,
    ) => {
      await act(async () => {
        getForm().setFieldValue(name, value);
      });
    },
    /** Let effects and pending promises run for `ms` real milliseconds. */
    settle: async (ms = 50) => {
      await act(async () => {
        await new Promise((r) => setTimeout(r, ms));
      });
    },
  };
  return drive;
};

export const createReader = (
  container: HTMLElement,
  getForm: () => FormInstance,
) => ({
  // The form store is the observation surface on purpose: the rewrite keeps it
  // as the view store (useFormBoundSlice); re-point here if that changes.
  values: () => _.cloneDeep(getForm().getFieldsValue(true)),
  registered: () => _.cloneDeep(getForm().getFieldsValue()),
  errors: () =>
    _.fromPairs(
      getForm()
        .getFieldsError()
        .filter((f) => f.errors.length || f.warnings.length)
        .map((f) => [
          f.name.join('.'),
          { errors: [...f.errors], warnings: [...f.warnings] },
        ]),
    ),
  fieldErrors: (name: Parameters<FormInstance['getFieldError']>[0]) => [
    ...getForm().getFieldError(name),
  ],
  fieldWarnings: (name: Parameters<FormInstance['getFieldWarning']>[0]) => [
    ...getForm().getFieldWarning(name),
  ],
  inputValue: (label: string, index = 0) => {
    const item = findFieldItem(container, label);
    return (item.querySelectorAll('input')[index] as HTMLInputElement)?.value;
  },
  hasField: (label: string) => {
    try {
      findFieldItem(container, label);
      return true;
    } catch {
      return false;
    }
  },
});

export interface RenderResourceFormOptions {
  initialValues?: Record<string, unknown>;
  props?: Partial<React.ComponentProps<typeof ResourceAllocationFormItems>>;
  /**
   * `launcher` mirrors SessionLauncherPage's props; `deployment` mirrors
   * DeploymentAddRevisionModal's (no agent select, RG hidden, no warnings).
   */
  host?: 'launcher' | 'deployment' | 'bare';
}

export const renderResourceForm = async ({
  initialValues,
  props,
  host = 'launcher',
}: RenderResourceFormOptions = {}) => {
  const environment = createScenarioEnvironment();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const formRef: { current?: FormInstance } = {};
  const hostProps =
    host === 'launcher'
      ? {
          enableAgentSelect: true,
          enableResourcePresets: true,
          showRemainingWarning: true,
        }
      : host === 'deployment'
        ? { enableResourcePresets: true, hideResourceGroupFormItem: true }
        : {};
  const baseInitialValues =
    host === 'deployment'
      ? _.merge({}, RESOURCE_ALLOCATION_INITIAL_FORM_VALUES, {
          resourceGroup: 'rg-a',
        })
      : _.merge({}, RESOURCE_ALLOCATION_INITIAL_FORM_VALUES, {
          allocationPreset: 'auto-select',
          resourceGroup: 'rg-a',
        });
  const mergedInitialValues = _.merge({}, baseInitialValues, initialValues);
  const FormHost: React.FC = () => {
    const [form] = Form.useForm();
    formRef.current = form;
    return (
      <Form form={form} layout="vertical" initialValues={mergedInitialValues}>
        <ResourceAllocationFormItems
          project={scenario.currentProject}
          {...hostProps}
          {...props}
        />
      </Form>
    );
  };
  const utils = render(
    <JotaiProvider store={createStore()}>
      <RelayEnvironmentProvider environment={environment}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<div data-testid="suspense-fallback" />}>
            <FormHost />
          </Suspense>
        </QueryClientProvider>
      </RelayEnvironmentProvider>
    </JotaiProvider>,
  );
  const getForm = () => formRef.current!;
  await waitFor(() =>
    expect(utils.queryByTestId('suspense-fallback')).toBeNull(),
  ).catch((e) => {
    throw new Error(
      `Still suspended. Pending relay: ${environment.mock
        .getAllOperations()
        .map((op) => op.request.node.params.name)
        .join(', ')}; pending queries: ${queryClient
        .getQueryCache()
        .getAll()
        .filter((q) => q.state.status !== 'success')
        .map((q) => JSON.stringify(q.queryKey) + ':' + q.state.status)
        .join(', ')}\n${e}`,
    );
  });
  const drive = createDriver(utils.container, getForm);
  const read = createReader(utils.container, getForm);
  await drive.settle();
  return { ...utils, environment, form: getForm, drive, read };
};

export interface RenderLauncherPageOptions {
  /** Initial `?formValues=` object (JSON-encoded for the URL). */
  formValues?: Record<string, unknown>;
  step?: number;
  /** Extra raw search string appended as-is. */
  rawSearch?: string;
}

const encodeSearch = ({
  formValues,
  step,
  rawSearch,
}: RenderLauncherPageOptions) => {
  const params = new URLSearchParams();
  if (step !== undefined) params.set('step', String(step));
  if (formValues) params.set('formValues', JSON.stringify(formValues));
  return [params.toString(), rawSearch].filter(Boolean).join('&');
};

/**
 * Full SessionLauncherPage under a memory router + nuqs (react-router v6
 * adapter, `shallow:false` as in App.tsx). Needs the page mocks registered by
 * `page.characterization.test.tsx`; imported lazily so the resource suite
 * never loads the page.
 */
let pageRendered = false;

/**
 * nuqs keeps its throttle/debounce queues as `globalThis` singletons; a value
 * a previous test queued is read back as "pending" by the next mount.
 */
const resetNuqsQueues = () => {
  const registry = globalThis as unknown as Record<symbol, any>;
  let found = 0;
  Object.getOwnPropertySymbols(registry).forEach((key) => {
    const name = key.description ?? '';
    if (!name.startsWith('nuqs.')) return;
    if (name.endsWith('.debounce-controller')) {
      registry[key].abortAll?.();
      found += 1;
    }
    if (name.endsWith('.throttle-queue')) {
      registry[key].abort?.();
      found += 1;
    }
  });
  if (found === 0) {
    throw new Error(
      'resetNuqsQueues found no nuqs.<version>.{debounce-controller,throttle-queue} singleton (written against nuqs 2.9.5); update it for the installed nuqs',
    );
  }
};

export const renderLauncherPage = async (
  options: RenderLauncherPageOptions = {},
) => {
  const [{ default: SessionLauncherPage }, { NuqsAdapter }, router] =
    await Promise.all([
      import('../../pages/SessionLauncherPage'),
      import('nuqs/adapters/react-router/v6'),
      import('react-router-dom'),
    ]);
  const environment = createScenarioEnvironment();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // Image metadata is the only thing the page fetches directly.
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ imageInfo: {}, tagAlias: {}, tagReplace: {} }),
        text: () => Promise.resolve(''),
      }),
    ),
  );
  // A previous test's unmounted page still has its 500 ms URL debounce and the
  // nuqs flush queue pending; let them land before this test sets its URL.
  if (pageRendered) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 800));
    });
  }
  pageRendered = true;
  resetNuqsQueues();
  const search = encodeSearch(options);
  // nuqs' react-router adapter reads and writes `window.location` / History,
  // so the jsdom URL is the source of truth, as in the app's browser router.
  window.history.replaceState(
    null,
    '',
    `/session/start${search ? '?' + search : ''}`,
  );
  const memoryRouter = router.createMemoryRouter(
    [
      {
        path: '/session/start',
        element: (
          <Suspense fallback={<div data-testid="suspense-fallback" />}>
            <SessionLauncherPage />
          </Suspense>
        ),
      },
    ],
    { initialEntries: [`/session/start${search ? '?' + search : ''}`] },
  );
  const utils = render(
    <JotaiProvider store={createStore()}>
      <RelayEnvironmentProvider environment={environment}>
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter defaultOptions={{ shallow: false }}>
            <router.RouterProvider router={memoryRouter} />
          </NuqsAdapter>
        </QueryClientProvider>
      </RelayEnvironmentProvider>
    </JotaiProvider>,
  );
  await waitFor(() => {
    expect(utils.queryByTestId('suspense-fallback')).toBeNull();
    expect(pageRefs.form).toBeDefined();
  }).catch((e) => {
    throw new Error(
      `Page still suspended. Pending relay: ${environment.mock
        .getAllOperations()
        .map((op) => op.request.node.params.name)
        .join(', ')}\n${e}`,
    );
  });
  const getForm = () => pageRefs.form as FormInstance;
  const drive = {
    ...createDriver(utils.container, getForm),
    clickButton: async (name: string) => {
      const button = Array.from(
        utils.container.ownerDocument.querySelectorAll<HTMLElement>('button'),
      ).find(
        (b) =>
          b.textContent?.trim() === name ||
          b.getAttribute('aria-label') === name,
      );
      if (!button) throw new Error(`No button "${name}"`);
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        await user.click(button);
      });
    },
    /** Wait past the page's 500 ms trailing URL debounce. */
    flushUrl: async () => {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 700));
      });
    },
  };
  const read = {
    ...createReader(utils.container, getForm),
    url: () => {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('formValues');
      return {
        step: params.get('step'),
        formValues: raw ? JSON.parse(raw) : undefined,
      };
    },
    /** `createIfNotExists` argument lists captured by the mocked client. */
    payload: () => spies.createIfNotExists,
    buttonLabels: () =>
      Array.from(utils.container.querySelectorAll('button'))
        .map((b) => b.textContent?.trim() || b.getAttribute('aria-label'))
        .filter(Boolean),
  };
  await drive.settle();
  return { ...utils, environment, form: getForm, drive, read };
};
