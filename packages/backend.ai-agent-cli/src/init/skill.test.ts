import {
  executableSchema,
  parseDocument,
  validateAgainstSchema,
} from '../query/document.js';
import { resolveRepoContext } from '../repo-context.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKILL_DIR = '.claude/skills/bai-agent';
const SKILL = `${SKILL_DIR}/SKILL.md`;
const COOKBOOK = `${SKILL_DIR}/references/query-cookbook.md`;

/** Cheap guard: the skill is a pointer, not a second copy of the CLI docs. */
const MAX_SKILL_LINES = 120;

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
