import { resolveRepoContext } from './repo-context.js';
import { webuiPath } from './webui-path.js';
import {
  checkFixtureParity,
  CLI_FIXTURE_PATH,
  HOST_FIXTURE_PATH,
  readCliCases,
} from './webui-parity.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const context = resolveRepoContext(import.meta.dirname);
const read = (relative: string): string =>
  readFileSync(join(context.repoRoot, relative), 'utf8');

describe('deep-link fixture parity with the WebUI', () => {
  it('the two committed fixtures are byte-identical', () => {
    // The rules exist twice because the CLI has no dependency on the host app.
    // This is what makes that duplication safe: change one implementation and
    // its fixture, and this fails until the other side follows.
    expect(read(CLI_FIXTURE_PATH)).toBe(read(HOST_FIXTURE_PATH));
  });

  it('webuiPath() reproduces every case', () => {
    const cases = readCliCases(context);
    expect(cases.length).toBeGreaterThan(30);
    for (const one of cases) {
      expect(webuiPath(one.ref), one.name).toBe(one.expected);
    }
  });

  it('checkFixtureParity reports a clean checkout', () => {
    const parity = checkFixtureParity(context);
    expect(parity.unreadable).toBeUndefined();
    expect(parity.mismatch).toBeUndefined();
    expect(parity.identical).toBe(true);
    expect(parity.cases).toBeGreaterThan(30);
  });
});
