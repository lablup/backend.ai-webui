import { renderExplain } from '../commands/explain.js';
import { CliError } from '../errors.js';
import { resolveRepoContext } from '../repo-context.js';
import { explain } from './explain.js';
import { describe, expect, it } from 'vitest';

const context = resolveRepoContext(import.meta.dirname);

const run = (target: string, lang = 'en') => explain(context, { target, lang });

describe('explain, fully curated field value', () => {
  const data = run('ComputeSessionNode.status=RUNNING');

  it('tags every piece with where it came from', () => {
    expect(data.schema.derived).toBe('auto');
    expect(data.label.derived).toBe('auto');
    expect(data.concept.derived).toBe('curated');
    expect(data.meaning.derived).toBe('curated');
    expect(data.docs.derived).toBe('curated');
    expect(data.value?.derived).toBe('curated');
  });

  it('answers with the UI label, the concept and a deployed-docs link', () => {
    expect(data.label.label).toBe('Status');
    expect(data.label.key).toBe('session.Status');
    expect(data.concept.id).toBe('compute-session');
    expect(data.meaning.text).toMatch(/accepting work/);
    expect(data.docs.url).toBe(
      'https://webui.docs.backend.ai/next/en/sessions_all.html#sessions_all-session-detail-panel',
    );
    expect(data.value?.label).toBe('Running');
    expect(data.value?.variant).toBe('success');
  });
});

describe('explain, unmapped field', () => {
  const data = run('KernelNode.status');

  it('still answers with the auto pieces', () => {
    expect(data.schema.derived).toBe('auto');
    expect(data.schema.typeName).toBe('KernelNode');
    expect(data.schema.path).toMatch(/^data\/schema\.graphql:\d+$/);
    expect(data.label.derived).toBe('auto');
  });

  it('reports the curated pieces as MISSING rather than guessing', () => {
    expect(data.mapping).toBeUndefined();
    expect(data.meaning.derived).toBe('MISSING');
    expect(data.meaning.text).toBeUndefined();
    expect(data.concept.derived).toBe('MISSING');
  });
});

describe('explain =VALUE', () => {
  it('carries the enum vocabulary for an enum field', () => {
    const data = run('Role.status=ACTIVE');
    expect(data.schema.enumType).toBe('RoleStatus');
    expect(data.schema.enumValues).toEqual(['ACTIVE', 'INACTIVE', 'DELETED']);
    expect(data.value?.name).toBe('ACTIVE');
    expect(data.meaning.via).toBe('Role.status=ACTIVE');
  });

  it('explains a curated value on a String field with no enum', () => {
    const data = run('ComputeSessionNode.type=BATCH');
    expect(data.schema.type).toBe('String');
    expect(data.schema.enumType).toBeUndefined();
    expect(data.value?.derived).toBe('curated');
    expect(data.value?.schemaDerived).toBe('MISSING');
    expect(data.concept.id).toBe('session-type-batch');
    expect(data.concept.derived).toBe('curated');
  });

  it('reports a value the mapping does not curate as MISSING', () => {
    const data = run('ComputeSessionNode.status=NOT_A_STATUS');
    expect(data.value?.derived).toBe('MISSING');
    // The field's own curated pieces still answer.
    expect(data.meaning.via).toBe('ComputeSessionNode.status');
  });

  it('refuses =VALUE on a type', () => {
    expect(() => run('ComputeSessionNode=RUNNING')).toThrow(CliError);
  });

  it('exits not_found for an unknown name', () => {
    expect(() => run('NoSuchType.field')).toThrowError(
      expect.objectContaining({ code: 'not_found' }),
    );
  });
});

describe('explain --lang', () => {
  const data = run('ComputeSessionNode.status=RUNNING', 'ko');

  it('switches the label and the docs link, never what resolves', () => {
    expect(data.lang).toBe('ko');
    expect(data.label.lang).toBe('ko');
    expect(data.label.label).not.toBe('Status');
    expect(data.label.key).toBe('session.Status');
    expect(data.docs.lang).toBe('ko');
    expect(data.docs.url).toContain('/ko/sessions_all.html#');
    expect(data.docs.ref).toBe('sessions_all#session-detail-panel');
  });
});

describe('explain heuristics', () => {
  it('reads a label from a same-named i18n key when the index cannot', () => {
    const data = run('AgentNode.schedulable');
    expect(data.label.derived).toBe('heuristic');
    expect(data.label.key).toBe('agent.Schedulable');
  });

  it('matches a terminology concept spelled like the type name', () => {
    const data = run('Domain');
    expect(data.schema.entryKind).toBe('type');
    expect(data.concept.derived).toBe('heuristic');
    expect(data.concept.id).toBe('domain');
    expect(data.concept.via).toBe('Domain');
  });

  it('links a docs section when the label matches a heading outright', () => {
    const data = run('KernelNode.status');
    expect(data.docs.derived).toBe('heuristic');
    expect(data.docs.score).toBeGreaterThanOrEqual(80);
  });
});

describe('explain rendering', () => {
  it('prints the derivation of every piece at every verbosity', () => {
    const data = run('ComputeSessionNode.status=RUNNING');
    for (const verbosity of ['dense', 'normal', 'detail'] as const) {
      const text = renderExplain(data, { verbosity });
      expect(text).toContain('curated');
      expect(text.length).toBeGreaterThan(0);
    }
    expect(renderExplain(data, { verbosity: 'detail' })).toContain('MISSING');
  });
});
