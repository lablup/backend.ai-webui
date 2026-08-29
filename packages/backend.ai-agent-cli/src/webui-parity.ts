/**
 * The cross-file check that keeps `src/webui-path.ts` honest (FR-3771).
 *
 * The deep-link rules exist twice on purpose — once in the WebUI
 * (`react/src/helper/resourcePath.ts`) and once here, because the CLI ships
 * without a dependency on the host app. What stops the two from drifting is
 * that both are pinned by the SAME fixture, committed on both sides: if the
 * files differ by a single byte, someone changed one implementation only.
 *
 * Both paths are resolved against the checkout, not the running bundle: this
 * is a check on what is committed, and the CLI is developed inside the repo it
 * reads.
 */
import type { RepoContext } from './repo-context.js';
import type { ResourceRef } from './webui-path.js';
import { webuiPath } from './webui-path.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The host's copy, relative to the checkout root. */
export const HOST_FIXTURE_PATH = 'react/src/helper/resourcePath.fixture.json';

/** The CLI's copy, relative to the checkout root. */
export const CLI_FIXTURE_PATH =
  'packages/backend.ai-agent-cli/src/webui-path.fixture.json';

export interface ParityCase {
  name: string;
  ref: ResourceRef;
  expected: string;
}

export interface FixtureParity {
  /** Byte-for-byte equality of the two committed fixtures. */
  identical: boolean;
  /** Cases in the CLI fixture, or 0 when it could not be read. */
  cases: number;
  /** First case `webuiPath()` does not reproduce, if any. */
  mismatch?: string;
  /** Why the check could not run at all. */
  unreadable?: string;
}

const read = (context: RepoContext, relative: string): string =>
  readFileSync(join(context.repoRoot, relative), 'utf8');

export function parseCases(source: string): ParityCase[] {
  return JSON.parse(source) as ParityCase[];
}

/** The CLI fixture as the tests and `doctor` both read it. */
export function readCliCases(context: RepoContext): ParityCase[] {
  return parseCases(read(context, CLI_FIXTURE_PATH));
}

/**
 * Compares the two fixtures and replays every case through `webuiPath()`.
 * Never throws: a missing file is reported, not raised, so `doctor` can render
 * it as one more check.
 */
export function checkFixtureParity(context: RepoContext): FixtureParity {
  let cli: string;
  let host: string;
  try {
    cli = read(context, CLI_FIXTURE_PATH);
    host = read(context, HOST_FIXTURE_PATH);
  } catch (error) {
    return {
      identical: false,
      cases: 0,
      unreadable: error instanceof Error ? error.message : String(error),
    };
  }

  let cases: ParityCase[];
  try {
    cases = parseCases(cli);
  } catch (error) {
    return {
      identical: cli === host,
      cases: 0,
      unreadable: error instanceof Error ? error.message : String(error),
    };
  }

  const mismatch = cases.find(
    (one) => webuiPath(one.ref) !== one.expected,
  );
  return {
    identical: cli === host,
    cases: cases.length,
    ...(mismatch
      ? {
          mismatch: `${mismatch.name}: expected ${mismatch.expected}, got ${webuiPath(mismatch.ref)}`,
        }
      : {}),
  };
}
