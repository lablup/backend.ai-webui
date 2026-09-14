/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Translates the admin session list's queryfilter minilang string into the
 `POST /export/sessions/csv` filter body, so the CSV matches the table
 instead of being a superset of it (FR-3915).
 */
import { splitTopLevelAnd } from './adminSessionProjectLift';
import * as _ from 'lodash-es';

/** `StringFilter` keys of the export DTO this mapper can emit. */
type ExportStringFilter = {
  equals?: string;
  not_equals?: string;
  i_contains?: string;
};

type ExportDateRangeFilter = {
  after?: string;
  before?: string;
};

export type SessionExportFilter = {
  name?: ExportStringFilter;
  domain_name?: ExportStringFilter;
  access_key?: ExportStringFilter;
  scaling_group_name?: ExportStringFilter;
  user?: { email?: ExportStringFilter };
  created_at?: ExportDateRangeFilter;
  terminated_at?: ExportDateRangeFilter;
};

/** Minilang property -> export filter field. Anything absent is dropped. */
const STRING_FIELD_MAP: Record<string, 'name' | 'domain_name' | 'access_key'> = {
  name: 'name',
  domain_name: 'domain_name',
  access_key: 'access_key',
};

// `(prop) (op) (value)`, value either double-quoted or bare.
const CONDITION = /^\(*\s*([a-z_]+)\s*(==|!=|>=|<=|ilike|like)\s*(?:"([^"]*)"|([^\s")]+))\s*\)*$/;

const toStringFilter = (
  operator: string,
  value: string,
): ExportStringFilter | undefined => {
  switch (operator) {
    case '==':
      return { equals: value };
    case '!=':
      return { not_equals: value };
    // The table's `ilike "%x%"` is a case-insensitive substring match; an
    // anchored pattern (`"x%"`) has no export counterpart, so it is dropped.
    case 'ilike':
    case 'like':
      return /^%[^%]*%$/.test(value)
        ? { i_contains: value.slice(1, -1) }
        : undefined;
    default:
      return undefined;
  }
};

/**
 * Build the export filter for the conditions the export endpoint accepts.
 * Conditions it cannot express (`id`, `project_id`, `group_name`, `agent_ids`,
 * `full_name`, `status_info`, `result`, `cluster_mode`, `priority`, `images`)
 * and any filter containing a top-level `|` are left out: the CSV is then a
 * superset of the table, never a subset.
 */
export const buildSessionExportFilter = (
  filter: string | undefined | null,
  { supportsUserFilter }: { supportsUserFilter: boolean },
): SessionExportFilter => {
  const result: SessionExportFilter = {};
  if (!filter) return result;

  _.forEach(splitTopLevelAnd(filter), (segment) => {
    const matched = CONDITION.exec(segment);
    if (!matched) return;
    const [, property, operator, quoted, bare] = matched;
    const value = quoted ?? bare;
    if (_.isNil(value) || value === '') return;

    const stringField = STRING_FIELD_MAP[property];
    if (stringField) {
      const condition = toStringFilter(operator, value);
      if (condition) result[stringField] = condition;
      return;
    }
    if (property === 'scaling_group') {
      const condition = toStringFilter(operator, value);
      if (condition) result.scaling_group_name = condition;
      return;
    }
    if (property === 'user_email' && supportsUserFilter) {
      const condition = toStringFilter(operator, value);
      if (condition) result.user = { email: condition };
      return;
    }
    if (property === 'created_at' || property === 'terminated_at') {
      const bound =
        operator === '>=' ? 'after' : operator === '<=' ? 'before' : undefined;
      if (!bound) return;
      result[property] = { ...result[property], [bound]: value };
      return;
    }
  });

  return result;
};
