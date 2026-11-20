import { waitForGraphQL } from './dashboard-util';
import type { Page } from '@playwright/test';

type AccountSettings = Record<string, unknown>;

// The `userConfig.settings` an upsert writes (ADR 0035), or undefined.
const writtenSettings = (variables: any): AccountSettings | undefined => {
  const item = variables?.input?.items?.find(
    (entry: any) => entry?.configName === 'userConfig',
  );
  const config =
    typeof item?.config === 'string' ? JSON.parse(item.config) : item?.config;
  return config?.settings;
};

/**
 * Resolves when an account settings write whose `settings` pass `matches`
 * lands. Start it before the change: the write is debounced by 500ms.
 */
export const waitForAccountSettingsWrite = (
  page: Page,
  matches: (settings: AccountSettings) => boolean,
  timeout = 15_000,
) =>
  waitForGraphQL(
    page,
    'useAppConfigMyUpsertMutation',
    (variables) => {
      const settings = writtenSettings(variables);
      return !!settings && matches(settings);
    },
    timeout,
  );

/** Resolves when a write stores `name` as `value`; `undefined` means removed. */
export const waitForAccountSettingWrite = (
  page: Page,
  name: string,
  value: unknown,
  timeout?: number,
) =>
  waitForAccountSettingsWrite(
    page,
    (settings) =>
      value === undefined
        ? !(name in settings)
        : JSON.stringify(settings[name]) === JSON.stringify(value),
    timeout,
  );

/** Resolves once MainLayout has started the account settings sync. */
export const waitForAccountSettingsSync = (page: Page) =>
  page.waitForFunction(() => (globalThis as any).__mainLayoutReady === true);
