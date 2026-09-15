/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import ImportImageModal from './ImportImageModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

/**
 * Behavioural tests for FR-3940: the registry list is paged to exhaustion, a
 * partially successful batch locks what succeeded, the closing toast counts the
 * whole batch — retries included — and, from the hang report, every failure
 * clears the loading flag and reaches the row with a readable message.
 */

const mockScanRequest = vi.fn();
const mockMessageSuccess = vi.fn();
const mockMessageError = vi.fn();

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      // `count` is interpolated so the cumulative-count assertions can read it
      // off the toast; every other key stays bare.
      t: (key: string, options?: Record<string, any>) =>
        options && 'count' in options ? `${key}:${options.count}` : key,
      i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

vi.mock('../helper', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../helper')>();
  return {
    ...originalModule,
    baiSignedRequestWithPromise: (...args: Array<any>) =>
      mockScanRequest(...args),
  };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      _config: { domainName: 'default' },
      supports: () => true,
    }),
  };
});

// Identity by default; one test flips the switch to run the real hook, which
// is the one that throws on a missing `globalThis.backendaiwebui` (FR-3953).
let isPainKillerStubbed = true;

vi.mock('../hooks/usePainKiller', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/usePainKiller')>();
  return {
    ...originalModule,
    usePainKiller: () => {
      const original = originalModule.usePainKiller();
      return {
        relieve: (title: string) =>
          isPainKillerStubbed ? title : original.relieve(title),
      };
    },
  };
});

vi.mock('../app-shim', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../app-shim')>();
  return {
    ...originalModule,
    App: {
      useApp: () => ({
        message: {
          success: mockMessageSuccess,
          error: mockMessageError,
          info: vi.fn(),
          warning: vi.fn(),
          loading: vi.fn(),
          open: vi.fn(),
          destroy: vi.fn(),
        },
        modal: { confirm: vi.fn() },
      }),
    },
  };
});

// The registry editor has its own Relay/i18n surface, so it is stubbed — but
// the stub records the props it was handed and can fire `onOk`, which is the
// whole contract the "registry not registered" branch depends on.
const mockRegistryEditorRender = vi.fn();

vi.mock('./ContainerRegistryEditorModal', async () => {
  const React = await import('react');
  return {
    default: (props: any) => {
      mockRegistryEditorRender(props);
      return props.open
        ? React.createElement(
            'button',
            {
              type: 'button',
              'data-testid': 'mock-registry-editor-modal',
              onClick: () =>
                props.onOk('create', {
                  id: 'registry-created',
                  registry_name: props.initialValues?.registry_name,
                  project: props.initialValues?.project,
                  url: props.initialValues?.url,
                  type: props.initialValues?.type,
                }),
            },
            'create',
          )
        : null;
    },
  };
});

vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    BAISelect: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-architecture-select',
        'data-value': props.value ?? '',
        'data-disabled': String(!!props.disabled),
      }),
  };
});

type RegistryNodeShape = {
  id: string;
  registry_name: string;
  project: string | null;
  url: string;
  type: string;
};

const REGISTRY: RegistryNodeShape = {
  id: 'registry-1',
  registry_name: 'cr.backend.ai',
  project: 'stable',
  url: 'https://cr.backend.ai',
  type: 'harbor2',
};

const NGC_REGISTRY: RegistryNodeShape = {
  id: 'registry-2',
  registry_name: 'nvcr.io',
  project: 'nvidia',
  url: 'https://nvcr.io',
  type: 'docker',
};

/**
 * The host is registered, but only under `team-a`. Its URL is deliberately not
 * `https://{host}`, so the prefill assertions can tell the sibling row's URL
 * apart from the value `prefillForHost` invents when there is no sibling.
 */
const MIRROR_REGISTRY: RegistryNodeShape = {
  id: 'registry-3',
  registry_name: 'mirror.example.com',
  project: 'team-a',
  url: 'https://mirror.example.com:5000/v2',
  type: 'harbor2',
};

/** Same host as `MIRROR_REGISTRY`, the project the pasted line names. */
const MIRROR_TEAM_B_REGISTRY: RegistryNodeShape = {
  ...MIRROR_REGISTRY,
  id: 'registry-4',
  project: 'team-b',
};

