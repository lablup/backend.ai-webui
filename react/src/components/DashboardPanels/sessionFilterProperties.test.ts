/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Pins the picker to the manager's queryfilter fieldspec: dropping a field (or
 mistyping one so it serializes wrong) is what FR-3654 was filed about.
*/
import { getSessionFilterProperties } from './sessionFilterProperties';
import type { TFunction } from 'i18next';

const t = ((key: string) => key) as unknown as TFunction;

/**
 * `_queryfilter_fieldspec` in the manager's `gql_legacy/session.py`, minus the
 * project-scoped keys the panel cannot use (`project_id`, `group_name`),
 * `scheduled_at` (the manager compares its JSON text extraction against a
 * parsed datetime), and `images`, whose `image` alias is the same column.
 */
const EXPECTED_KEYS = [
  'access_key',
  'agent_ids',
  'cluster_mode',
  'cluster_size',
  'created_at',
  'domain_name',
  'full_name',
  'id',
  'image',
  'name',
  'priority',
  'result',
  'scaling_group',
  'starts_at',
  'status',
  'status_info',
  'startup_command',
  'terminated_at',
  'type',
  'user_email',
  'user_id',
];

describe('getSessionFilterProperties', () => {
  const properties = getSessionFilterProperties(t);

  it('offers every backend-supported field the panel can scope to', () => {
    expect(properties.map((property) => property.key).sort()).toEqual(
      [...EXPECTED_KEYS].sort(),
    );
  });

  it('never offers a field the backend cannot actually answer', () => {
    const keys = properties.map((property) => property.key);
    // Already scoped by the query…
    expect(keys).not.toContain('project_id');
    expect(keys).not.toContain('group_name');
    // …and a JSON text extraction compared against a parsed datetime.
    expect(keys).not.toContain('scheduled_at');
  });

  it('labels every field', () => {
    properties.forEach((property) => {
      expect(property.propertyLabel).toBeTruthy();
    });
  });

  it('constrains enum fields to equality over their backend values', () => {
    const enums = properties.filter((property) => property.options);
    expect(enums.map((property) => property.key).sort()).toEqual([
      'cluster_mode',
      'result',
      'status',
      'type',
    ]);
    enums.forEach((property) => {
      expect(property.strictSelection).toBe(true);
      expect(property.defaultOperator).toBe('==');
      expect(property.options?.length).toBeGreaterThan(0);
    });
  });

  it('types the numeric and time fields so their values serialize correctly', () => {
    const typeOf = (key: string) =>
      properties.find((property) => property.key === key)?.type;
    expect(typeOf('priority')).toBe('number');
    expect(typeOf('cluster_size')).toBe('number');
    expect(typeOf('created_at')).toBe('datetime');
    expect(typeOf('starts_at')).toBe('datetime');
    expect(typeOf('terminated_at')).toBe('datetime');
  });

  it('offers UUID columns as equality-only, and flags a partial value', () => {
    const uuids = properties.filter((property) => property.type === 'uuid');
    expect(uuids.map((property) => property.key).sort()).toEqual([
      'id',
      'user_id',
    ]);
    uuids.forEach((property) => {
      // Postgres rejects a partial UUID outright, so the control warns.
      expect(property.rule?.validate('3f2a')).toBe(false);
      expect(
        property.rule?.validate('3f2a1b7c-0d5e-4f6a-8b9c-0d1e2f3a4b5c'),
      ).toBe(true);
      // Postgres accepts uppercase hex; the helper is lowercase-only.
      expect(
        property.rule?.validate('3F2A1B7C-0D5E-4F6A-8B9C-0D1E2F3A4B5C'),
      ).toBe(true);
    });
  });
});
