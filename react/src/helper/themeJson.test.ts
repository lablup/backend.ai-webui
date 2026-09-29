/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The shipped appearance document, its JSON schema and the loader are three
 hand-maintained artifacts; this keeps them agreeing (the schema generator
 that used to enforce it went away with the antd vocabulary, FR-3605).
 */
import { pickValidAppearanceConfig } from './customThemeConfig';
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const resources = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../resources',
);
const readJson = (name: string) =>
  JSON.parse(readFileSync(resolve(resources, name), 'utf8'));

describe('resources/theme.json', () => {
  const themeJson = readJson('theme.json');
  const schema = readJson('theme.schema.json');

  it('validates against resources/theme.schema.json', () => {
    const validate = new Ajv({ allErrors: true }).compile(schema);
    expect(validate(themeJson), JSON.stringify(validate.errors)).toBe(true);
  });

  it('is accepted by the loader with its default family', () => {
    const doc = pickValidAppearanceConfig(themeJson, 'theme.json');
    expect(doc).toBeDefined();
    expect(doc?.theme?.families?.default).toBeDefined();
  });
});
