/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The history contract is the modal's main acceptance criterion and it lives in
 the nuqs adapter's hands, so it is pinned here rather than left to a manual
 pass: opening pushes (Back closes), switching category and closing replace.
*/
import { forgetNonSettingsLocation } from '../helper/userSettingsModal';
import UserSettingsModalOpener, {
  useUserSettingsModal,
} from './UserSettingsModalOpener';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import {
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({}),
  };
});

vi.mock('../hooks/useWebUIMenuItems', () => ({
  useWebUIMenuItems: () => ({ defaultMenuPath: '/start' }),
}));

// The modal itself is `React.lazy` and pulls in Relay, the settings panes and
// the whole Astryx dialog stack; the contract under test is the URL, not the
// dialog, so it is stubbed down to its close button.
vi.mock('./UserSettingsModal', () => ({
  default: ({
    category,
    onCategoryChange,
    onRequestClose,
  }: {
    category: string;
    onCategoryChange: (next: string) => void;
    onRequestClose: () => void;
  }) => (
    <div data-testid="modal">
      <span data-testid="category">{category}</span>
      <button onClick={() => onCategoryChange('logs')}>to logs</button>
      <button onClick={onRequestClose}>close</button>
    </div>
  ),
}));

const LocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
};

const OpenButton = () => {
  const { open } = useUserSettingsModal();
  return <button onClick={() => open('general')}>open settings</button>;
};

// A browser router over jsdom's own history, so push / replace / Back behave as
// they do in the app — `createMemoryRouter` keeps a private stack the nuqs
// adapter does not pop from.
const renderApp = () => {
  window.history.replaceState(null, '', '/session?tab=running');
  const router = createBrowserRouter([
    {
      path: '*',
      element: (
        <>
          <LocationProbe />
          <OpenButton />
          <UserSettingsModalOpener />
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

describe('UserSettingsModalOpener history contract', () => {
  beforeEach(() => {
    forgetNonSettingsLocation();
  });

  it('stays closed until the param appears', () => {
    renderApp();
    expect(screen.queryByTestId('modal')).toBeNull();
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/session?tab=running',
    );
  });

  it("opens over the current page, keeping the page's own query string", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByText('open settings'));

    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('category')).toHaveTextContent('general');
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/session?tab=running&settings=general',
    );
  });

  it('closes on Back, because opening pushed', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByText('open settings'));
    await screen.findByTestId('modal');

    window.history.back();

    await vi.waitFor(() => {
      expect(screen.queryByTestId('modal')).toBeNull();
    });
  });

  it('replaces on a category switch, so Back still closes in one press', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByText('open settings'));
    await screen.findByTestId('modal');
    await user.click(screen.getByText('to logs'));

    await vi.waitFor(() => {
      expect(screen.getByTestId('category')).toHaveTextContent('logs');
    });

    window.history.back();

    await vi.waitFor(() => {
      expect(screen.queryByTestId('modal')).toBeNull();
    });
  });

  it('drops the param on close, replacing so no entry is left behind', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByText('open settings'));
    await screen.findByTestId('modal');
    await user.click(screen.getByText('close'));

    await vi.waitFor(() => {
      expect(screen.queryByTestId('modal')).toBeNull();
    });
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/session?tab=running',
    );
  });
});