const PYTHON = 'cr.backend.ai/stable/python:3.9-ubuntu20.04';
const PYTORCH = 'nvcr.io/nvidia/pytorch:25.01-py3';
const MIRRORED = 'mirror.example.com/team-b/python:3.12';

const scanOk = () => ({
  item: {
    id: 'image-id',
    name: 'name',
    registry: 'cr.backend.ai',
    project: 'stable',
    tag: 'tag',
    architecture: 'x86_64',
  },
  errors: [],
});

/** Every page the registry query has actually resolved, across refetches. */
let registryPageFetchCount = 0;

/**
 * Queue one round of the paged registry query. Call it again to stage the
 * round a refetch will consume.
 */
const queueRegistryPages = (
  environment: ReturnType<typeof createMockEnvironment>,
  registryPages: Array<Array<RegistryNodeShape>>,
) => {
  registryPages.forEach((nodes, index) => {
    const hasNextPage = index < registryPages.length - 1;
    environment.mock.queueOperationResolver(() => {
      registryPageFetchCount += 1;
      return {
        data: {
          container_registry_nodes: {
            edges: nodes.map((node) => ({ node })),
            pageInfo: {
              hasNextPage,
              endCursor: hasNextPage ? `cursor-${index}` : null,
            },
          },
        },
      };
    });
  });
};

const renderModal = (
  registryPages: Array<Array<RegistryNodeShape>> = [[REGISTRY, NGC_REGISTRY]],
) => {
  const environment = createMockEnvironment();
  queueRegistryPages(environment, registryPages);
  const onRequestClose = vi.fn();
  const onAdded = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <RelayEnvironmentProvider environment={environment}>
        <ImportImageModal
          open
          onRequestClose={onRequestClose}
          onAdded={onAdded}
        />
      </RelayEnvironmentProvider>
    </QueryClientProvider>,
  );
  return { environment, onRequestClose, onAdded };
};

const typeReferences = async (value: string) => {
  const textArea = await screen.findByLabelText(
    'environment.ImportImageReferences',
  );
  fireEvent.change(textArea, { target: { value } });
  return textArea as HTMLTextAreaElement;
};

const importButton = () =>
  screen.getByRole('button', { name: 'environment.ImportImage' });
const retryButton = () =>
  screen.getByRole('button', { name: 'environment.ImportImageRetryFailed' });
const architectureSelect = () => screen.getByTestId('mock-architecture-select');
/** The dialog header's X. Astryx names it from its own English catalogue. */
const closeButton = () => screen.queryByRole('button', { name: 'Close' });
const cancelButton = () =>
  screen.getByRole('button', { name: 'button.Cancel' });
const addRegistryButton = () =>
  screen.getByRole('button', { name: 'registry.AddRegistry' });
/** The props of the last render in which the editor was actually open. */
const lastOpenEditorProps = () => {
  const openCalls = mockRegistryEditorRender.mock.calls.filter(
    ([props]) => props.open,
  );
  return openCalls[openCalls.length - 1]?.[0];
};

