/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for buildUserCSVExportFilter().
 *
 * Coverage:
 * - String fields are renamed and their operators snake_cased
 * - `AND` groups are flattened (the property filter's own shape)
 * - role enum -> the export DTO's IN list, lowercased
 * - createdAt -> the export DTO's after/before range
 * - Anything the DTO cannot express is reported in `unsupportedKeys`
 */
import { buildUserCSVExportFilter } from './userCSVExportFilter';

describe('buildUserCSVExportFilter', () => {
  it('returns an empty filter for an empty input', () => {
    expect(buildUserCSVExportFilter(undefined)).toEqual({
      filter: {},
      unsupportedKeys: [],
    });
  });

  it('renames string fields and snake_cases their operators', () => {
    expect(
      buildUserCSVExportFilter({
        AND: [
          { email: { iContains: 'lablup' } },
          { username: { iStartsWith: 'ad' } },
          { domainName: { equals: 'default' } },
        ],
      }),
    ).toEqual({
      filter: {
        email: { i_contains: 'lablup' },
        username: { i_starts_with: 'ad' },
        domain_name: { equals: 'default' },
      },
      unsupportedKeys: [],
    });
  });

  it('converts role to a lowercased IN list', () => {
    expect(
      buildUserCSVExportFilter({ role: { equals: 'SUPERADMIN' } }).filter,
    ).toEqual({ role: ['superadmin'] });
    expect(
      buildUserCSVExportFilter({ role: { in: ['ADMIN', 'MONITOR'] } }).filter,
    ).toEqual({ role: ['admin', 'monitor'] });
  });

  it('converts createdAt to the export range filter', () => {
    expect(
      buildUserCSVExportFilter({ createdAt: { after: '2026-01-01T00:00:00Z' } })
        .filter,
    ).toEqual({ created_at: { after: '2026-01-01T00:00:00Z' } });
  });

  it('reports conditions the export API cannot express', () => {
    const result = buildUserCSVExportFilter({
      AND: [
        { email: { iContains: 'a' } },
        { totpActivated: true },
        { project: { name: { iContains: 'x' } } },
        { role: { notEquals: 'USER' } },
        { createdAt: { equals: '2026-01-01T00:00:00Z' } },
      ],
      OR: [{ email: { iContains: 'b' } }],
    });
    expect(result.filter).toEqual({ email: { i_contains: 'a' } });
    expect(result.unsupportedKeys.sort()).toEqual([
      'OR',
      'createdAt',
      'project',
      'role',
      'totpActivated',
    ]);
  });

  it('keeps only the first condition per string field', () => {
    const result = buildUserCSVExportFilter({
      AND: [{ email: { iContains: 'a' } }, { email: { iContains: 'b' } }],
    });
    expect(result.filter).toEqual({ email: { i_contains: 'a' } });
    expect(result.unsupportedKeys).toEqual(['email']);
  });
});
