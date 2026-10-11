/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The `?action=add` arrival contract: open the page's create modal once, strip
 * the param and nothing else, and do both while an async action is pending.
 */
import { useCreateActionArrival } from './useCreateActionArrival';
import { act, render, screen } from '@testing-library/react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { startTransition } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const open = vi.fn();

const Page = () => {
  useCreateActionArrival(open);
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
};

const renderPage = (initialUrl: string) => {
  open.mockClear();
  window.history.replaceState(null, '', initialUrl);
  const router = createBrowserRouter([{ path: '*', element: <Page /> }]);
  render(
    <NuqsAdapter defaultOptions={{ shallow: false }}>
      <RouterProvider router={router} />
    </NuqsAdapter>,
  );
  return { router };
};

describe('useCreateActionArrival', () => {
  it('opens once on a cold arrival and strips only its own param', async () => {
    renderPage('/data?order=name&action=add');

    await vi.waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        /^\/data\?order=name$/,
      );
    });
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('ignores any other action value', () => {
    renderPage('/data?action=remove');

    expect(open).not.toHaveBeenCalled();
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/data?action=remove',
    );
  });

  // The palette navigates through the router; nuqs applies that URL change in
  // a transition, which React holds back while an async action is pending.
  it('arrives on the page it is already on while an async action is pending', async () => {
    const { router } = renderPage('/data?order=name');
    let settleAction = () => {};
    act(() => {
      startTransition(async () => {
        await new Promise<void>((resolve) => {
          settleAction = resolve;
        });
      });
    });

    await act(() => router.navigate('/data?order=name&action=add'));

    expect(open).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('location')).toHaveTextContent(
      /^\/data\?order=name$/,
    );
    await act(async () => settleAction());
  });
});
