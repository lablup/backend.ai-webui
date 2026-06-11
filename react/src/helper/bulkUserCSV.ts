/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

/**
 * Pure helpers for the "Bulk Create Users from CSV" modal.
 *
 * These are intentionally free of React / i18n / network concerns so the CSV
 * header-recognition, required-column, and row-extraction logic can be unit
 * tested against real-world export files. The exported-report CSV is the main
 * driver of variety here: its header titles can be raw field keys (`status_info`)
 * or localized field names (`상태`, `Estado`, …), it never includes a `password`
 * column, and it may carry extra columns the importer does not support
 * (`uuid`, `totp_activated`, `created_at`, …). All of that must degrade
 * gracefully into the subset of fields we know how to import.
 */

// Canonical column names the importer understands. Everything the UI renders or
// sends to the mutation is keyed off these names.
export type CanonicalUserColumn =
  | 'email'
  | 'username'
  | 'password'
  | 'full_name'
  | 'role'
  | 'status'
  | 'domain_name'
  | 'description'
  | 'need_password_change'
  | 'resource_policy'
  | 'project';

export const CSV_COLUMNS: CanonicalUserColumn[] = [
  'email',
  'username',
  'password',
  'full_name',
  'domain_name',
  'resource_policy',
  'description',
  'role',
  'status',
  'need_password_change',
  'project',
];

export const TEMPLATE_CSV = [
  CSV_COLUMNS.join(','),
  // email,username,password,full_name,domain_name,resource_policy,description,role,status,need_password_change,project
  'alice@example.com,alice,Password!23,Alice Kim,,default,,user,active,false,',
].join('\n');

// Static header aliases. Keys are already lower-cased; lookups must lower-case
// the raw header first. Covers the common manual-authoring spellings plus the
// export-report field keys that differ from our canonical names.
export const COLUMN_ALIASES: Record<string, CanonicalUserColumn> = {
  email: 'email',
  username: 'username',
  'user name': 'username',
  password: 'password',
  full_name: 'full_name',
  fullname: 'full_name',
  'full name': 'full_name',
  role: 'role',
  status: 'status',
  // Export CSV uses 'status_info' as the column key
  status_info: 'status',
  domain_name: 'domain_name',
  domain: 'domain_name',
  description: 'description',
  need_password_change: 'need_password_change',
  needpasswordchange: 'need_password_change',
  resource_policy: 'resource_policy',
  resourcepolicy: 'resource_policy',
  project: 'project',
  project_name: 'project',
};

// Maps export-report field keys to import canonical names when they differ.
// Used to build dynamic aliases from the server's localized field names so an
// exported CSV round-trips back into the importer regardless of UI locale.
export const EXPORT_KEY_TO_IMPORT: Record<string, CanonicalUserColumn> = {
  status_info: 'status',
  project_name: 'project',
};

// Required columns when no global default password is configured. The export
// report never includes a password column, so importing an export CSV requires
// the admin to set a default password — which relaxes the requirement below.
const REQUIRED_COLUMNS_WITH_PASSWORD: CanonicalUserColumn[] = [
  'email',
  'username',
  'password',
];
const REQUIRED_COLUMNS_WITHOUT_PASSWORD: CanonicalUserColumn[] = [
  'email',
  'username',
];

export interface RawUserRow {
  email: string;
  username: string;
  password: string;
  full_name: string;
  role: string;
  status: string;
  domain_name: string;
  description: string;
  need_password_change: string;
  resource_policy: string;
  project: string;
}

export interface UserCSVColumnMapping {
  /** canonical column name → the raw header text it was found under */
  headerMap: Partial<Record<CanonicalUserColumn, string>>;
  /** the set of canonical columns actually present in the file header */
  presentColumns: Set<CanonicalUserColumn>;
}

export interface ReportField {
  key: string;
  name: string;
}

