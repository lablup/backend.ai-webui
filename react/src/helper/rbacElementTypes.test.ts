import enResource from '../../../resources/i18n/en.json';
import { ALL_RBAC_ELEMENT_TYPES } from './rbacElementTypes';
import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const sdlElementTypes = () => {
  const sdl = readFileSync(
    path.resolve(process.cwd(), '../data/schema.graphql'),
    'utf-8',
  );
  const block = /enum RBACElementType\b[^{]*\{([\s\S]*?)\n\}/.exec(sdl);
  if (!block)
    throw new Error('RBACElementType enum not found in schema.graphql');
  return Array.from(block[1].matchAll(/^ {2}([A-Z_]+)\b/gm), (m) => m[1]);
};

describe('ALL_RBAC_ELEMENT_TYPES', () => {
  it('matches the RBACElementType enum in data/schema.graphql', () => {
    expect(ALL_RBAC_ELEMENT_TYPES).toEqual(sdlElementTypes());
  });

  it('has an English label for every value', () => {
    const labels = (enResource as { rbac: { types: Record<string, string> } })
      .rbac.types;
    expect(ALL_RBAC_ELEMENT_TYPES.filter((type) => !labels[type])).toEqual([]);
  });
});
