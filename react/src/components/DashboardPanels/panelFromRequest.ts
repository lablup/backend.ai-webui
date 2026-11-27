/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { resolveChart } from './chartSources';
import {
  RANGE_PRESETS,
  isRangePreset,
  type RangePreset,
} from './panelSettings';
import {
  CHART_TYPES,
  PANEL_TYPES,
  type ChartType,
  type PanelInput,
  type PanelType,
  type ResourceKey,
} from './types';
import {
  availableOperatorsOf,
  graphQLFilterOfConditions,
  type BAIGraphQLFilterProperty,
  type FilterProperty,
  type GraphQLFilter,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';

/** One condition the model states; the panel's filter format is built from these. */
export interface PanelCondition {
  property: string;
  operator: string;
  value: string | Array<string>;
}

/** What one data source offers a described panel. */
export interface PanelSourceSpec {
  key: ResourceKey;
  label: string;
  panelTypes: ReadonlyArray<PanelType>;
  /** `minilang` for the session panel's query string, `graphql` for a `GraphQLFilter`. */
  filter:
    | { kind: 'minilang'; properties: ReadonlyArray<FilterProperty> }
    | { kind: 'graphql'; properties: ReadonlyArray<BAIGraphQLFilterProperty> };
  groupings: ReadonlyArray<{ key: string; label: string }>;
}

/** The modal fields a request fills in. */
export interface PanelDraft {
  resourceType: ResourceKey;
  panelType: PanelType;
  title?: string;
  filter?: GraphQLFilter | string;
  chartType?: ChartType;
  groupBy?: string;
  range?: RangePreset;
}

const isEnum = (property: {
  type: string;
  options?: ReadonlyArray<unknown>;
  strictSelection?: boolean;
}) =>
  property.type === 'boolean' ||
  (!!property.options && !!property.strictSelection);

/** The operators the session panel's minilang offers per property (`BAIPropertyFilter`). */
const minilangOperators = (property: FilterProperty): Array<string> =>
  _.uniq([
    ...(property.defaultOperator ? [property.defaultOperator] : []),
    ...(isEnum(property)
      ? ['==', '!=']
      : property.type === 'string'
        ? ['ilike', '==']
        : property.type === 'number'
          ? ['==', '!=', '>', '>=', '<', '<=']
          : property.type === 'datetime'
            ? ['>=', '<=', '==', '!=']
            : ['==', '!=']),
  ]);

const operatorsOf = (source: PanelSourceSpec, key: string) => {
  if (source.filter.kind === 'minilang') {
    const property = source.filter.properties.find((p) => p.key === key);
    return property ? minilangOperators(property) : [];
  }
  const property = source.filter.properties.find((p) => p.key === key);
  return property ? availableOperatorsOf(property) : [];
};

const optionValuesOf = (
  properties: ReadonlyArray<FilterProperty | BAIGraphQLFilterProperty>,
  key: string,
): Array<string> | undefined => {
  const property = properties.find((p) => p.key === key);
  if (!property) return undefined;
  if (property.type === 'boolean') return ['true', 'false'];
  return isEnum(property)
    ? (property.options ?? []).map((option) => String(option.value))
    : undefined;
};

const propertyLine = (
  source: PanelSourceSpec,
  property: FilterProperty | BAIGraphQLFilterProperty,
) => {
  const values = optionValuesOf(source.filter.properties, property.key);
  return [
    `    - ${property.key} (${property.propertyLabel}, ${property.type})`,
    `operators: ${operatorsOf(source, property.key).join(' ')}`,
    values ? `values: ${values.join(' ')}` : undefined,
  ]
    .filter(Boolean)
    .join('; ');
};

/** The data sources a new panel can use, as the chat prompt lists them. */
export const describePanelSources = (
  sources: ReadonlyArray<PanelSourceSpec>,
): string =>
  sources
    .map((source) =>
      [
        `- ${source.key} (${source.label}); panel types: ${source.panelTypes.join(' ')}`,
        '  filter properties:',
        ...source.filter.properties.map((property) =>
          propertyLine(source, property),
        ),
        `  chart groupings: ${source.groupings.map((g) => `${g.key} (${g.label})`).join(', ')}`,
      ].join('\n'),
    )
    .join('\n');

/** A condition on the source's first enum property, for the prompt's worked example. */
export const exampleConditionOf = (
  source: PanelSourceSpec,
):
  | { property: string; label: string; operator: string; value: string }
  | undefined => {
  for (const property of source.filter.properties) {
    const values = optionValuesOf(source.filter.properties, property.key);
    const operator = operatorsOf(source, property.key)[0];
    if (values?.length && operator && property.type !== 'boolean') {
      const value = values.includes('RUNNING') ? 'RUNNING' : values[0];
      return {
        property: property.key,
        label: property.propertyLabel,
        operator,
        value,
      };
    }
  }
  return undefined;
};

/** Field rules for a panel in an `addPanel` or `editPanel` action. */
export const PANEL_FIELDS_HELP = `panelType: resourceTable (rows), resourceCount (a number), resourceChart (a chart), sessionResourceGrid (session cards). chartType (charts only): ${CHART_TYPES.join(' ')}. range (charts over time only): ${RANGE_PRESETS.join(' ')}. conditions: [{"property":"<key>","operator":"<operator>","value":"<value>"}] with listed keys, operators and values only.`;

const asString = (value: unknown) =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean'
    ? String(value)
    : undefined;

/** The conditions that name a listed property, an offered operator, and an allowed value. */
export const sanitizeConditions = (
  value: unknown,
  source: PanelSourceSpec,
): Array<PanelCondition> =>
  (Array.isArray(value) ? value : []).flatMap((raw): Array<PanelCondition> => {
    if (!_.isPlainObject(raw)) return [];
    const {
      property,
      operator,
      value: rawValue,
    } = raw as Record<string, unknown>;
    if (typeof property !== 'string' || typeof operator !== 'string') return [];
    if (!operatorsOf(source, property).includes(operator)) return [];
    const allowed = optionValuesOf(source.filter.properties, property);
    const values = Array.isArray(rawValue)
      ? _.compact(rawValue.map(asString))
      : _.compact([asString(rawValue)]);
    if (!values.length) return [];
    if (allowed && values.some((v) => !allowed.includes(v))) return [];
    // A small model copies the prompt's `<placeholder>` or an id it cannot know.
    const spec = source.filter.properties.find((p) => p.key === property);
    const rule = spec?.rule;
    // A number or a date the manager cannot parse fails the whole filter.
    if (
      (spec?.type === 'number' &&
        values.some((v) => !Number.isFinite(Number(v)))) ||
      (spec?.type === 'datetime' &&
        values.some((v) => Number.isNaN(Date.parse(v))))
    )
      return [];
    if (values.some((v) => /^<.*>$/.test(v) || (rule && !rule.validate(v))))
      return [];
    // BAIPropertyFilter splits minilang on every '"' and never unescapes, so such a value cannot round-trip.
    if (
      source.filter.kind === 'minilang' &&
      values.some((v) => /["\\]/.test(v))
    )
      return [];
    const isList = operator === 'in' || operator === 'notIn';
    return [{ property, operator, value: isList ? values : values[0] }];
  });

const quoteMinilang = (property: FilterProperty | undefined, value: string) =>
  property?.type === 'number' || property?.type === 'boolean'
    ? value
    : `"${value}"`;

/** The conditions in the source's own filter format: a minilang string or a `GraphQLFilter`. */
export const filterOfConditions = (
  source: PanelSourceSpec,
  conditions: ReadonlyArray<PanelCondition>,
): GraphQLFilter | string | undefined => {
  if (!conditions.length) return undefined;
  if (source.filter.kind === 'graphql') {
    return graphQLFilterOfConditions(conditions, [...source.filter.properties]);
  }
  const properties = source.filter.properties;
  const terms = conditions.flatMap(({ property, operator, value }) => {
    const raw = String(Array.isArray(value) ? value[0] : value);
    // Cannot be quoted for BAIPropertyFilter, which never unescapes.
    if (/["\\]/.test(raw)) return [];
    const wrapped = operator === 'ilike' ? `%${raw}%` : raw;
    return [
      `${property} ${operator} ${quoteMinilang(
        properties.find((p) => p.key === property),
        wrapped,
      )}`,
    ];
  });
  return terms.length ? terms.join(' & ') : undefined;
};

/**
 * The source a reply that names none most likely means: the only one whose
 * filter has every condition's property, else the only one its title names.
 */
const inferSource = (
  reply: Record<string, unknown>,
  sources: ReadonlyArray<PanelSourceSpec>,
): PanelSourceSpec | undefined => {
  const keys = (Array.isArray(reply.conditions) ? reply.conditions : [])
    .map((condition) =>
      _.isPlainObject(condition)
        ? (condition as Record<string, unknown>).property
        : undefined,
    )
    .filter((key): key is string => typeof key === 'string');
  const byProperties = keys.length
    ? sources.filter((source) =>
        keys.every((key) =>
          source.filter.properties.some((property) => property.key === key),
        ),
      )
    : [];
  if (byProperties.length === 1) return byProperties[0];
  const title =
    typeof reply.title === 'string' ? reply.title.toLowerCase() : '';
  const byTitle = (byProperties.length ? byProperties : sources).filter(
    (source) =>
      title.includes(source.key.toLowerCase()) ||
      title.includes(source.label.toLowerCase()),
  );
  return byTitle.length === 1 ? byTitle[0] : undefined;
};

/** The panel one reply object describes, or null when it names no usable source. */
export const panelDraftOf = (
  value: unknown,
  sources: ReadonlyArray<PanelSourceSpec>,
): PanelDraft | null => {
  if (!_.isPlainObject(value)) return null;
  const reply = value as Record<string, unknown>;
  const source =
    sources.find((s) => s.key === reply.resourceType) ??
    (reply.resourceType === undefined
      ? inferSource(reply, sources)
      : undefined);
  if (!source) return null;
  const panelType =
    (PANEL_TYPES as ReadonlyArray<unknown>).includes(reply.panelType) &&
    source.panelTypes.includes(reply.panelType as PanelType)
      ? (reply.panelType as PanelType)
      : 'resourceTable';
  const title = asString(reply.title)?.trim();
  const groupBy = source.groupings.some((g) => g.key === reply.groupBy)
    ? (reply.groupBy as string)
    : undefined;
  return {
    resourceType: source.key,
    panelType,
    ...(title ? { title } : {}),
    filter: filterOfConditions(
      source,
      sanitizeConditions(reply.conditions, source),
    ),
    ...(panelType === 'resourceChart'
      ? {
          chartType: (CHART_TYPES as ReadonlyArray<unknown>).includes(
            reply.chartType,
          )
            ? (reply.chartType as ChartType)
            : undefined,
          groupBy,
          range: isRangePreset(reply.range) ? reply.range : undefined,
        }
      : {}),
  };
};

/** The panel modal's input for a draft; a chart over time counts within its range. */
export const inputOfDraft = (draft: PanelDraft): PanelInput => {
  const chart =
    draft.panelType === 'resourceChart'
      ? resolveChart(draft.resourceType, {
          type: draft.chartType,
          groupBy: draft.groupBy,
          period: draft.range ? true : undefined,
        })
      : null;
  return {
    panelType: draft.panelType,
    resourceType: draft.resourceType,
    title: draft.title,
    filter: draft.filter ?? null,
    order: null,
    gridView: null,
    chart,
    range: draft.range,
  };
};
