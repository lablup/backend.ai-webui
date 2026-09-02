import { i18n as buiI18n } from '../locale';
import { useTranslation } from 'react-i18next';

/**
 * Translation hook for BUI components — binds explicitly to BUI's own
 * i18next instance.
 *
 * By passing `{ i18n: buiI18n }` to `useTranslation`, react-i18next
 * bypasses its React Context lookup entirely and uses the supplied
 * instance directly. This means BUI components always resolve keys
 * against BUI's bundles, regardless of what i18n provider the host
 * app has (or whether the host uses react-i18next at all).
 *
 * Compared to the namespace-sharing approach (Option B), this keeps
 * BUI fully self-contained:
 *   - The host's `i18n.init({...})` does not need `ns: ['backend.ai-ui']`,
 *     `nsSeparator: '^'`, or any `registerBAIResources` call.
 *   - BUI can be consumed by an app that uses an entirely different
 *     i18n stack (FormatJS, LinguiJS, none at all).
 *
 * Trade-off: host and BUI run two physical i18n instances, so language
 * changes must be synchronised — `BAIConfigProvider` already does this
 * by calling `buiI18n.changeLanguage(...)` whenever the `locale` prop
 * changes.
 *
 * Return shape matches `useTranslation()` — `{ t, i18n, ready }` — so
 * call sites only need to swap the hook name.
 */
export const useBAIi18n = () => {
  'use memo';
  return useTranslation(undefined, { i18n: buiI18n });
};
