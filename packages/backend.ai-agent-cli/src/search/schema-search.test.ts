import { resolveRepoContext } from '../repo-context.js';
import { runSearch } from './engine.js';
import { clearSchemaCache } from './schema-sdl.js';
import { clearSchemaEntryCache } from './schema-search.js';
import { mkdtempSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sdl = (fieldName: string): string => `
"""A frobnicator for the cache test."""
type FrobnicatorNode {
  """The ${fieldName} of the frobnicator."""
  ${fieldName}: String
}
`;

const writeSdl = (path: string, fieldName: string, mtime: number): void => {
  writeFileSync(path, sdl(fieldName));
  utimesSync(path, new Date(mtime), new Date(mtime));
};

describe('schema entry cache', () => {
  it('rebuilds the candidates when the SDL changes under the same path', () => {
    clearSchemaCache();
    clearSchemaEntryCache();
    const dir = mkdtempSync(join(tmpdir(), 'bai-agent-sdl-'));
    const schemaPath = join(dir, 'schema.graphql');
    const context = {
      ...resolveRepoContext(import.meta.dirname),
      schemaPath,
    };
    const ids = (query: string): string[] =>
      runSearch(context, {
        query,
        lang: 'en',
        domains: ['schema'],
        limit: 10,
      }).hits.map((hit) => hit.id);

    writeSdl(schemaPath, 'wibbleCount', 1_000_000_000_000);
    expect(ids('wibbleCount')).toContain('schema:FrobnicatorNode.wibbleCount');
    expect(ids('wobbleTotal')).not.toContain(
      'schema:FrobnicatorNode.wobbleTotal',
    );

    writeSdl(schemaPath, 'wobbleTotal', 2_000_000_000_000);
    expect(ids('wobbleTotal')).toContain('schema:FrobnicatorNode.wobbleTotal');
    expect(ids('wibbleCount')).not.toContain(
      'schema:FrobnicatorNode.wibbleCount',
    );
  });
});