describe('ImportImageModal (FR-3940 review round)', () => {
  beforeEach(() => {
    mockScanRequest.mockReset();
    mockMessageSuccess.mockReset();
    mockMessageError.mockReset();
    mockRegistryEditorRender.mockReset();
    registryPageFetchCount = 0;
    isPainKillerStubbed = true;
    (globalThis as any).backendaiwebui = { debug: false };
  });

  it('matches against registries from every page of the connection', async () => {
    // `nvcr.io` only exists on the second page: a single-page fetch would
    // report it as an unregistered registry.
    renderModal([[REGISTRY], [NGC_REGISTRY]]);
    await typeReferences(PYTORCH);

    await waitFor(() =>
      expect(
        screen.getByText(/environment\.ImportImageReady/),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText('environment.ImportImageRegistryNotRegistered'),
    ).not.toBeInTheDocument();
    expect(importButton()).toBeEnabled();
  });

  it('reports the whole batch, calls onAdded and closes when every line succeeds', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockResolvedValue(scanOk());
    const { onRequestClose, onAdded } = renderModal();
    await typeReferences(`${PYTHON}\n${PYTORCH}`);

    await user.click(importButton());

    await waitFor(() => expect(onRequestClose).toHaveBeenCalled());
    expect(mockScanRequest).toHaveBeenCalledTimes(2);
    expect(onAdded).toHaveBeenCalledWith([PYTHON, PYTORCH]);
    expect(mockMessageSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'environment.ImagesSuccessfullyAdded:2',
      }),
    );
  });

  it('locks the succeeded line and keeps only the failed one editable after a partial failure', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockImplementation(({ body }: any) =>
      body.canonical === PYTHON
        ? Promise.resolve(scanOk())
        : Promise.reject({ statusCode: 403 }),
    );
    const { onRequestClose } = renderModal();
    const textArea = await typeReferences(`${PYTHON}\n${PYTORCH}`);

    expect(architectureSelect()).toHaveAttribute('data-disabled', 'false');
    await user.click(importButton());

    await waitFor(() =>
      expect(screen.getByTestId('import-image-added-row')).toBeInTheDocument(),
    );
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(mockMessageSuccess).not.toHaveBeenCalled();

    // The succeeded canonical moved into the read-only row…
    expect(screen.getByTestId('import-image-added-row')).toHaveTextContent(
      PYTHON,
    );
    // …and out of the editable text, which keeps only the failure.
    expect(textArea).toHaveValue(PYTORCH);
    expect(
      screen.getByText('environment.ImportImageRequiresSuperadmin'),
    ).toBeInTheDocument();
    // The architecture applies to the whole batch, so it is frozen now.
    expect(architectureSelect()).toHaveAttribute('data-disabled', 'true');
  });

  it('keeps two identical lines apart when one fails and the other succeeds', async () => {
    const user = userEvent.setup();
    let rejectFirstScan: (error: unknown) => void = () => {};
    mockScanRequest
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectFirstScan = reject;
          }),
      )
      .mockResolvedValue(scanOk());
    const { onRequestClose, onAdded } = renderModal();
    const textArea = await typeReferences(`${PYTHON}\n${PYTHON}`);

    await user.click(importButton());

    // Keyed by canonical, both rows would have read the first line's outcome
    // and shown "Scanning" together; `getByText` would then find two.
    await waitFor(() =>
      expect(
        screen.getByText(/environment\.ImportImageScanning/),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/environment\.ImportImageQueued/),
    ).toBeInTheDocument();

    rejectFirstScan({ statusCode: 403 });

    await waitFor(() =>
      expect(screen.getByTestId('import-image-added-row')).toBeInTheDocument(),
    );
    // Each line was submitted on its own…
    expect(mockScanRequest).toHaveBeenCalledTimes(2);
    // …the success did not overwrite the failure…
    expect(
      screen.getByText('environment.ImportImageRequiresSuperadmin'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/environment\.ImportImageFailed/),
    ).toBeInTheDocument();
    // …and the locked list holds the image once, not twice.
    expect(screen.getAllByTestId('import-image-added-row')).toHaveLength(1);
    expect(screen.getByTestId('import-image-added-row')).toHaveTextContent(
      PYTHON,
    );
    expect(onAdded).toHaveBeenCalledWith([PYTHON]);
    // Exactly one line is left to retry: the one that failed.
    expect(textArea).toHaveValue(PYTHON);
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(mockMessageSuccess).not.toHaveBeenCalled();
  });

  it('prefills the registry editor from the sibling row and re-resolves the line once the registry exists', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal([
      [REGISTRY, NGC_REGISTRY, MIRROR_REGISTRY],
    ]);
    // The host is registered, the project is not, so the line is blocked.
    await typeReferences(MIRRORED);

    await waitFor(() =>
      expect(
        screen.getByText(/environment\.ImportImageRegistryNotRegistered/),
      ).toBeInTheDocument(),
    );
    expect(importButton()).toBeDisabled();

    await user.click(addRegistryButton());

    await waitFor(() =>
      expect(
        screen.getByTestId('mock-registry-editor-modal'),
      ).toBeInTheDocument(),
    );
    // The project comes from the pasted line; the URL and the type come from
    // the sibling row for the same host rather than from `https://{host}`.
    expect(lastOpenEditorProps().initialValues).toEqual({
      registry_name: MIRROR_REGISTRY.registry_name,
      project: 'team-b',
      url: MIRROR_REGISTRY.url,
      type: MIRROR_REGISTRY.type,
    });

    // Stage the round the refetch will consume, now carrying the new row.
    queueRegistryPages(environment, [
      [REGISTRY, NGC_REGISTRY, MIRROR_REGISTRY, MIRROR_TEAM_B_REGISTRY],
    ]);
    expect(registryPageFetchCount).toBe(1);

    await user.click(screen.getByTestId('mock-registry-editor-modal'));

    await waitFor(() => expect(registryPageFetchCount).toBe(2));
    expect(mockMessageSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'registry.RegistrySuccessfullyAdded',
      }),
    );
    await waitFor(() =>
      expect(
        screen.getByText(/environment\.ImportImageReady/),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/environment\.ImportImageRegistryNotRegistered/),
    ).not.toBeInTheDocument();
    expect(importButton()).toBeEnabled();
    // The editor closed itself on OK rather than being left open.
    expect(
      screen.queryByTestId('mock-registry-editor-modal'),
    ).not.toBeInTheDocument();
  });

  it('counts the images added across the first run and the retry', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockImplementation(({ body }: any) =>
      body.canonical === PYTHON
        ? Promise.resolve(scanOk())
        : Promise.reject({ statusCode: 403 }),
    );
    const { onRequestClose, onAdded } = renderModal();
    await typeReferences(`${PYTHON}\n${PYTORCH}`);

    await user.click(importButton());
    await waitFor(() =>
      expect(screen.getByTestId('import-image-added-row')).toBeInTheDocument(),
    );

    mockScanRequest.mockResolvedValue(scanOk());
    await user.click(retryButton());

    await waitFor(() => expect(onRequestClose).toHaveBeenCalled());
    // Only the leftover line is resubmitted: 2 calls in the first run, 1 here.
    expect(mockScanRequest).toHaveBeenCalledTimes(3);
    expect(onAdded).toHaveBeenLastCalledWith([PYTORCH]);
    expect(mockMessageSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'environment.ImagesSuccessfullyAdded:2',
      }),
    );
  });

  it('treats a 200 carrying errors[] as a failed line and shows them', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockResolvedValue({
      ...scanOk(),
      errors: ['manifest unknown', 'rescan aborted'],
    });
    const { onRequestClose } = renderModal();
    await typeReferences(PYTHON);

    await user.click(importButton());

    await waitFor(() =>
      expect(
        screen.getByText(/environment\.ImportImageFailed/),
      ).toBeInTheDocument(),
    );
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(mockMessageSuccess).not.toHaveBeenCalled();
    expect(
      screen.getByText('manifest unknown rescan aborted'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('import-image-added-row'),
    ).not.toBeInTheDocument();
  });

  it('blocks every dismissal affordance while a scan request is in flight', async () => {
    const user = userEvent.setup();
    let rejectScan: (error: unknown) => void = () => {};
    mockScanRequest.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectScan = reject;
        }),
    );
    const { onRequestClose } = renderModal();
    await typeReferences(PYTHON);

    await user.click(importButton());
    await waitFor(() => expect(mockScanRequest).toHaveBeenCalled());

    // `BAIUnmountAfterClose` in `ImageList` unmounts this tree on close, so a
    // dismissal here would abandon the sequential loop mid-run.
    expect(closeButton()).not.toBeInTheDocument();
    expect(cancelButton()).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(onRequestClose).not.toHaveBeenCalled();

    // The line fails, so the modal stays open — and dismissal comes back.
    rejectScan({ statusCode: 403 });
    await waitFor(() =>
      expect(
        screen.getByText('environment.ImportImageRequiresSuperadmin'),
      ).toBeInTheDocument(),
    );
    expect(onRequestClose).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');
    expect(onRequestClose).toHaveBeenCalledTimes(1);
    await user.click(closeButton() as HTMLElement);
    expect(onRequestClose).toHaveBeenCalledTimes(2);
  });

  it('recognises a bodiless 500 through the empty Blob the client stores', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockRejectedValue({
      statusCode: 500,
      // `client.ts` reads a bodiless response as `resp.blob()`, so `response`
      // is an empty Blob rather than null.
      response: new Blob([]),
      title: 'internal server error',
    });
    renderModal();
    await typeReferences(PYTHON);

    await user.click(importButton());

    await waitFor(() =>
      expect(
        screen.getByText('environment.ImportImageScanFailedOnServer'),
      ).toBeInTheDocument(),
    );
  });

  it('reports a 500 that carries a text body — the reported case', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockRejectedValue({
      isError: true,
      statusCode: 500,
      statusText: 'Internal Server Error',
      // aiohttp answers `text/plain`, which `client.ts` reads with
      // `resp.text()` — so `response` is a non-empty string, not a Blob.
      response: '500 Internal Server Error\n\nServer got itself in trouble',
      title: '500 Internal Server Error - undefined',
      message:
        'server responded failure: 500 Internal Server Error - undefined',
    });
    renderModal();
    await typeReferences(PYTHON);

    await user.click(importButton());

    await waitFor(() =>
      expect(
        screen.getByText('environment.ImportImageScanFailedOnServer'),
      ).toBeInTheDocument(),
    );
    expect(retryButton()).not.toHaveAttribute('aria-busy');
    expect(cancelButton()).toBeEnabled();
  });

  it('reports the client-side timeout as a scan that may still be running', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockRejectedValue({
      isError: true,
      statusCode: 408,
      statusText: 'Timeout exceeded',
      title: 'Request timeout',
      message: 'No response returned within timeout',
    });
    renderModal();
    await typeReferences(PYTHON);

    await user.click(importButton());

    await waitFor(() =>
      expect(
        screen.getByText('environment.ImportImageScanTimedOut'),
      ).toBeInTheDocument(),
    );
    expect(retryButton()).not.toHaveAttribute('aria-busy');
  });

  it('clears the loading flag even when the error description itself throws', async () => {
    const user = userEvent.setup();
    // The real `relieve` reads `globalThis.backendaiwebui.debug`; without the
    // global it throws from inside the `catch`, which used to escape
    // `handleAdd` and strand the button loading forever (FR-3953).
    isPainKillerStubbed = false;
    delete (globalThis as any).backendaiwebui;
    // A 400 is the one status no branch classifies, so painKiller runs.
    mockScanRequest.mockRejectedValue({
      statusCode: 400,
      title: 'bad request',
    });
    const { onRequestClose } = renderModal();
    await typeReferences(PYTHON);

    await user.click(importButton());

    await waitFor(() =>
      expect(
        screen.getByText(/environment\.ImportImageFailed/),
      ).toBeInTheDocument(),
    );
    expect(retryButton()).not.toHaveAttribute('aria-busy');
    expect(retryButton()).toBeEnabled();
    expect(cancelButton()).toBeEnabled();
    // The row still carries a message rather than staying silent.
    expect(screen.getByText('bad request')).toBeInTheDocument();
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('marks the line in flight and the rest queued, and clears both once they settle', async () => {
    const user = userEvent.setup();
    let resolveFirstScan: (value: unknown) => void = () => {};
    mockScanRequest
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstScan = resolve;
          }),
      )
      .mockResolvedValue(scanOk());
    const { onRequestClose } = renderModal();
    await typeReferences(`${PYTHON}\n${PYTORCH}`);

    await user.click(importButton());

    await waitFor(() =>
      expect(
        screen.getByText(/environment\.ImportImageScanning/),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/environment\.ImportImageQueued/),
    ).toBeInTheDocument();
    expect(importButton()).toHaveAttribute('aria-busy', 'true');

    resolveFirstScan(scanOk());

    await waitFor(() => expect(onRequestClose).toHaveBeenCalled());
    expect(
      screen.queryByText(/environment\.ImportImageScanning/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/environment\.ImportImageQueued/),
    ).not.toBeInTheDocument();
  });
});
