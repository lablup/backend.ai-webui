/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/** Test-only: real locale bundles exposed as plain key -> string resolvers. */
import fs from 'node:fs';
import path from 'node:path';

const load = (lng: string): Record<string, unknown> =>
  JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, `../../resources/i18n/${lng}.json`),
      'utf8',
    ),
  );

export const makeTranslator = (lng: string): ((key: string) => string) => {
  const bundle = load(lng);
  return (key) => {
    const value = key
      .split('.')
      .reduce<unknown>(
        (acc, part) => (acc as Record<string, unknown> | undefined)?.[part],
        bundle,
      );
    return typeof value === 'string' ? value : key;
  };
};

export const tEn = makeTranslator('en');
export const tKo = makeTranslator('ko');
