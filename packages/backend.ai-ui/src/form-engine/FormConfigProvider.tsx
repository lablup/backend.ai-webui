/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 App-level form configuration — the engine's replacement for antd's
 `<ConfigProvider form={{ validateMessages, requiredMark }}>` (to-astryx
 tickets 34 + 35).

 Lives in its own module rather than in `context.ts` on purpose. `context.ts`
 is engine CORE — `Field`, `FormStore` and `FormItem` all import it — and it
 must stay free of anything heavier than React. This file is the only part of
 the engine that reaches for BUI's i18next instance, and only components that
 actually MOUNT the provider pay for that import.

 ## Where the localized templates come from

 Until ticket 35 the app fed `validateMessages` from
 `antd/es/locale/<lang>.Form.defaultValidateMessages`, which made antd's
 locale bundle a hard dependency of every validation message a user could
 see. The templates now live in BUI's own catalogs under
 `form.validateMessages` (`packages/backend.ai-ui/src/locale/*.json`, all 21
 languages), so the engine is self-contained.

 The STRINGS were ported from Ant Design's locale files
 (https://github.com/ant-design/ant-design, MIT) by
 `.scratch/astryx-migration/extract-validate-messages.mjs` — same wording, so
 no user-visible text changed with the switch. The key shape is BUI's, not
 antd's: `packages/backend.ai-ui/i18n.schema.json` reads a lowercase key as a
 nested object and an uppercase key as a string leaf, hence `types.String`
 rather than `types.string`.

 `${label}` / `${min}` / `${type}` inside those strings are the ENGINE's
 template syntax (see `validate.ts`), not i18next's. BUI's i18next runs with
 `prefix: '{{'`, so it passes `${…}` through untouched.
 */
import { useBAIi18n } from '../hooks/useBAIi18n';
import {
  FormConfigContext,
  type FormConfig,
  type RequiredMark,
} from './context';
import type { ValidateMessages } from './interface';
import { defaultValidateMessages } from './messages';
import type { TFunction } from 'i18next';
import * as React from 'react';

const PREFIX = 'form.validateMessages';

/**
 * i18next returns the KEY when a lookup misses in every language including
 * the `en` fallback. Treat that as "not translated" and keep the engine's own
 * `${name}`-based English rather than showing a dotted key to a user.
 */
function pick(
  t: TFunction,
  key: string,
  fallback?: string,
): string | undefined {
  const full = `${PREFIX}.${key}`;
  const value = t(full);
  return value === full || typeof value !== 'string' ? fallback : value;
}

function buildValidateMessages(t: TFunction): ValidateMessages {
  const d = defaultValidateMessages;
  const group = <T extends Record<string, string | undefined>>(
    name: string,
    keys: readonly string[],
    defaults: T,
  ) =>
    Object.fromEntries(
      keys.map((k) => [
        k,
        pick(t, `${name}.${k[0].toUpperCase()}${k.slice(1)}`, defaults[k]),
      ]),
    );

  const lenKeys = ['len', 'min', 'max', 'range'] as const;

  return {
    default: pick(t, 'Default', d.default as string),
    required: pick(t, 'Required', d.required as string),
    whitespace: pick(t, 'Whitespace', d.whitespace as string),
    types: group('types', ['string', 'number', 'object', 'email', 'url'], {
      ...(d.types as Record<string, string>),
    }),
    string: group('string', lenKeys, {
      ...(d.string as Record<string, string>),
    }),
    number: group('number', lenKeys, {
      ...(d.number as Record<string, string>),
    }),
    array: group('array', lenKeys, { ...(d.array as Record<string, string>) }),
    pattern: {
      mismatch: pick(
        t,
        'pattern.Mismatch',
        (d.pattern as Record<string, string>)?.mismatch,
      ),
    },
  };
}

/**
 * The validate-message table for the language BUI's i18next is currently on.
 *
 * Recomputed on `i18n.language`, which `BAIConfigProvider` drives from the
 * host's language state — so switching the app language re-renders every form
 * with new templates, exactly as antd's `ConfigProvider locale` used to.
 */
export function useFormValidateMessages(): ValidateMessages {
  'use memo';
  const { t, i18n } = useBAIi18n();
  const language = i18n.language;
  return React.useMemo(
    () => buildValidateMessages(t),
    // `t` is stable per language; `language` is the real trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, language],
  );
}

/**
 * What antd sourced from `<ConfigProvider form={{...}}>`.
 *
 * `validateMessages` defaults to the localized table, so a form rendered
 * anywhere under this provider gets translated errors without the call site
 * passing anything. An explicit prop still wins, and `<Form validateMessages>`
 * still wins over that (`Form.tsx` merges app config < Form.Provider < form).
 */
export const FormConfigProvider: React.FC<
  FormConfig & { children?: React.ReactNode }
> = ({ children, ...config }) => {
  const parent = React.useContext(FormConfigContext);
  const localized = useFormValidateMessages();

  const value = React.useMemo(
    () => ({
      ...parent,
      ...config,
      validateMessages:
        config.validateMessages ?? parent.validateMessages ?? localized,
    }),
    // Spread config members explicitly so a fresh object literal at the call
    // site does not re-provide (and re-render every form) on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parent, config.validateMessages, config.requiredMark, localized],
  );

  return React.createElement(FormConfigContext.Provider, { value }, children);
};

export type { FormConfig, RequiredMark };
