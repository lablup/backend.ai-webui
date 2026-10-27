/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import FolderExplorerOpener, {
  useFolderExplorerOpener,
} from './FolderExplorerOpener';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { Suspense, startTransition } from 'react';
import {
  Link,
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const messageError = vi.fn();
vi.mock('../app-shim', () => ({
  App: { useApp: () => ({ message: { error: messageError } }) },
}));

// Stands in for the explorer: reports the props the opener hands it.
vi.mock('./FolderExplorerModalV2', () => {
  const FakeExplorer = ({
    vfolderID,
    onRequestClose,
    open,
  }: {
    vfolderID: string;
    onRequestClose: () => void;
    open?: boolean;
  }) => {
    if (vfolderID === 'folderbroken') {
      throw new Error('explorer failed to render');
    }
    return (
      <div data-testid="explorer" data-open={String(!!open)}>
        <span data-testid="explorer-folder">{vfolderID}</span>
        <button onClick={onRequestClose}>close-explorer</button>
      </div>
    );
  };
  return { default: FakeExplorer };
});

const Page = () => {
  const { open, generateFolderPath } = useFolderExplorerOpener();
  const location = useLocation();
  return (
    <>
      <div data-testid="location">{`${location.pathname}${location.search}`}</div>
      <button onClick={() => open('folder-a')}>open-a</button>
      <button onClick={() => open('folder-b')}>open-b</button>
      {/* The folder name in a table row is a router link, not a nuqs setter. */}
      <Link to={generateFolderPath('folder-a')}>link-a</Link>
      <Link to={generateFolderPath('folder-broken')}>link-broken</Link>
    </>
  );
};

// A browser router over jsdom's own history, so a link's `pushState` reaches
// the nuqs adapter the way it does in the app.
const renderOpener = () => {
  window.history.replaceState(null, '', '/data?order=name');
  const router = createBrowserRouter([
    {
      path: '*',
      element: (
        <>
          <Page />
          {/* The app mounts the opener the same way (routes.tsx). */}
          <Suspense fallback={null}>
            <ErrorBoundaryWithNullFallback>
              <FolderExplorerOpener />
            </ErrorBoundaryWithNullFallback>
          </Suspense>
        </>
      ),
    },
  ]);
  render(
    <NuqsAdapter defaultOptions={{ shallow: false }}>
      <RouterProvider router={router} />
    </NuqsAdapter>,
  );
};

const expectOpen = (open: boolean) =>
  vi.waitFor(() => {
    expect(screen.getByTestId('explorer')).toHaveAttribute(
      'data-open',
      String(open),
    );
  });

describe('FolderExplorerOpener', () => {
  afterEach(() => {
    messageError.mockClear();
  });

  it('keeps the explorer mounted while closed, so its lazy chunk is resolved before the first open', async () => {
    renderOpener();

    expect(await screen.findByTestId('explorer')).toHaveAttribute(
      'data-open',
      'false',
    );
  });

  it('opens the explorer on the requested folder and closes it on request', async () => {
    renderOpener();
    await screen.findByTestId('explorer');

    fireEvent.click(screen.getByText('open-a'));
    await expectOpen(true);
    // Dashes are stripped for the explorer's id form.
    expect(screen.getByTestId('explorer-folder')).toHaveTextContent('foldera');

    fireEvent.click(screen.getByText('close-explorer'));
    await expectOpen(false);

    fireEvent.click(screen.getByText('open-b'));
    await vi.waitFor(() => {
      expect(screen.getByTestId('explorer-folder')).toHaveTextContent(
        'folderb',
      );
    });
  });

  it('drops only its own params on close', async () => {
    renderOpener();
    await screen.findByTestId('explorer');
    fireEvent.click(screen.getByText('link-a'));
    await expectOpen(true);
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/data?order=name&folder=folder-a',
    );

    fireEvent.click(screen.getByText('close-explorer'));

    await expectOpen(false);
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/data?order=name',
    );
  });

  // nuqs applies a link's URL change in a transition, and React holds every
  // transition back while an async action (a `BAIButton` `action`, Astryx
  // `clickAction`) is pending: the URL gained `?folder=` and nothing opened.
  it('opens from a folder link while an async action is still pending', async () => {
    renderOpener();
    await screen.findByTestId('explorer');
    let settleAction = () => {};
    act(() => {
      startTransition(async () => {
        await new Promise<void>((resolve) => {
          settleAction = resolve;
        });
      });
    });

    fireEvent.click(screen.getByText('link-a'));

    await expectOpen(true);
    await act(async () => settleAction());
  });

  // The null boundary around the opener never resets, so one throw used to
  // leave every later folder click changing the URL and opening nothing.
  it('opens the next folder after an explorer failed to render', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    renderOpener();
    await screen.findByTestId('explorer');

    fireEvent.click(screen.getByText('link-broken'));

    await vi.waitFor(() => {
      expect(messageError).toHaveBeenCalledTimes(1);
    });
    // The URL stops claiming a folder is open.
    await vi.waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        /^\/data\?order=name$/,
      );
    });

    fireEvent.click(screen.getByText('link-a'));

    await expectOpen(true);
    expect(screen.getByTestId('explorer-folder')).toHaveTextContent('foldera');
    consoleError.mockRestore();
  });
});