/** Parses the loose boolean spellings allowed in a need_password_change cell. */
export const parseBoolean = (value: string): boolean => {
  const n = value.trim().toLowerCase();
  return n === 'true' || n === '1' || n === 'yes';
};

/**
 * Builds header aliases from the export report's field descriptors so the
 * localized column titles a server emits (e.g. `상태`, `Estado`) map back to
 * canonical importer columns. Both the raw `key` and the localized `name` are
 * registered. Unknown keys map to themselves, which is harmless — the importer
 * only ever reads the supported subset.
 */
export const buildDynamicColumnAliases = (
  fields: ReportField[],
): Record<string, string> =>
  _.fromPairs(
    fields.flatMap((f) => {
      const canonical = EXPORT_KEY_TO_IMPORT[f.key] ?? f.key;
      return [
        [f.key.toLowerCase(), canonical],
        [f.name.toLowerCase(), canonical],
      ];
    }),
  );

/**
 * Merges the static aliases with dynamically fetched ones. Dynamic aliases win
 * so localized export headers resolve correctly in any locale.
 */
export const mergeColumnAliases = (
  dynamicAliases: Record<string, string> = {},
): Record<string, string> => ({
  ...COLUMN_ALIASES,
  ...dynamicAliases,
});

/**
 * Resolves the raw CSV header row into canonical columns. Headers that do not
 * resolve to a supported canonical column (extra export columns such as `uuid`
 * or `created_at`) are ignored. When the same canonical column appears more than
 * once, the first matching header wins.
 */
export const mapUserCSVColumns = (
  headerKeys: string[],
  aliases: Record<string, string>,
): UserCSVColumnMapping => {
  const headerMap: Partial<Record<CanonicalUserColumn, string>> = {};
  const presentColumns = new Set<CanonicalUserColumn>();
  _.forEach(headerKeys, (rawKey) => {
    const canonical = aliases[rawKey.trim().toLowerCase()] as
      | CanonicalUserColumn
      | undefined;
    // Only honour aliases that resolve to a column we actually import.
    if (canonical && CSV_COLUMNS.includes(canonical) && !headerMap[canonical]) {
      headerMap[canonical] = rawKey;
      presentColumns.add(canonical);
    }
  });
  return { headerMap, presentColumns };
};

/**
 * Returns the canonical columns that are required but missing from the file.
 * `password` is only required when no global default password is configured.
 */
export const findMissingRequiredColumns = (
  presentColumns: Set<CanonicalUserColumn>,
  options: { hasGlobalPassword: boolean },
): CanonicalUserColumn[] => {
  const required = options.hasGlobalPassword
    ? REQUIRED_COLUMNS_WITHOUT_PASSWORD
    : REQUIRED_COLUMNS_WITH_PASSWORD;
  return required.filter((canon) => !presentColumns.has(canon));
};

/**
 * Projects parsed CSV records onto the importer's RawUserRow shape. Columns
 * absent from the header resolve to empty strings (later treated as "not
 * provided" → global default or null at the mutation boundary).
 */
export const extractRawUserRows = (
  records: Record<string, string>[],
  headerMap: Partial<Record<CanonicalUserColumn, string>>,
): RawUserRow[] => {
  const valueOf = (rec: Record<string, string>, canon: CanonicalUserColumn) => {
    const rawKey = headerMap[canon];
    return rawKey ? (rec[rawKey] ?? '') : '';
  };
  return records.map((rec) => ({
    email: valueOf(rec, 'email'),
    username: valueOf(rec, 'username'),
    password: valueOf(rec, 'password'),
    full_name: valueOf(rec, 'full_name'),
    role: valueOf(rec, 'role'),
    status: valueOf(rec, 'status'),
    domain_name: valueOf(rec, 'domain_name'),
    description: valueOf(rec, 'description'),
    need_password_change: valueOf(rec, 'need_password_change'),
    resource_policy: valueOf(rec, 'resource_policy'),
    project: valueOf(rec, 'project'),
  }));
};
