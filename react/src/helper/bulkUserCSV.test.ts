/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildDynamicColumnAliases,
  CanonicalUserColumn,
  extractRawUserRows,
  findMissingRequiredColumns,
  mapUserCSVColumns,
  mergeColumnAliases,
  parseBoolean,
  ReportField,
} from './bulkUserCSV';
import { parseCSV } from './csv-util';
import { readFileSync } from 'fs';
import path from 'path';

// Fixtures live at the repo root (../test-fixtures relative to the react/
// vitest root), shared with the Playwright e2e suite.
const readFixture = (name: string): string =>
  readFileSync(
    path.resolve(process.cwd(), '../test-fixtures/csv-samples', name),
    'utf-8',
  );

/** Convenience: parse a fixture and resolve its columns with the given aliases. */
const analyze = (
  fixture: string,
  aliases = mergeColumnAliases(),
): {
  presentColumns: Set<CanonicalUserColumn>;
  records: Record<string, string>[];
  rows: ReturnType<typeof extractRawUserRows>;
} => {
  const records = parseCSV(readFixture(fixture));
  const { headerMap, presentColumns } = mapUserCSVColumns(
    Object.keys(records[0] ?? {}),
    aliases,
  );
  return {
    presentColumns,
    records,
    rows: extractRawUserRows(records, headerMap),
  };
};

const sortedCols = (cols: Set<CanonicalUserColumn>) => [...cols].sort();

describe('parseBoolean', () => {
  it.each([
    ['true', true],
    ['TRUE', true],
    ['1', true],
    ['yes', true],
    ['  Yes  ', true],
    ['false', false],
    ['0', false],
    ['no', false],
    ['', false],
    ['anything', false],
  ])('parses %j as %j', (input, expected) => {
    expect(parseBoolean(input)).toBe(expected);
  });
});

describe('mapUserCSVColumns', () => {
  it('recognises the manual template columns', () => {
    const { presentColumns } = analyze('01-valid-all-fields.csv');
    expect(sortedCols(presentColumns)).toEqual(
      [
        'description',
        'domain_name',
        'email',
        'full_name',
        'need_password_change',
        'password',
        'project',
        'resource_policy',
        'role',
        'status',
        'username',
      ].sort(),
    );
  });

  it('recognises manual column aliases (user name, full name, domain, project_name)', () => {
    const { presentColumns } = analyze('03-valid-column-aliases.csv');
    expect(presentColumns.has('username')).toBe(true);
    expect(presentColumns.has('full_name')).toBe(true);
    expect(presentColumns.has('domain_name')).toBe(true);
    expect(presentColumns.has('resource_policy')).toBe(true);
    expect(presentColumns.has('need_password_change')).toBe(true);
    // project_name → project, status stays status
    expect(presentColumns.has('project')).toBe(true);
  });

  it('maps export field keys: status_info → status, project_name → project', () => {
    const { presentColumns } = analyze('16-export-field-keys.csv');
    expect(presentColumns.has('status')).toBe(true);
    expect(presentColumns.has('project')).toBe(true);
    // The raw export keys themselves are not treated as separate columns.
    expect(sortedCols(presentColumns)).toEqual(
      [
        'email',
        'username',
        'password',
        'full_name',
        'project',
        'role',
        'resource_policy',
        'description',
        'status',
        'need_password_change',
      ].sort(),
    );
  });

  it('ignores unsupported export columns (uuid, created_at, totp_activated, …)', () => {
    const { presentColumns, records } = analyze(
      '17-export-extra-unsupported-columns.csv',
    );
    // The file physically contains the extra columns…
    expect(Object.keys(records[0])).toEqual(
      expect.arrayContaining([
        'uuid',
        'created_at',
        'totp_activated',
        'sudo_session_enabled',
        'modified_at',
      ]),
    );
    // …but only the supported subset is recognised.
    expect(sortedCols(presentColumns)).toEqual(
      ['email', 'username', 'password', 'full_name', 'status'].sort(),
    );
  });

  it('is order-independent and strips a UTF-8 BOM (Excel-saved export)', () => {
    const { presentColumns, rows } = analyze(
      '20-export-reordered-with-bom.csv',
    );
    // BOM did not corrupt the first header → email is still recognised.
    expect(presentColumns.has('email')).toBe(true);
    expect(sortedCols(presentColumns)).toEqual(
      [
        'email',
        'username',
        'password',
        'full_name',
        'role',
        'status',
        'description',
        'project',
        'resource_policy',
        'need_password_change',
      ].sort(),
    );
    expect(rows[0].email).toBe('reorder1@example.com');
    expect(rows[0].status).toBe('active');
    expect(rows[1].status).toBe('inactive');
  });
});

