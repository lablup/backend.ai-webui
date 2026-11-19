/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RANGE_PRESETS,
  isRangePreset,
  type RangePreset,
} from './panelSettings';
import {
  CHART_TYPES,
  PANEL_TYPES,
  type ChartType,
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

/** The system prompt that turns one description into a panel. */
export const buildPanelPrompt = (
  sources: ReadonlyArray<PanelSourceSpec>,
): string =>
  [
    "You configure one Backend.AI WebUI dashboard panel from the user's description.",
    'Data sources (key, label, panel types, filter properties, chart groupings):',
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
      .join('\n'),
    'Reply with only a JSON object, no other text:',
    '{"resourceType":"<source key>","panelType":"resourceTable","title":"<short title>","conditions":[{"property":"<key>","operator":"<operator>","value":"<value>"}],"chartType":"donut","groupBy":"<grouping key>","range":"now-24h"}',
    `panelType: resourceTable (rows), resourceCount (a number), resourceChart (a chart), sessionResourceGrid (session cards). chartType (charts only): ${CHART_TYPES.join(' ')}. range (charts over time only): ${RANGE_PRESETS.join(' ')}.`,
    'Use only listed keys, operators and values. Leave out what the user did not ask for. Write the title in the language the user writes in.',
  ].join('\n\n');

const jsonOfReply = (text: string): unknown => {
  const fenced = /```(?:[\w-]+)?\s*([\s\S]*?)```/.exec(text);
  const body = fenced
    ? fenced[1]
    : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  try {
    return body ? JSON.parse(body) : undefined;
  } catch {
    return undefined;
  }
};

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
    const rule = source.filter.properties.find((p) => p.key === property)?.rule;
    if (values.some((v) => /^<.*>$/.test(v) || (rule && !rule.validate(v))))
      return [];
    const isList = operator === 'in' || operator === 'notIn';
    return [{ property, operator, value: isList ? values : values[0] }];
  });

const quoteMinilang = (property: FilterProperty | undefined, value: string) =>
  property?.type === 'number' || property?.type === 'boolean'
    ? value
    : `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

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
  return conditions
    .map(({ property, operator, value }) => {
      const raw = String(Array.isArray(value) ? value[0] : value);
      const wrapped = operator === 'ilike' ? `%${raw}%` : raw;
      return `${property} ${operator} ${quoteMinilang(
        properties.find((p) => p.key === property),
        wrapped,
      )}`;
    })
    .join(' & ');
};

/** The panel a model reply describes, or null when it names no usable source. */
export const parsePanelReply = (
  text: string,
  sources: ReadonlyArray<PanelSourceSpec>,
): PanelDraft | null => {
  const json = jsonOfReply(text);
  if (!_.isPlainObject(json)) return null;
  const reply = json as Record<string, unknown>;
  const source = sources.find((s) => s.key === reply.resourceType);
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
