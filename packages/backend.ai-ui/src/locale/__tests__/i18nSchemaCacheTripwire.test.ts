import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

// Guards the lint-cache tripwire: eslint.config.js must inline i18n.schema.json's
// CONTENT (not a path) so schema edits invalidate the locale files' eslint cache.
describe('i18n schema lint-cache tripwire', () => {
  it(
    'inlines the schema content into the no-invalid rule options',
    { timeout: 30_000 },
    () => {
      // jsdom gives this file a non-file import.meta.url; testPath is the real one.
      const pkgRoot = path.resolve(
        path.dirname(expect.getState().testPath ?? ''),
        '../../..',
      );
      // Loaded in a subprocess: vitest's transform breaks the config's own
      // `new URL(..., import.meta.url)`; native node import matches ESLint.
      const configUrl = pathToFileURL(
        path.join(pkgRoot, 'eslint.config.js'),
      ).href;
      const stdout = execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `const config = (await import(${JSON.stringify(configUrl)})).default;
           const entry = config.find(
             (e) =>
               Array.isArray(e.files) &&
               e.files.includes("src/locale/*.json") &&
               e.rules?.["json-schema-validator/no-invalid"],
           );
           console.log(
             JSON.stringify(
               entry?.rules["json-schema-validator/no-invalid"]?.[1] ?? null,
             ),
           );`,
        ],
        { encoding: 'utf8' },
      );
      const options = JSON.parse(stdout);
      expect(options).not.toBeNull();

      const inline = options.schemas[0].schema;

      // A "cleanup" back to a path string would silently restore the stale-cache
      // bug: the rule validates via the files' own $schema either way, so only
      // this inline copy makes the schema content part of the cache hash.
      expect(inline).toBeTypeOf('object');
      expect(inline).toEqual(
        JSON.parse(
          fs.readFileSync(path.join(pkgRoot, 'i18n.schema.json'), 'utf8'),
        ),
      );
    },
  );
});
