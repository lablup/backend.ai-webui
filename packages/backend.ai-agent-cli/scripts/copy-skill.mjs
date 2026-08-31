// Copies the repo-local `.claude/skills/bai-agent` into `skill/` so the npm
// package ships the skill `bai-agent init` installs. One source: the repo's
// skill (and its tests) stay authoritative; `skill/` is a build output.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(
  packageDir,
  '..',
  '..',
  '.claude',
  'skills',
  'bai-agent',
);
const target = join(packageDir, 'skill');

if (!existsSync(join(source, 'SKILL.md'))) {
  // A published tarball builds nothing, and a checkout without the skill is
  // a broken checkout — say which.
  console.error(`copy-skill: ${source} has no SKILL.md; nothing copied.`);
  process.exit(existsSync(target) ? 0 : 1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
console.error(`copy-skill: ${source} -> ${target}`);
