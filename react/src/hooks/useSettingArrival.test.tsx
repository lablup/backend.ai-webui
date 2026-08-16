/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The `?setting=<i18nTitleKey>` arrival contract: highlight the addressed item
 * once it is rendered, expire the highlight, and strip the param without
 * losing the tab it travelled with.
 */
import {
  SETTING_ARRIVAL_HIGHLIGHT_MS,
  useSettingArrival,
} from './useSettingArrival';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TITLES = ['Auto logout', 'Desktop notification'];

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) =>
        key === 'userSettings.AutoLogout' ? 'Auto logout' : key,
    }),
  };
});

const renderArrival = (initialEntry: string, titles = TITLES) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );
  return renderHook(
    () => ({
      arrivalTitle: useSettingArrival(titles),
      search: useLocation().search,
    }),
    { wrapper },
  );
};

describe('useSettingArrival', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('highlights the addressed item, then strips only the setting param', () => {
    const { result } = renderArrival(
      '/usersettings?tab=general&setting=userSettings.AutoLogout',
    );

    expect(result.current.arrivalTitle).toBe('Auto logout');

    act(() => {
      vi.advanceTimersByTime(SETTING_ARRIVAL_HIGHLIGHT_MS);
    });

    expect(result.current.arrivalTitle).toBeNull();
    expect(result.current.search).toBe('?tab=general');
  });

  it('waits while the addressed item is not rendered', () => {
    const { result } = renderArrival(
      '/usersettings?tab=logs&setting=userSettings.AutoLogout',
      [],
    );

    expect(result.current.arrivalTitle).toBeNull();
    // The param survives so the arrival still fires once the right tab renders.
    expect(result.current.search).toBe(
      '?tab=logs&setting=userSettings.AutoLogout',
    );
  });

  it('ignores a key with no matching item title', () => {
    const { result } = renderArrival('/usersettings?setting=nope.NotAKey');

    expect(result.current.arrivalTitle).toBeNull();
    expect(result.current.search).toBe('?setting=nope.NotAKey');
  });

  it('does nothing without the param', () => {
    const { result } = renderArrival('/usersettings?tab=general');

    expect(result.current.arrivalTitle).toBeNull();
    expect(result.current.search).toBe('?tab=general');
  });
});
