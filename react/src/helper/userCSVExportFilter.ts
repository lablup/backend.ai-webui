/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

/**
 * `POST /export/users/csv` takes its own thin filter DTO (backend
 * `ai.backend.common.dto.manager.v2.export.request.UserExportFilter`), not the
 * `UserV2Filter` the list query uses: snake_case operators, only six fields,
 * AND-only. So the table's property filter is translated here, and whatever
 * the DTO cannot express is reported instead of silently widening the export.
 */

/** GraphQL `StringFilter` operator -> the export DTO's operator name. */
const EXPORT_STRING_OPERATORS: Record<string, string> = {
  equals: 'equals',
  contains: 'contains',
  startsWith: 'starts_with',
  endsWith: 'ends_with',
  notEquals: 'not_equals',
  notContains: 'not_contains',
  notStartsWith: 'not_starts_with',
  notEndsWith: 'not_ends_with',
  iEquals: 'i_equals',
  iContains: 'i_contains',
  iStartsWith: 'i_starts_with',
  iEndsWith: 'i_ends_with',
  iNotEquals: 'i_not_equals',
  iNotContains: 'i_not_contains',
  iNotStartsWith: 'i_not_starts_with',
  iNotEndsWith: 'i_not_ends_with',
  in: 'in',
  notIn: 'not_in',
};

/** `UserV2Filter` field -> the export DTO's string field. */
const EXPORT_STRING_FIELDS: Record<string, string> = {
  username: 'username',
  email: 'email',
  domainName: 'domain_name',
};

export interface UserCSVExportFilter {
  username?: Record<string, string | Array<string>>;
  email?: Record<string, string | Array<string>>;
  domain_name?: Record<string, string | Array<string>>;
  role?: Array<string>;
  status?: Array<string>;
  created_at?: { after?: string; before?: string };
}

export interface UserCSVExportFilterResult {
  filter: UserCSVExportFilter;
  /**
   * `UserV2Filter` keys whose condition could not be carried over, so the
   * caller can tell the user the export is wider than the table.
   */
  unsupportedKeys: Array<string>;
}

const firstOperator = (value: unknown): [string, unknown] | undefined => {
  if (!_.isPlainObject(value)) return undefined;
  return _.first(_.toPairs(_.omitBy(value as object, _.isNil))) as
    | [string, unknown]
    | undefined;
};

const toExportRoles = (value: unknown): Array<string> | undefined => {
  const pair = firstOperator(value);
  if (!pair) return undefined;
  const [operator, operand] = pair;
  // The export DTO only has an IN list, so a negated role filter is not
  // expressible.
  if (operator !== 'equals' && operator !== 'in') return undefined;
  return _.map(_.castArray(operand as string | Array<string>), _.toLower);
};

const toExportCreatedAt = (
  value: unknown,
): UserCSVExportFilter['created_at'] | undefined => {
  if (!_.isPlainObject(value)) return undefined;
  const { after, before } = value as { after?: string; before?: string };
  if (_.isNil(after) && _.isNil(before)) return undefined;
  return {
    ...(after ? { after } : {}),
    ...(before ? { before } : {}),
  };
};

/**
 * Translates the Users tab's `UserV2Filter` into the CSV export DTO. The
 * status radio is NOT handled here — the caller merges it, since it drives the
 * query through a different shape.
 */
export const buildUserCSVExportFilter = (
  filter: Record<string, any> | null | undefined,
): UserCSVExportFilterResult => {
  const exportFilter: UserCSVExportFilter = {};
  const unsupportedKeys: Array<string> = [];
  const conditions: Array<[string, any]> = [];

  const collect = (node: Record<string, any> | null | undefined) => {
    _.forEach(node ?? {}, (value, key) => {
      if (_.isNil(value)) return;
      if (key === 'AND') {
        _.forEach(_.castArray(value), collect);
        return;
      }
      if (key === 'OR' || key === 'NOT') {
        unsupportedKeys.push(key);
        return;
      }
      conditions.push([key, value]);
    });
  };
  collect(filter);

  _.forEach(conditions, ([key, value]) => {
    const stringField = EXPORT_STRING_FIELDS[key];
    if (stringField) {
      const pair = firstOperator(value);
      const operator = pair && EXPORT_STRING_OPERATORS[pair[0]];
      // One condition per field: the backend applies the first operator it
      // finds and ignores the rest, so a second condition on the same field
      // would be dropped without anyone noticing.
      if (!operator || _.has(exportFilter, stringField)) {
        unsupportedKeys.push(key);
        return;
      }
      _.set(exportFilter, [stringField], {
        [operator]: pair[1] as string | Array<string>,
      });
      return;
    }
    if (key === 'role') {
      const roles = toExportRoles(value);
      if (roles && !exportFilter.role) {
        exportFilter.role = roles;
        return;
      }
    }
    if (key === 'createdAt') {
      const createdAt = toExportCreatedAt(value);
      if (createdAt && !exportFilter.created_at) {
        exportFilter.created_at = createdAt;
        return;
      }
    }
    unsupportedKeys.push(key);
  });

  return { filter: exportFilter, unsupportedKeys: _.uniq(unsupportedKeys) };
};
