/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3846: picking "Off" while the consumer's `defaultAutoUpdateDelay` is still
 * in effect must turn auto-refresh off on the first try, not only after a
 * detour through another interval.
 */
import {
  clearMyAppConfigs,
  myAppConfigState,
  setMyAppConfigs,
} from '../hooks/useAppConfig';
import AutoUpdateFetchKeyButton from './AutoUpdateFetchKeyButton';
import { jotaiStore } from './DefaultProviders';
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import { Provider } from 'jotai';
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

const SETTING_NAME = 'fetchKeyAutoUpdateDelay.session-list';

// The sign-in read of `userConfig`, whose `settings` hold the account settings.
const signIn = (settings: Record<string, unknown>) =>
  setMyAppConfigs(jotaiStore, [
    { configName: 'userConfig', config: { settings } },
  ]);
const accountSettings = () =>
  jotaiStore.get(myAppConfigState).configs.userConfig?.settings;

const renderButton = () =>
  render(
    <Provider store={jotaiStore}>
      <AutoUpdateFetchKeyButton
        settingId="session-list"
        defaultAutoUpdateDelay={15_000}
        onChange={() => {}}
      />
    </Provider>,
  );

describe('AutoUpdateFetchKeyButton', () => {
  beforeEach(() => {
    localStorage.clear();
    clearMyAppConfigs(jotaiStore);
    signIn({});
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

    expect(accountSettings()).toEqual({ [SETTING_NAME]: null });
    expect(localStorage.length).toBe(0);
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
    signIn({ [SETTING_NAME]: null });
    renderButton();
    expect(lastAutoUpdateDelay).toBeNull();
  });

  it('applies an "Off" that a later read brings in', () => {
    renderButton();
    expect(lastAutoUpdateDelay).toBe(15_000);
    act(() => signIn({ [SETTING_NAME]: null }));
    expect(lastAutoUpdateDelay).toBeNull();
  });
});
