import { resolveRepoContext } from '../repo-context.js';
import { clearMappingCache, defaultMappingsDir, loadMappings } from './load.js';
import { resolveMappings } from './resolve.js';
import { copyFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const context = resolveRepoContext(import.meta.dirname);

/** A throwaway mappings directory validated against the real schema.json. */
function fixtureDir(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'bai-agent-mappings-'));
  copyFileSync(
    join(defaultMappingsDir(), 'schema.json'),
    join(dir, 'schema.json'),
  );
  for (const [name, body] of Object.entries(files)) {
    writeFileSync(join(dir, name), body, 'utf8');
  }
  return dir;
}

afterEach(() => {
  clearMappingCache();
});

describe('shipped mappings', () => {
  it('all parse and validate against mappings/schema.json', () => {
    const set = loadMappings();
    expect(set.issues).toEqual([]);
    expect(set.files.length).toBeGreaterThan(0);
    for (const entry of set.files) {
      expect(entry.mapping.type).toBe(
        entry.file.replace(/^mappings\//, '').replace(/\.ya?ml$/, ''),
      );
    }
  });

  // The staleness gate: a schema, terminology or manual change that orphans a
  // reference fails here as well as in `doctor --mappings`.
  it('every reference they make still resolves', () => {
    const { issues, counts } = resolveMappings(context);
    expect(issues.filter((issue) => issue.level === 'fail')).toEqual([]);
    expect(counts.types).toBeGreaterThanOrEqual(10);
    expect(counts.values).toBeGreaterThan(0);
  });
});

describe('schema.json validation', () => {
  it('rejects an unknown key', () => {
    const dir = fixtureDir({
      'ComputeSessionNode.yaml': [
        'type: ComputeSessionNode',
        'meanng: typo in the key name',
      ].join('\n'),
    });
    const set = loadMappings(dir);
    expect(set.files).toEqual([]);
    expect(set.issues[0].message).toContain('additional properties');
  });

  it('rejects a concept key that is not a terminology id shape', () => {
    const dir = fixtureDir({
      'ComputeSessionNode.yaml': [
        'type: ComputeSessionNode',
        'concept: Compute Session',
      ].join('\n'),
    });
    expect(loadMappings(dir).issues[0].message).toContain('/concept');
  });

  it('rejects a file whose name does not match its type', () => {
    const dir = fixtureDir({ 'Wrong.yaml': 'type: ComputeSessionNode\n' });
    expect(loadMappings(dir).issues[0].message).toContain(
      'does not match the file name stem',
    );
  });

  it('rejects a second file mapping the same type', () => {
    const dir = fixtureDir({
      'Role.yaml': 'type: Role\n',
      'Role.yml': 'type: Role\n',
    });
    const set = loadMappings(dir);
    expect(set.files.map((entry) => entry.file)).toEqual(['mappings/Role.yaml']);
    expect(set.byType.get('Role')?.file).toBe('mappings/Role.yaml');
    expect(set.issues).toHaveLength(1);
    expect(set.issues[0].file).toBe('mappings/Role.yml');
    expect(set.issues[0].message).toContain(
      'type "Role" is already mapped by mappings/Role.yaml',
    );
    expect(
      resolveMappings(context, dir).issues.filter(
        (issue) => issue.level === 'fail',
      ),
    ).toHaveLength(1);
  });

  it('rejects a malformed YAML document', () => {
    const dir = fixtureDir({ 'ComputeSessionNode.yaml': 'type: [unclosed\n' });
    expect(loadMappings(dir).issues[0].message).toContain('YAML parse error');
  });
});

describe('reference resolution', () => {
  const failures = (dir: string): string[] =>
    resolveMappings(context, dir)
      .issues.filter((issue) => issue.level === 'fail')
      .map((issue) => `${issue.ref}: ${issue.message}`);

  it('flags a field that is not on the type', () => {
    const dir = fixtureDir({
      'ComputeSessionNode.yaml': [
        'type: ComputeSessionNode',
        'fields:',
        '  no_such_field:',
        '    meaning: This field does not exist.',
      ].join('\n'),
    });
    expect(failures(dir)).toEqual([
      'ComputeSessionNode.no_such_field: field "no_such_field" is not declared on ComputeSessionNode',
    ]);
  });

  it('flags a type that is not in the schema', () => {
    const dir = fixtureDir({ 'NoSuchType.yaml': 'type: NoSuchType\n' });
    expect(failures(dir)).toEqual([
      'NoSuchType: type "NoSuchType" is not in the schema',
    ]);
  });

  it('flags a docs heading that does not exist', () => {
    const dir = fixtureDir({
      'ComputeSessionNode.yaml': [
        'type: ComputeSessionNode',
        'docs: sessions_all#no-such-heading',
      ].join('\n'),
    });
    expect(failures(dir)[0]).toContain(
      'does not resolve to a heading in the English manual',
    );
  });

  it('flags a concept that is not in terminology.json', () => {
    const dir = fixtureDir({
      'ComputeSessionNode.yaml': [
        'type: ComputeSessionNode',
        'concept: no-such-concept',
      ].join('\n'),
    });
    expect(failures(dir)[0]).toContain(
      'concept "no-such-concept" is not in terminology.json',
    );
  });

  it('flags a value that is not in the field’s enum', () => {
    const dir = fixtureDir({
      'Role.yaml': [
        'type: Role',
        'fields:',
        '  status:',
        '    values:',
        '      NOT_A_STATUS:',
        '        meaning: This value is not in RoleStatus.',
      ].join('\n'),
    });
    expect(failures(dir)[0]).toContain('is not a value of enum RoleStatus');
  });

  it('warns when a curated enum is only half covered', () => {
    const dir = fixtureDir({
      'Role.yaml': [
        'type: Role',
        'fields:',
        '  status:',
        '    values:',
        '      ACTIVE:',
        '        meaning: The role grants its permissions.',
      ].join('\n'),
    });
    const warnings = resolveMappings(context, dir).issues.filter(
      (issue) => issue.level === 'warn' && issue.ref === 'Role.status',
    );
    expect(warnings[0].message).toContain('missing INACTIVE, DELETED');
  });

  it('still reports an enum field as unmapped when its mapping curates no values', () => {
    const unmapped = (dir: string): string | undefined =>
      resolveMappings(context, dir).issues.find(
        (issue) => issue.ref === 'unmapped value vocabularies',
      )?.message;
    const withoutValues = fixtureDir({
      'Role.yaml': [
        'type: Role',
        'fields:',
        '  source:',
        '    meaning: Where the role came from.',
      ].join('\n'),
    });
    expect(unmapped(withoutValues)).toContain('Role.source');
    clearMappingCache();
    const withValues = fixtureDir({
      'Role.yaml': [
        'type: Role',
        'fields:',
        '  source:',
        '    values:',
        '      SYSTEM:',
        '        meaning: Backend.AI ships the role.',
      ].join('\n'),
    });
    expect(unmapped(withValues) ?? '').not.toContain('Role.source');
  });
});
