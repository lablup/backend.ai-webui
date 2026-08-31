import { homedir } from 'node:os';
import { join } from 'node:path';

type Env = Record<string, string | undefined>;

/**
 * Where the CLI keeps machine-wide state. Kept dependency-free so both the
 * session store and the repo locator can import it without a cycle.
 */

/** `$BAI_AGENT_CONFIG_DIR` wins, then `$XDG_CONFIG_HOME`, then `~/.config`. */
export function configDir(env: Env = process.env): string {
  const override = env.BAI_AGENT_CONFIG_DIR?.trim();
  if (override) return override;
  const xdg = env.XDG_CONFIG_HOME?.trim();
  return join(xdg || join(homedir(), '.config'), 'backend.ai-agent');
}

/** `$BAI_AGENT_DATA_DIR` wins, then `$XDG_DATA_HOME`, then `~/.local/share`. */
export function dataDir(env: Env = process.env): string {
  const override = env.BAI_AGENT_DATA_DIR?.trim();
  if (override) return override;
  const xdg = env.XDG_DATA_HOME?.trim();
  return join(xdg || join(homedir(), '.local', 'share'), 'backend.ai-agent');
}

/** The data checkout `sync` maintains for use outside a WebUI checkout. */
export function syncedCheckoutDir(env: Env = process.env): string {
  return join(dataDir(env), 'checkout');
}
