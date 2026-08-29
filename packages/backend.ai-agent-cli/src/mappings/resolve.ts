import type { RepoContext } from '../repo-context.js';
import type { DocsPage } from '../search/docs-corpus.js';
import { INDEX_LANG, loadDocsPages } from '../search/docs-corpus.js';
import { resolveDocsVersion } from '../search/engine.js';
import type { SchemaType } from '../search/schema-sdl.js';
import { schemaContext } from '../search/schema-search.js';
import { loadTerminology } from '../search/terminology.js';
import type { MappingSet, MappingValue } from './load.js';
import { loadMappings } from './load.js';
import { enumTypeFor, findConcept, resolveDocsRef } from './refs.js';

export type MappingIssueLevel = 'fail' | 'warn';

export interface MappingIssue {
  level: MappingIssueLevel;
  /** `mappings/<Type>.yaml`, or `-` for a repository-wide observation. */
  file: string;
  /** What the issue is about: `ComputeSessionNode.status=RUNNING`. */
  ref: string;
  message: string;
}

export interface MappingResolution {
  set: MappingSet;
  issues: MappingIssue[];
  counts: {
    files: number;
    types: number;
    fields: number;
    values: number;
    concepts: number;
    docs: number;
  };
}

/** Enum vocabularies the WebUI renders but no mapping curates. Capped. */
const UNMAPPED_REPORT_LIMIT = 8;

function valueEntries(
  values: Record<string, MappingValue> | undefined,
): Array<[string, MappingValue]> {
  return Object.entries(values ?? {});
}

/**
 * Load every mapping and check that all of its references still point at
 * something: a type and field in the SDL, an enum value when the field is an
 * enum, a terminology concept, and a heading in the English manual.
 */
export function resolveMappings(
  context: RepoContext,
  dir?: string,
): MappingResolution {
  const set = loadMappings(dir);
  const issues: MappingIssue[] = set.issues.map((issue) => ({
    level: 'fail' as const,
    file: issue.file,
    ref: issue.file,
    message: issue.message,
  }));

  const { schema, i18n } = schemaContext(context);
  const terms = loadTerminology(context);
  const version = resolveDocsVersion(context);
  const pages: DocsPage[] = loadDocsPages(context, INDEX_LANG);
  const cache = new Map<string, DocsPage | null>();
  const counts = {
    files: set.files.length,
    types: 0,
    fields: 0,
    values: 0,
    concepts: 0,
    docs: 0,
  };

  const checkConcept = (file: string, ref: string, id?: string): void => {
    if (!id) return;
    counts.concepts += 1;
    if (!findConcept(terms, id)) {
      issues.push({
        level: 'fail',
        file,
        ref,
        message: `concept "${id}" is not in terminology.json`,
      });
    }
  };

  const checkDocs = (file: string, ref: string, docs?: string): void => {
    if (!docs) return;
    counts.docs += 1;
    if (!resolveDocsRef(context, docs, INDEX_LANG, version, pages, cache)) {
      issues.push({
        level: 'fail',
        file,
        ref,
        message: `docs "${docs}" does not resolve to a heading in the English manual`,
      });
    }
  };

  const curatedEnums = new Set<string>();

  for (const entry of set.files) {
    const { file, mapping } = entry;
    const type: SchemaType | undefined = schema.byName.get(mapping.type);
    if (!type) {
      issues.push({
        level: 'fail',
        file,
        ref: mapping.type,
        message: `type "${mapping.type}" is not in the schema`,
      });
      continue;
    }
    counts.types += 1;
    checkConcept(file, mapping.type, mapping.concept);
    checkDocs(file, mapping.type, mapping.docs);

    for (const [fieldName, field] of Object.entries(mapping.fields ?? {})) {
      const ref = `${mapping.type}.${fieldName}`;
      const declared = type.fields.find((one) => one.name === fieldName);
      if (!declared) {
        issues.push({
          level: 'fail',
          file,
          ref,
          message: `field "${fieldName}" is not declared on ${mapping.type}`,
        });
        continue;
      }
      counts.fields += 1;
      checkConcept(file, ref, field.concept);
      checkDocs(file, ref, field.docs);

      const enumType = enumTypeFor(schema, declared.namedType);
      if (enumType) curatedEnums.add(`${mapping.type}.${fieldName}`);
      const curated = valueEntries(field.values);
      for (const [name, value] of curated) {
        counts.values += 1;
        const valueRef = `${ref}=${name}`;
        if (enumType && !enumType.values.some((one) => one.name === name)) {
          issues.push({
            level: 'fail',
            file,
            ref: valueRef,
            message: `"${name}" is not a value of enum ${enumType.name}`,
          });
        }
        checkConcept(file, valueRef, value.concept);
        checkDocs(file, valueRef, value.docs);
      }

      // A half-curated enum reads as a complete vocabulary to the caller.
      if (enumType && curated.length > 0) {
        const missing = enumType.values
          .map((one) => one.name)
          .filter((name) => !field.values?.[name]);
        if (missing.length > 0) {
          issues.push({
            level: 'warn',
            file,
            ref,
            message: `enum ${enumType.name} is partly curated; missing ${missing.join(', ')}`,
          });
        }
      }
    }
  }

  // Stretch check: value vocabularies the WebUI renders that nothing curates.
  const unmapped: string[] = [];
  for (const fieldId of i18n.byField.keys()) {
    const [typeName, fieldName] = fieldId.split('.');
    const declared = schema.byName
      .get(typeName)
      ?.fields.find((one) => one.name === fieldName);
    if (!declared || !enumTypeFor(schema, declared.namedType)) continue;
    if (curatedEnums.has(fieldId)) continue;
    unmapped.push(fieldId);
  }
  if (unmapped.length > 0) {
    issues.push({
      level: 'warn',
      file: '-',
      ref: 'unmapped value vocabularies',
      message: `${unmapped.length} UI-rendered enum field(s) have no curated values: ${unmapped
        .slice(0, UNMAPPED_REPORT_LIMIT)
        .join(', ')}`,
    });
  }

  return { set, issues, counts };
}
