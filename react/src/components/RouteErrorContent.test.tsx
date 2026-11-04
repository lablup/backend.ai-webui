/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { routeErrorScreenAtom } from '../helper/routeErrorScreen';
import RouteErrorContent from './RouteErrorContent';
import { render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../hooks/useThemeMode', () => ({
  useThemeMode: () => ({ isDarkMode: false }),
}));

describe('RouteErrorContent', () => {
  it('publishes its screen while mounted and clears it on unmount', () => {
    const store = createStore();
    const { getByText, unmount } = render(
      <Provider store={store}>
        <RouteErrorContent kind="forbidden" label="Unauthorized Access" />
      </Provider>,
    );

    expect(getByText('Unauthorized Access')).toBeTruthy();
    expect(store.get(routeErrorScreenAtom)).toEqual({
      kind: 'forbidden',
      label: 'Unauthorized Access',
    });

    unmount();
    expect(store.get(routeErrorScreenAtom)).toBeNull();
  });
});
