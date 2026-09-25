import {
  executableSchema,
  parseDocument,
  validateAgainstSchema,
} from '../query/document.js';
import { resolveRepoContext } from '../repo-context.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKILL_DIR = 'packages/backend.ai-agent-cli/skill';
const SKILL = `${SKILL_DIR}/SKILL.md`;
const COOKBOOK = `${SKILL_DIR}/references/query-cookbook.md`;
const BROWSER_GUIDE = `${SKILL_DIR}/references/webui-browser.md`;

/** Cheap guard: the skill is a pointer, not a second copy of the CLI docs. */
const MAX_SKILL_LINES = 135;

const repo = resolveRepoContext(import.meta.dirname);
const read = (relative: string): string =>
  readFileSync(join(repo.repoRoot, relative), 'utf8');

describe(SKILL, () => {
  it('declares the skill name in its frontmatter', () => {
    expect(read(SKILL)).toMatch(/^---\n(?:.*\n)*?name: bai-agent\n/);
  });

  it(`stays under ${MAX_SKILL_LINES} lines`, () => {
    const lines = read(SKILL).trimEnd().split('\n').length;
    expect(
      lines,
      `${SKILL} is ${lines} lines. Link the rule, do not restate it.`,
    ).toBeLessThanOrEqual(MAX_SKILL_LINES);
  });

  it('points at the cookbook rather than inlining queries', () => {
    const skill = read(SKILL);
    expect(skill).toContain('references/query-cookbook.md');
    expect(skill).not.toContain('```graphql');
  });

  it('points at the browser guide', () => {
    expect(read(SKILL)).toContain('references/webui-browser.md');
  });
});

describe(BROWSER_GUIDE, () => {
  const guide = read(BROWSER_GUIDE);

  it('names every app-shell tool the WebUI registers', () => {
    const source = read('react/src/components/WebMCPGlobalTools.tsx');
    const names = [...source.matchAll(/name: '(bai_[a-z_]+)'/g)].map(
      (match) => match[1],
    );
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(guide).toContain(`\`${name}\``);
  });

  it('describes page tools by the ADR 0009 name patterns', () => {
    for (const pattern of [
      'bai_list_visible_<noun>',
      'bai_get_current_<noun>',
      'bai_get_<noun>_filter',
      'bai_prepare_<noun>',
    ]) {
      expect(guide).toContain(pattern);
    }
  });

  it('points at a smoke script that exists', () => {
    expect(guide).toContain('scripts/webmcp-smoke.sh');
    expect(() => read('scripts/webmcp-smoke.sh')).not.toThrow();
  });
});

describe(COOKBOOK, () => {
  const documents = [
    ...read(COOKBOOK).matchAll(/```graphql\n([\s\S]*?)```/g),
  ].map((match) => match[1]);

  it('carries between 8 and 12 documents', () => {
    expect(documents.length).toBeGreaterThanOrEqual(8);
    expect(documents.length).toBeLessThanOrEqual(12);
  });

  it.each(documents.map((document, index) => [index + 1, document]))(
    'document %i validates against the checkout SDL',
    (_index, document) => {
      const { document: parsed } = parseDocument(document as string);
      // The same validator `query` runs before any network call, so a document
      // the schema outgrew fails here instead of in front of a user.
      expect(() =>
        validateAgainstSchema(executableSchema(repo), parsed),
      ).not.toThrow();
    },
  );

  it('never mixes two pagination modes in one document', () => {
    for (const document of documents) {
      const cursor = /\b(first|after|last|before)\s*:/.test(document);
      const offset = /\b(limit|offset)\s*:/.test(document);
      expect(cursor && offset, document).toBe(false);
    }
  });
});
