/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

export type NotificationRuleTypeValue =
  | 'SESSION_STARTED'
  | 'SESSION_TERMINATED'
  | 'ARTIFACT_DOWNLOAD_COMPLETED'
  | 'ENDPOINT_LIFECYCLE_CHANGED';

export const NOTIFICATION_RULE_TYPES: ReadonlyArray<NotificationRuleTypeValue> =
  [
    'SESSION_STARTED',
    'SESSION_TERMINATED',
    'ARTIFACT_DOWNLOAD_COMPLETED',
    'ENDPOINT_LIFECYCLE_CHANGED',
  ];

export type TemplateVariable = {
  name: string;
  title?: string;
  description?: string;
  type?: string;
  isRequired: boolean;
};

type JsonSchemaProperty = {
  title?: unknown;
  description?: unknown;
  type?: unknown;
  anyOf?: unknown;
};

const typeOf = (property: JsonSchemaProperty): string | undefined => {
  if (_.isString(property.type)) return property.type;
  const nonNull = _.find(
    _.castArray(property.anyOf ?? []) as JsonSchemaProperty[],
    (option) => _.isString(option?.type) && option.type !== 'null',
  );
  return nonNull?.type as string | undefined;
};

/**
 * The variables a message template can use, read from the JSON schema
 * `notificationRuleTypeSchema` returns. Required variables come first.
 */
export const getTemplateVariables = (schema: unknown): TemplateVariable[] => {
  if (!_.isPlainObject(schema)) return [];
  const { properties, required } = schema as {
    properties?: Record<string, JsonSchemaProperty>;
    required?: unknown;
  };
  const requiredSet = new Set(_.filter(_.castArray(required), _.isString));
  const variables = _.map(
    _.toPairs(_.isPlainObject(properties) ? properties : {}),
    ([name, property]) => ({
      name,
      title: _.isString(property?.title) ? property.title : undefined,
      description: _.isString(property?.description)
        ? property.description
        : undefined,
      type: typeOf(property ?? {}),
      isRequired: requiredSet.has(name),
    }),
  );
  return _.sortBy(variables, (variable) => (variable.isRequired ? 0 : 1));
};

export const toTemplateExpression = (name: string) => `{{ ${name} }}`;

/** A starting template: one `name: {{ name }}` line per required variable. */
export const buildDefaultTemplate = (variables: TemplateVariable[]) =>
  _.map(
    _.filter(variables, 'isRequired'),
    (variable) => `${variable.name}: ${toTemplateExpression(variable.name)}`,
  ).join('\n');

/** Sample event data for a test notification, keyed like the schema. */
export const buildSampleNotificationData = (
  variables: TemplateVariable[],
): Record<string, unknown> =>
  _.fromPairs(
    _.map(variables, (variable) => {
      switch (variable.type) {
        case 'integer':
        case 'number':
          return [variable.name, 1];
        case 'boolean':
          return [variable.name, true];
        case 'array':
          return [variable.name, []];
        case 'object':
          return [variable.name, {}];
        default:
          return [variable.name, `sample-${variable.name}`];
      }
    }),
  );

/** Inserts `text` into `value` at the given selection, returning the new value and caret. */
export const insertAtSelection = (
  value: string,
  text: string,
  selectionStart?: number | null,
  selectionEnd?: number | null,
) => {
  const start = _.clamp(selectionStart ?? value.length, 0, value.length);
  const end = _.clamp(selectionEnd ?? start, start, value.length);
  return {
    value: value.slice(0, start) + text + value.slice(end),
    caret: start + text.length,
  };
};
