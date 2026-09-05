import { CLI_NAME } from './meta.js';
import { homedir } from 'node:os';
import { join, sep } from 'node:path';

type Env = Record<string, string | undefined>;

/**
 * Where Claude Code keeps user skills, and how the agent block names the copy
 * installed there. One home for both, so the block cannot quote a dead path.
 */

/** `~/.claude/skills` — or under `$CLAUDE_CONFIG_DIR`, which Claude Code honours. */
export function claudeSkillsDir(env: Env = process.env): string {
  const base = env.CLAUDE_CONFIG_DIR?.trim() || join(homedir(), '.claude');
  return join(base, 'skills');
}

export function installedSkillDir(env: Env = process.env): string {
  return join(claudeSkillsDir(env), CLI_NAME);
}

/** `~`-relative when under the home directory, as a human would write it. */
export function displayPath(path: string): string {
  const home = homedir();
  return path.startsWith(home + sep) ? `~${path.slice(home.length)}` : path;
}

/** The installed `SKILL.md`, as the standalone block names it when no install path is given. */
export function installedSkillPath(env: Env = process.env): string {
  return displayPath(join(installedSkillDir(env), 'SKILL.md'));
}
