import { resolveRepoContext } from './repo-context.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The host fixture is generated from `react/src/helper/resourcePath.ts` by its
 * own test; this one keeps the CLI's copy byte-identical to it, so "copy the
 * new file over" is enforced rather than remembered.
 */
const HOST_FIXTURE = 'react/src/helper/resourcePath.fixture.json';
const CLI_FIXTURE = 'webui-path.fixture.json';

const repo = resolveRepoContext(import.meta.dirname);

describe(`${CLI_FIXTURE} parity with ${HOST_FIXTURE}`, () => {
  it('is a byte-for-byte copy of the host fixture', () => {
    const host = readFileSync(join(repo.repoRoot, HOST_FIXTURE), 'utf8');
    const cli = readFileSync(join(import.meta.dirname, CLI_FIXTURE), 'utf8');
    expect(
      cli,
      `${CLI_FIXTURE} drifted from ${HOST_FIXTURE}. Copy the host file over it and fix webui-path.ts until the parity test passes — never edit the fixture to match the CLI.`,
    ).toBe(host);
  });
});
