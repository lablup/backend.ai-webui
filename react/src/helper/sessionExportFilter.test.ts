import { buildSessionExportFilter } from './sessionExportFilter';
import { describe, expect, it } from 'vitest';

const opts = { supportsUserFilter: true };

describe('buildSessionExportFilter', () => {
  it('returns an empty object for an empty filter', () => {
    expect(buildSessionExportFilter('', opts)).toEqual({});
    expect(buildSessionExportFilter(undefined, opts)).toEqual({});
  });

  it('maps the string conditions the export endpoint accepts', () => {
    expect(
      buildSessionExportFilter(
        'name ilike "%train%" & domain_name == "default" & access_key != "AKIA" & scaling_group ilike "%gpu%"',
        opts,
      ),
    ).toEqual({
      name: { i_contains: 'train' },
      domain_name: { equals: 'default' },
      access_key: { not_equals: 'AKIA' },
      scaling_group_name: { i_contains: 'gpu' },
    });
  });

  it('maps user_email only when the manager supports the nested user filter', () => {
    const filter = 'user_email ilike "%admin%"';
    expect(buildSessionExportFilter(filter, opts)).toEqual({
      user: { email: { i_contains: 'admin' } },
    });
    expect(
      buildSessionExportFilter(filter, { supportsUserFilter: false }),
    ).toEqual({});
  });

  it('maps datetime bounds into the range filter', () => {
    expect(
      buildSessionExportFilter(
        'created_at >= "2026-01-01T00:00:00.000Z" & created_at <= "2026-02-01T00:00:00.000Z" & terminated_at >= "2026-01-15T00:00:00.000Z"',
        opts,
      ),
    ).toEqual({
      created_at: {
        after: '2026-01-01T00:00:00.000Z',
        before: '2026-02-01T00:00:00.000Z',
      },
      terminated_at: { after: '2026-01-15T00:00:00.000Z' },
    });
  });

  it('drops conditions the export endpoint cannot express', () => {
    expect(
      buildSessionExportFilter(
        'project_id == "3c8a1b0e-0000-0000-0000-000000000000" & agent_ids ilike "%i-1%" & result == "SUCCESS" & priority == 10 & name == "keep"',
        opts,
      ),
    ).toEqual({ name: { equals: 'keep' } });
  });

  it('drops an anchored wildcard that has no export counterpart', () => {
    expect(buildSessionExportFilter('name ilike "train%"', opts)).toEqual({});
  });

  it('keeps the conditions around a top-level OR segment it cannot split', () => {
    // A top-level `|` makes the whole segment unparseable, so nothing from it
    // reaches the export filter — the CSV stays a superset.
    expect(
      buildSessionExportFilter(
        'name == "a" | name == "b" & domain_name == "default"',
        opts,
      ),
    ).toEqual({ domain_name: { equals: 'default' } });
  });
});
