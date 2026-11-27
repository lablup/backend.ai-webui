/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { routeErrorScreenAtom } from '../helper/routeErrorScreen';
import RouteDocumentTitle from './RouteDocumentTitle';
import { act, render, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

const renderAt = (store: ReturnType<typeof createStore>) => {
  const router = createMemoryRouter(
    [
      {
        path: '/admin/users',
        handle: { title: 'User Credentials & Policies' },
        element: <RouteDocumentTitle />,
      },
    ],
    { initialEntries: ['/admin/users'] },
  );
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
};

describe('RouteDocumentTitle', () => {
  it('names the error screen instead of the denied page', async () => {
    const store = createStore();
    renderAt(store);
    await waitFor(() =>
      expect(document.title).toContain('User Credentials & Policies'),
    );

    act(() =>
      store.set(routeErrorScreenAtom, {
        kind: 'forbidden',
        label: 'Unauthorized Access',
      }),
    );
    await waitFor(() =>
      expect(document.title).toContain('Unauthorized Access'),
    );
    expect(document.title).not.toContain('User Credentials');

    act(() => store.set(routeErrorScreenAtom, null));
    await waitFor(() =>
      expect(document.title).toContain('User Credentials & Policies'),
    );
  });
});
