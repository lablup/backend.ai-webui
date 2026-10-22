/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { backendaiOptions } from '../global-stores';
import { resolveInitialLanguage } from './resolveInitialLanguage';

/**
 * Stored-language candidates for `resolveInitialLanguage`, in precedence order:
 * `user.selected_language` (the explicit settings-page choice), then
 * `general.language` only when its localStorage key exists. The settings store
 * seeds `general.language` with `'en'` in memory, and treating that seed as a
 * choice would disable browser-language detection (FR-2981).
 */
export const getStoredLanguageCandidates = (): Array<
  string | null | undefined
> => [
  backendaiOptions?.get('selected_language'),
  typeof localStorage !== 'undefined' &&
  localStorage.getItem('backendaiwebui.settings.general.language') !== null
    ? backendaiOptions?.get('language', undefined, 'general')
    : undefined,
];

export const resolveStoredLanguage = () =>
  resolveInitialLanguage(...getStoredLanguageCandidates());
