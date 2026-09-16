import enResource from '../../../resources/i18n/en.json';
import { ALL_RBAC_ELEMENT_TYPES } from './rbacElementTypes';
import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

// Manager 26.9.0 removed the enum; the 26.8 compat file (ADR 0005) declares it.
const SCHEMA_FILES = [
  '../data/schema.graphql',
  '../data/compat/rbac-manager-26-8.graphql',
];

const sdlElementTypes = () => {
  const sdl = SCHEMA_FILES.map((file) =>
    readFileSync(path.resolve(process.cwd(), file), 'utf-8'),
  ).join('\n');
  const block = /enum RBACElementType\b[^{]*\{([\s\S]*?)\n\}/.exec(sdl);
  if (!block)
    throw new Error('RBACElementType enum not found in the schema files');
  return Array.from(block[1].matchAll(/^ {2}([A-Z_]+)\b/gm), (m) => m[1]);
};

describe('ALL_RBAC_ELEMENT_TYPES', () => {
  it('matches the RBACElementType enum in the schema files', () => {
    expect(ALL_RBAC_ELEMENT_TYPES).toEqual(sdlElementTypes());
  });

  it('has an English label for every value', () => {
    const labels = (enResource as { rbac: { types: Record<string, string> } })
      .rbac.types;
    expect(ALL_RBAC_ELEMENT_TYPES.filter((type) => !labels[type])).toEqual([]);
  });
});