describe('extractRawUserRows', () => {
  it('pulls values for present columns and leaves absent ones empty', () => {
    const { rows } = analyze('02-valid-minimal.csv');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      email: 'minimal1@example.com',
      username: 'minimal1',
      password: 'Password!23',
      // Columns absent from a minimal CSV resolve to '' (→ null/global default).
      full_name: '',
      role: '',
      status: '',
      domain_name: '',
      description: '',
      need_password_change: '',
      resource_policy: '',
      project: '',
    });
  });

  it('reads export-key columns into the canonical fields', () => {
    const { rows } = analyze('16-export-field-keys.csv');
    expect(rows[0]).toMatchObject({
      email: 'export1@example.com',
      username: 'export1',
      status: 'active', // from status_info
      project: 'default', // from project_name
      role: 'user',
      need_password_change: 'false',
    });
    expect(rows[1].status).toBe('active');
    expect(rows[1].need_password_change).toBe('true');
    expect(rows[2].status).toBe('inactive');
  });

  it('does not pull values from unsupported columns', () => {
    const { rows } = analyze('17-export-extra-unsupported-columns.csv');
    expect(rows[0].email).toBe('extra1@example.com');
    expect(rows[0].full_name).toBe('Extra One');
    expect(rows[0].status).toBe('active');
    // need_password_change column is absent here → empty, not the totp value.
    expect(rows[0].need_password_change).toBe('');
  });
});

describe('findMissingRequiredColumns', () => {
  it('passes a CSV that has email/username/password', () => {
    const { presentColumns } = analyze('16-export-field-keys.csv');
    expect(
      findMissingRequiredColumns(presentColumns, { hasGlobalPassword: false }),
    ).toEqual([]);
  });

  it('flags a raw export (no password) when no global default password is set', () => {
    const { presentColumns } = analyze('18-export-no-password-column.csv');
    expect(
      findMissingRequiredColumns(presentColumns, { hasGlobalPassword: false }),
    ).toEqual(['password']);
  });

  it('unlocks a passwordless export once a global default password is configured', () => {
    const { presentColumns } = analyze('18-export-no-password-column.csv');
    expect(
      findMissingRequiredColumns(presentColumns, { hasGlobalPassword: true }),
    ).toEqual([]);
  });

  it('flags email/username when an export omits them', () => {
    // Reuse the missing-column fixture (username, password, full_name — no email).
    const { presentColumns } = analyze('12-error-missing-required-columns.csv');
    expect(
      findMissingRequiredColumns(presentColumns, { hasGlobalPassword: false }),
    ).toEqual(['email']);
  });
});

describe('localized export headers (dynamic aliases)', () => {
  // Simulates the /export/reports/users field descriptors for a Korean UI.
  const koReportFields: ReportField[] = [
    { key: 'email', name: '이메일' },
    { key: 'username', name: '사용자 이름' },
    { key: 'full_name', name: '이름' },
    { key: 'project_name', name: '프로젝트' },
    { key: 'role', name: '역할' },
    { key: 'resource_policy', name: '자원 정책' },
    { key: 'description', name: '설명' },
    { key: 'status_info', name: '상태' },
    { key: 'need_password_change', name: '비밀번호 변경 필요' },
  ];

  it('does NOT recognise Korean headers with static aliases alone', () => {
    const { presentColumns } = analyze('19-export-localized-headers-ko.csv');
    // Without the server-provided localized aliases, nothing resolves.
    expect(presentColumns.size).toBe(0);
    expect(
      findMissingRequiredColumns(presentColumns, { hasGlobalPassword: true }),
    ).toEqual(['email', 'username']);
  });

  it('recognises Korean headers once dynamic aliases are merged in', () => {
    const aliases = mergeColumnAliases(
      buildDynamicColumnAliases(koReportFields),
    );
    const { presentColumns, rows } = analyze(
      '19-export-localized-headers-ko.csv',
      aliases,
    );
    expect(sortedCols(presentColumns)).toEqual(
      [
        'email',
        'username',
        'full_name',
        'project',
        'role',
        'resource_policy',
        'description',
        'status',
        'need_password_change',
      ].sort(),
    );
    // Localized export has no password column → needs a global default password.
    expect(
      findMissingRequiredColumns(presentColumns, { hasGlobalPassword: false }),
    ).toEqual(['password']);
    expect(
      findMissingRequiredColumns(presentColumns, { hasGlobalPassword: true }),
    ).toEqual([]);
    // Values land in the right canonical fields despite localized headers.
    expect(rows[0]).toMatchObject({
      email: 'ko1@example.com',
      username: 'ko1',
      full_name: '홍길동',
      status: 'active',
      project: 'default',
      role: 'user',
    });
    expect(rows[1].full_name).toBe('김철수');
  });
});
