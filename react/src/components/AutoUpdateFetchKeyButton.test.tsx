/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3846: picking "Off" while the consumer's `defaultAutoUpdateDelay` is still
 * in effect must turn auto-refresh off on the first try, not only after a
 * detour through another interval.
 */
import AutoUpdateFetchKeyButton from './AutoUpdateFetchKeyButton';
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Capture what the host wrapper actually hands the presentational button; the
// dropdown's own rendering is not under test.
let lastAutoUpdateDelay: number | null | undefined;
let lastOnChangeAutoUpdateDelay: ((delayMs: number | null) => void) | undefined;

vi.mock('backend.ai-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...actual,
    BAIFetchKeyButton: (props: {
      autoUpdateDelay?: number | null;
      onChangeAutoUpdateDelay?: (delayMs: number | null) => void;
    }) => {
      lastAutoUpdateDelay = props.autoUpdateDelay;
      lastOnChangeAutoUpdateDelay = props.onChangeAutoUpdateDelay;
      return <div data-testid="fetch-key-button" />;
    },
  };
});

const SETTING_KEY =
  'backendaiwebui.settings.user.fetchKeyAutoUpdateDelay.session-list';

const renderButton = () =>
  render(
    <AutoUpdateFetchKeyButton
      settingId="session-list"
      defaultAutoUpdateDelay={15_000}
      onChange={() => {}}
    />,
  );

describe('AutoUpdateFetchKeyButton', () => {
  beforeEach(() => {
    localStorage.clear();
    lastAutoUpdateDelay = undefined;
    lastOnChangeAutoUpdateDelay = undefined;
  });

  it('starts at the consumer default when nothing is persisted', () => {
    renderButton();
    expect(lastAutoUpdateDelay).toBe(15_000);
  });

  it('turns auto-refresh off on the first "Off" pick, straight from the default', () => {
    renderButton();
    expect(lastAutoUpdateDelay).toBe(15_000);

    act(() => lastOnChangeAutoUpdateDelay?.(null));

    expect(localStorage.getItem(SETTING_KEY)).toBe('null');
    expect(lastAutoUpdateDelay).toBeNull();
  });

  it('keeps working through the interval -> off detour', () => {
    renderButton();

    act(() => lastOnChangeAutoUpdateDelay?.(30_000));
    expect(lastAutoUpdateDelay).toBe(30_000);

    act(() => lastOnChangeAutoUpdateDelay?.(null));
    expect(lastAutoUpdateDelay).toBeNull();
  });

  it('honours a persisted "Off" over the consumer default on remount', () => {
    localStorage.setItem(SETTING_KEY, 'null');
    renderButton();
    expect(lastAutoUpdateDelay).toBeNull();
  });
});
