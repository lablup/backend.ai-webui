import { readFileSync } from 'node:fs';

export const CLI_NAME = 'bai-agent';

export const CLI_DESCRIPTION =
  'Agent-facing CLI over a Backend.AI WebUI checkout';

export const MIN_NODE_MAJOR = 22;

/** Resolves against this module, so it works from `src/` and from `dist/`. */
export function cliVersion(): string {
  try {
    const manifest = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { version?: string };
    return manifest.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}
