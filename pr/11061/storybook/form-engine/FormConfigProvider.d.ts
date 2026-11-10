import { FormConfig, RequiredMark } from './context';
import { ValidateMessages } from './interface';
import * as React from 'react';
/**
 * The validate-message table for the language BUI's i18next is currently on.
 *
 * Recomputed on `i18n.language`, which `BAIConfigProvider` drives from the
 * host's language state — so switching the app language re-renders every form
 * with new templates, exactly as antd's `ConfigProvider locale` used to.
 */
export declare function useFormValidateMessages(): ValidateMessages;
/**
 * What antd sourced from `<ConfigProvider form={{...}}>`.
 *
 * `validateMessages` defaults to the localized table, so a form rendered
 * anywhere under this provider gets translated errors without the call site
 * passing anything. An explicit prop still wins, and `<Form validateMessages>`
 * still wins over that (`Form.tsx` merges app config < Form.Provider < form).
 */
/**
 * The `requiredMark="optional"` suffix for the current language. antd read the
 * same string from `locale.Form.optional`; the catalog entry was ported from
 * antd during the FR-3482 Astryx migration.
 */
export declare function useFormOptionalLabel(): string;
export declare const FormConfigProvider: React.FC<FormConfig & {
    children?: React.ReactNode;
}>;
export type { FormConfig, RequiredMark };
