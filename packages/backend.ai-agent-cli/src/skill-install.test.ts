import { BLOCK_START, INSTALLED_SKILL_PATH } from './init/block.js';
import { COMMANDS } from './registry.js';
import {
  AGENT_BLOCK_FILE,
  claudeSkillsDir,
  installSkill,
  installedSkillDir,
  shippedSkillDir,
} from './skill-install.js';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('skill install', () => {
  it('finds the skill source from the checkout when nothing is shipped yet', () => {
    expect(existsSync(join(shippedSkillDir(), 'SKILL.md'))).toBe(true);
  });

  it('targets ~/.claude/skills/bai-agent, or $CLAUDE_CONFIG_DIR', () => {
    expect(installedSkillDir({})).toMatch(/\.claude[\\/]skills[\\/]bai-agent$/);
    expect(claudeSkillsDir({ CLAUDE_CONFIG_DIR: '/cfg' })).toBe(
      join('/cfg', 'skills'),
    );
    expect(INSTALLED_SKILL_PATH).toBe('~/.claude/skills/bai-agent/SKILL.md');
  });

  it('copies the skill, generates the standalone block, and is idempotent', () => {
    const targetDir = join(
      mkdtempSync(join(tmpdir(), 'bai-agent-skill-')),
      'bai-agent',
    );

    const first = installSkill({ commands: COMMANDS, targetDir });
    expect(first.outcome).toBe('installed');
    expect(first.files).toContain('SKILL.md');
    expect(first.files).toContain('references/query-cookbook.md');
    expect(first.files).toContain(AGENT_BLOCK_FILE);

    const block = readFileSync(join(targetDir, AGENT_BLOCK_FILE), 'utf8');
    expect(block).toContain(BLOCK_START);
    // The block names where the skill actually went, not a fixed ~/.claude.
    expect(block).toContain(join(targetDir, 'SKILL.md'));
    expect(block).not.toContain(INSTALLED_SKILL_PATH);
    expect(block).toContain('npm i -g backend.ai-agent-cli');
    expect(block).not.toContain('pnpm run bai-agent');
    for (const command of COMMANDS) expect(block).toContain(command.name);

    expect(installSkill({ commands: COMMANDS, targetDir }).outcome).toBe(
      'unchanged',
    );

    writeFileSync(join(targetDir, 'SKILL.md'), 'stale');
    expect(installSkill({ commands: COMMANDS, targetDir }).outcome).toBe(
      'updated',
    );
    expect(readFileSync(join(targetDir, 'SKILL.md'), 'utf8')).not.toBe('stale');

    // A file an older CLI shipped and this one does not is removed.
    writeFileSync(join(targetDir, 'references', 'obsolete.md'), 'old');
    const pruned = installSkill({ commands: COMMANDS, targetDir });
    expect(pruned.outcome).toBe('updated');
    expect(pruned.removed).toEqual(['references/obsolete.md']);
    expect(existsSync(join(targetDir, 'references', 'obsolete.md'))).toBe(
      false,
    );
  });

  it('prefers the checkout source over a build copy nearer to the module', () => {
    // From src/ the package-level skill/ is the nearer candidate; the repo's
    // .claude/skills/bai-agent must still win.
    expect(shippedSkillDir()).toMatch(
      /[\\/]\.claude[\\/]skills[\\/]bai-agent$/,
    );
  });
});
