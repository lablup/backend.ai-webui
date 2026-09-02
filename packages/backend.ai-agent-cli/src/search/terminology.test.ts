import { resolveRepoContext } from '../repo-context.js';
import { loadTerminology, VERB_CATEGORY } from './terminology.js';
import { describe, expect, it } from 'vitest';

const context = resolveRepoContext(import.meta.dirname);
const terms = loadTerminology(context);
const byId = new Map(terms.map((term) => [term.id, term]));

describe('loadTerminology', () => {
  it('indexes the verbs collection next to the concepts', () => {
    const verbs = terms.filter((term) => term.kind === 'verb');
    expect(verbs.length).toBeGreaterThan(0);
    const del = byId.get('verb-delete');
    expect(del).toBeDefined();
    expect(del!.kind).toBe('verb');
    expect(del!.title).toBe('Delete');
    expect(del!.concept.category).toBe(VERB_CATEGORY);
    expect(del!.concept.preferred.en).toBe('Delete');
    // The verb's inline `avoid` spellings resolve to it like concept aliases.
    expect(del!.aliases).toEqual(
      expect.arrayContaining(['Delete', 'Destroy', 'Erase', 'Wipe']),
    );
    expect(del!.description).toContain('resource preset');
  });

  it('keeps every concept and verb id unique', () => {
    expect(byId.size).toBe(terms.length);
  });

  it('uses the first comma-separated spelling as the scoring title', () => {
    const agent = byId.get('agent');
    expect(agent).toBeDefined();
    expect(agent!.concept.preferred.en).toBe('agent, agent node');
    expect(agent!.title).toBe('agent');
    expect(agent!.aliases).toEqual(
      expect.arrayContaining(['agent', 'agent node', '에이전트']),
    );
    for (const term of terms) {
      expect(term.title, term.id).not.toContain(',');
    }
  });
});
