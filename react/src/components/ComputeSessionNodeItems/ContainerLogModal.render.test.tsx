/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * What the user sees when the container-log request fails.
 *
 * The manager returns a bare 500 for a kernel its agent no longer holds in
 * memory, and before this the viewer rendered an empty log body with nothing
 * said — indistinguishable from a session that genuinely logged nothing.
 */
import ContainerLogModal from './ContainerLogModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-relay')>()),
  useFragment: () => ({
    id: 'session-node-id',
    row_id: '11111111-2222-3333-4444-555555555555',
    name: 'my-session',
    status: 'RUNNING',
    access_key: 'AKIATEST',
    kernel_nodes: {
      edges: [
        {
          node: {
            id: 'kernel-node-id',
            row_id: '01a08403-eacd-704d-9b18-068bc0fc7642',
            container_id: 'container-id',
            cluster_idx: 0,
            cluster_role: 'main',
            cluster_hostname: 'main1',
          },
        },
      ],
    },
  }),
}));

const getLogs = vi.fn();
vi.mock('../../hooks', () => ({
  useSuspendedBackendaiClient: () => ({ get_logs: getLogs }),
}));

vi.mock('../../theme-shim', () => ({
  useBAIBreakpoint: () => ({ md: true }),
}));

vi.mock('../AutoUpdateFetchKeyButton', () => ({
  default: () => <button type="button">refresh</button>,
}));

// The real viewer measures its container and paints through a virtualised
// list, neither of which jsdom provides.
vi.mock('@melloware/react-logviewer', () => ({
  LazyLog: ({ text }: { text: string }) => (
    <pre data-testid="log-body">{text}</pre>
  ),
  ScrollFollow: ({
    render: renderProp,
  }: {
    render: (props: { follow: boolean; onScroll: () => void }) => ReactElement;
  }) => renderProp({ follow: false, onScroll: () => {} }),
}));

/**
 * The exact object `Client._wrapWithPromise` throws for the manager's
 * `backendai_generic_internal-error` problem+json body.
 */
const serverError = {
  isError: true,
  type: 'https://api.backend.ai/probs/server-error',
  statusCode: 500,
  statusText: 'Internal Server Error',
  title: '500 Internal Server Error - ',
  message:
    'server responded failure: 500 Internal Server Error - Internal server error',
  description: 'Internal server error',
  error_code: 'backendai_generic_internal-error',
  traceback:
    'Traceback (most recent call last):\n  File "agent.py", line 3650, in get_logs\nKeyError: UUID(\'01a08403-eacd-704d-9b18-068bc0fc7642\')\n',
};

const renderModal = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ContainerLogModal open sessionFrgmt={{} as never} />
    </QueryClientProvider>,
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe('ContainerLogModal', () => {
  it('names the failure and shows the manager message when the log request fails', async () => {
    getLogs.mockRejectedValue(serverError);
    renderModal();

    await waitFor(() => {
      expect(
        screen.getByText('kernel.FailedToLoadContainerLogs'),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        /Internal server error \(backendai_generic_internal-error\)/,
      ),
    ).toBeInTheDocument();
    // The traceback is operator noise and must not reach the dialog.
    expect(screen.queryByText(/Traceback/)).not.toBeInTheDocument();
  });

  it('shows no alert once logs arrive', async () => {
    getLogs.mockResolvedValue({ result: { logs: 'hello from the container' } });
    renderModal();

    await waitFor(() => {
      expect(screen.getByTestId('log-body')).toHaveTextContent(
        'hello from the container',
      );
    });
    expect(
      screen.queryByText('kernel.FailedToLoadContainerLogs'),
    ).not.toBeInTheDocument();
  });
});
