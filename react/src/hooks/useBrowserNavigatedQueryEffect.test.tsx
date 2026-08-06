/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBrowserNavigatedQueryEffect } from '.';
import { renderHook, act } from '@testing-library/react';

type Values = { tab: string; filter: string | null };

const renderNavigatedEffect = (
  initialValues: Values,
  onNavigated: (values: Values) => void,
) =>
  renderHook(
    ({ values }: { values: Values }) =>
      useBrowserNavigatedQueryEffect(values, onNavigated),
    { initialProps: { values: initialValues } },
  );

describe('useBrowserNavigatedQueryEffect', () => {
  it('runs the callback once when a browser navigation changes the values', () => {
    const onNavigated = vi.fn();
    const { rerender } = renderNavigatedEffect(
      { tab: 'users', filter: null },
      onNavigated,
    );

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    rerender({ values: { tab: 'credentials', filter: null } });

    expect(onNavigated).toHaveBeenCalledTimes(1);
    expect(onNavigated).toHaveBeenCalledWith({
      tab: 'credentials',
      filter: null,
    });

    // The navigation is consumed: a later in-app change must not re-run it.
    rerender({ values: { tab: 'credentials', filter: 'email == "a"' } });
    expect(onNavigated).toHaveBeenCalledTimes(1);
  });

  it('stays silent when the app itself changes the values', () => {
    const onNavigated = vi.fn();
    const { rerender } = renderNavigatedEffect(
      { tab: 'users', filter: null },
      onNavigated,
    );

    rerender({ values: { tab: 'credentials', filter: null } });
    rerender({ values: { tab: 'credentials', filter: 'email == "a"' } });

    expect(onNavigated).not.toHaveBeenCalled();
  });
});
