/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The dashboard's session-detail drawer lives here and is driven by
 * `?sessionDetail=`, which the board's session panels set through the router.
 */
import RecentlyCreatedSession from './RecentlyCreatedSession';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { startTransition } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-relay', () => ({
  graphql: () => ({}),
  useRefetchableFragment: () => [
    { compute_session_nodes: { edges: [{ node: { id: 'session-a' } }] } },
    vi.fn(),
  ],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@lablup/ui-common/theme', () => ({
  useTheme: () => ({ token: (name: string) => name }),
}));

vi.mock('backend.ai-ui', () => ({
  filterOutNullAndUndefined: <T,>(items?: Array<T | null | undefined>) =>
    (items ?? []).filter((item) => item != null),
  toLocalId: (id: string) => id,
  BAIFlex: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  BAIUnmountAfterClose: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  BAIFetchKeyButton: () => null,
  BAIBoardItemTitle: () => null,
}));

vi.mock('./SessionNodes', () => ({
  default: ({
    onClickSessionName,
  }: {
    onClickSessionName: (session: { id: string }) => void;
  }) => (
    <button onClick={() => onClickSessionName({ id: 'session-a' })}>
      open-a
    </button>
  ),
}));

vi.mock('./SessionDetailDrawer', () => ({
  default: ({
    open,
    sessionId,
    onClose,
  }: {
    open: boolean;
    sessionId?: string;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="drawer">
        <span data-testid="session-id">{sessionId}</span>
        <button onClick={onClose}>close-drawer</button>
      </div>
    ) : null,
}));

const LocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
};

const renderPanel = () => {
  window.history.replaceState(null, '', '/dashboard?board=main');
  const router = createBrowserRouter([
    {
      path: '*',
      element: (
        <>
          <LocationProbe />
          <RecentlyCreatedSession queryRef={{} as never} project={null} />
        </>
      ),
    },
  ]);
  render(
    <NuqsAdapter defaultOptions={{ shallow: false }}>
      <RouterProvider router={router} />
    </NuqsAdapter>,
  );
  return { router };
};

describe('RecentlyCreatedSession session-detail drawer', () => {
  it('opens from its own list and closes, keeping the other params', async () => {
    renderPanel();

    fireEvent.click(screen.getByText('open-a'));
    expect(await screen.findByTestId('session-id')).toHaveTextContent(
      'session-a',
    );
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/dashboard?board=main&sessionDetail=session-a',
    );

    fireEvent.click(screen.getByText('close-drawer'));
    await vi.waitFor(() => {
      expect(screen.queryByTestId('drawer')).toBeNull();
    });
    expect(screen.getByTestId('location')).toHaveTextContent(
      /^\/dashboard\?board=main$/,
    );
  });

  it('closes on Back, because opening pushed', async () => {
    renderPanel();
    fireEvent.click(screen.getByText('open-a'));
    await screen.findByTestId('drawer');

    window.history.back();

    await vi.waitFor(() => {
      expect(screen.queryByTestId('drawer')).toBeNull();
    });
  });

  // A board panel opens the drawer with a router navigation; nuqs applies that
  // in a transition, which React holds back while an async action is pending.
  it('opens from a router navigation while an async action is still pending', async () => {
    const { router } = renderPanel();
    let settleAction = () => {};
    act(() => {
      startTransition(async () => {
        await new Promise<void>((resolve) => {
          settleAction = resolve;
        });
      });
    });

    await act(() =>
      router.navigate('/dashboard?board=main&sessionDetail=session-b'),
    );

    expect(screen.getByTestId('session-id')).toHaveTextContent('session-b');
    await act(async () => settleAction());
  });
});
