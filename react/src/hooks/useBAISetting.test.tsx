/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { jotaiStore } from '../components/DefaultProviders';
import { clearMyAppConfigs, setMyAppConfigs } from './useAppConfig';
import { useBAISettingUserState } from './useBAISetting';
import { renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={jotaiStore}>{children}</Provider>
);

const readTourFlag = () =>
  renderHook(
    () => useBAISettingUserState('has_opened_tour_back_to_user_view'),
    { wrapper },
  ).result.current[0];

describe('account tour flags', () => {
  beforeEach(() => clearMyAppConfigs(jotaiStore));

  it('reads as opened when the sign-in read failed, so the tour never shows', () => {
    setMyAppConfigs(jotaiStore, null);
    expect(readTourFlag()).toBe(true);
  });

  it('reads the stored value once the account document is loaded', () => {
    setMyAppConfigs(jotaiStore, [
      { configName: 'userConfig', config: { settings: {} } },
    ]);
    expect(readTourFlag()).toBeNull();

    setMyAppConfigs(jotaiStore, [
      {
        configName: 'userConfig',
        config: { settings: { has_opened_tour_back_to_user_view: true } },
      },
    ]);
    expect(readTourFlag()).toBe(true);
  });
});
