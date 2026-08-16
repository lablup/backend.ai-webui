/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The lift itself is the contract: the `[` / `]` owners and the search palette
 * are separate components, so both must see one state.
 */
import {
  useNotificationDrawerState,
  useSiderCollapsedState,
} from './useShellPanels';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let compactSidebar = false;

vi.mock('./useBAISetting', () => ({
  useBAISettingUserState: () => [compactSidebar, vi.fn()],
}));

/** Two consumers of the same store — the layout and the palette. */
const renderPair = <T,>(hook: () => T) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  );
  const shared = renderHook(() => ({ owner: hook(), palette: hook() }), {
    wrapper,
  });
  return shared;
};

describe('useNotificationDrawerState', () => {
  it('shares the drawer state between two consumers', () => {
    const { result } = renderPair(useNotificationDrawerState);
    expect(result.current.owner[0]).toBe(false);

    act(() => result.current.palette[1](true));
    expect(result.current.owner[0]).toBe(true);

    act(() => result.current.owner[1]((open) => !open));
    expect(result.current.palette[0]).toBe(false);
  });
});

describe('useSiderCollapsedState', () => {
  beforeEach(() => {
    compactSidebar = false;
  });

  it('follows the compact_sidebar setting until something toggles it', () => {
    compactSidebar = true;
    const { result } = renderPair(useSiderCollapsedState);
    expect(result.current.owner[0]).toBe(true);

    act(() => result.current.palette[1]((collapsed) => !collapsed));
    expect(result.current.owner[0]).toBe(false);
  });

  it('shares the toggle between two consumers', () => {
    const { result } = renderPair(useSiderCollapsedState);
    expect(result.current.owner[0]).toBe(false);

    act(() => result.current.palette[1]((collapsed) => !collapsed));
    expect(result.current.owner[0]).toBe(true);

    act(() => result.current.owner[1](false));
    expect(result.current.palette[0]).toBe(false);
  });
});
