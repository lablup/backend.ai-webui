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
 * Behavioural tests for the Copilot review round of FR-3940: the registry list
 * is paged to exhaustion, a bodiless 500 is recognised through the empty Blob
 * `client.ts` stores, a partially successful batch locks what succeeded, and
 * the closing toast counts the whole batch — retries included.
 */

const mockScanRequest = vi.fn();
const mockMessageSuccess = vi.fn();

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

vi.mock('../hooks/usePainKiller', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/usePainKiller')>();
  return {
    ...originalModule,
    usePainKiller: () => ({ relieve: (title: string) => title }),
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
          error: vi.fn(),
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

// The registry editor has its own Relay/i18n surface and is only reachable
// from the "registry not registered" branch, which these tests do not take.
vi.mock('./ContainerRegistryEditorModal', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      props.open
        ? React.createElement('div', {
            'data-testid': 'mock-registry-editor-modal',
          })
        : null,
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

const PYTHON = 'cr.backend.ai/stable/python:3.9-ubuntu20.04';
const PYTORCH = 'nvcr.io/nvidia/pytorch:25.01-py3';

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

const renderModal = (
  registryPages: Array<Array<RegistryNodeShape>> = [[REGISTRY, NGC_REGISTRY]],
) => {
  const environment = createMockEnvironment();
  registryPages.forEach((nodes, index) => {
    const hasNextPage = index < registryPages.length - 1;
    environment.mock.queueOperationResolver(() => ({
      data: {
        container_registry_nodes: {
          edges: nodes.map((node) => ({ node })),
          pageInfo: {
            hasNextPage,
            endCursor: hasNextPage ? `cursor-${index}` : null,
          },
        },
      },
    }));
  });
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

describe('ImportImageModal (FR-3940 review round)', () => {
  beforeEach(() => {
    mockScanRequest.mockReset();
    mockMessageSuccess.mockReset();
  });

  it('matches against registries from every page of the connection', async () => {
    // `nvcr.io` only exists on the second page: a single-page fetch would
    // report it as an unregistered registry.
    renderModal([[REGISTRY], [NGC_REGISTRY]]);
    await typeReferences(PYTORCH);

    await waitFor(() =>
      expect(
        screen.getByText('environment.ImportImageReady'),
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
      expect(screen.getByTestId('import-image-added-list')).toBeInTheDocument(),
    );
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(mockMessageSuccess).not.toHaveBeenCalled();

    // The succeeded canonical moved into the read-only list…
    expect(screen.getByTestId('import-image-added-list')).toHaveTextContent(
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
      expect(screen.getByTestId('import-image-added-list')).toBeInTheDocument(),
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
        screen.getByText('environment.ImportImageFailed'),
      ).toBeInTheDocument(),
    );
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(mockMessageSuccess).not.toHaveBeenCalled();
    expect(
      screen.getByText('manifest unknown rescan aborted'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('import-image-added-list'),
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
        screen.getByText('environment.ImportImageTagNotFoundInRegistry'),
      ).toBeInTheDocument(),
    );
  });
});
