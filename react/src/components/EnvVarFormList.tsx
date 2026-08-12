/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  Form,
  FormInstance,
  FormItemProps,
  FormListProps,
} from '../form-engine';
import { AstryxFormTextInput } from './astryxFormControls';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { BAIButton, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleMinus, PlusIcon, SparklesIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface EnvVarConfig {
  variable: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
}

/**
 * The value input's placeholder depends on the SIBLING `variable` field.
 *
 * `Form.Item`'s `dependencies` re-renders the *Field*, but the
 * `<AstryxFormTextInput placeholder={…}>` element it renders is still the same
 * static element object created on the last OUTER render, so a placeholder
 * computed inline from `form.getFieldValue(...)` never updates — the field the
 * user just typed into keeps showing the generic hint. `Form.useWatch`
 * subscribes this leaf component to the sibling field, which is what actually
 * makes the placeholder reactive.
 *
 * `value` / `onChange` are injected by the enclosing `Form.Item` and forwarded
 * through `...controlProps`.
 */
const EnvVarValueInput: React.FC<
  {
    form: FormInstance;
    variableNamePath: Parameters<FormInstance['getFieldValue']>[0];
    getPlaceholderForVariable: (variable: string) => string;
    label: string;
  } & Omit<
    React.ComponentProps<typeof AstryxFormTextInput>,
    'label' | 'placeholder'
  >
> = ({
  form,
  variableNamePath,
  getPlaceholderForVariable,
  label,
  ...controlProps
}) => {
  'use memo';
  const variable = Form.useWatch(variableNamePath, form);
  return (
    <AstryxFormTextInput
      {...controlProps}
      label={label}
      placeholder={getPlaceholderForVariable(variable)}
    />
  );
};

interface EnvVarFormListProps extends Omit<FormListProps, 'children'> {
  formItemProps?: FormItemProps;
  requiredEnvVars?: EnvVarConfig[];
  optionalEnvVars?: EnvVarConfig[];
}

export interface EnvVarFormListValue {
  variable: string;
  value: string;
}
const EnvVarFormList: React.FC<EnvVarFormListProps> = ({
  formItemProps,
  requiredEnvVars,
  optionalEnvVars,
  ...props
}) => {
  'use memo';
  const { rules: externalRules, ...restFormItemProps } = formItemProps || {};
  const { t } = useTranslation();
  const form = Form.useFormInstance();

  const allEnvVars = [
    ..._.filter(
      requiredEnvVars || [],
      (env): env is EnvVarConfig => env != null && !!env.variable,
    ),
    ..._.filter(
      optionalEnvVars || [],
      (env): env is EnvVarConfig => env != null && !!env.variable,
    ),
  ];

  const getPlaceholderForVariable = (variable: string) => {
    if (!variable || !allEnvVars.length)
      return t('session.launcher.EnvironmentVariableValue');
    const envVarConfig = _.find(
      allEnvVars,
      (env) => env && env.variable === variable,
    );
    return (
      envVarConfig?.placeholder ||
      t('session.launcher.EnvironmentVariableValue')
    );
  };

  /**
   * The still-unused suggested variable names, in `optionalEnvVars` then
   * `requiredEnvVars` order.
   *
   * HISTORY — this fed an antd `AutoComplete` dropdown before the Astryx
   * migration. MAPPING §3.15 gives free-text `AutoComplete` no Astryx
   * destination and free text is mandatory here (the whole point of the field
   * is arbitrary env var names), so W2A-3 dropped the popup and joined these
   * names into the field's PLACEHOLDER instead. That degrades badly once a
   * caller passes more than two or three: `useCommonEnvVarConfigs` supplies
   * eight, which renders as a comma-joined run of ~90 characters truncated
   * inside a half-width field — discoverable in principle, unreadable in
   * practice.
   *
   * They now drive the `DropdownMenu` next to the add button instead: picking
   * one appends a row with `variable` pre-filled, so the name never has to be
   * typed from memory. The text field stays a plain `TextInput`, so arbitrary
   * names are untouched — which is the constraint that ruled out `Typeahead`
   * in the first place. `BaseTypeahead` cannot stand in either: its query is
   * uncontrolled internal state that it clears on select, so it cannot hold a
   * form-controlled free-text value.
   */
  const getSuggestedVariableNames = () => {
    const currentValues = form.getFieldValue(props.name) || [];
    const usedVariables = _.map(
      _.filter(
        currentValues,
        (item: EnvVarFormListValue) =>
          item != null &&
          typeof item.variable === 'string' &&
          item.variable.trim() !== '',
      ),
      'variable',
    );

    return _.map(
      _.filter(
        [...(optionalEnvVars || []), ...(requiredEnvVars || [])],
        (env): env is EnvVarConfig =>
          env != null &&
          !!env.variable &&
          !_.includes(usedVariables, env.variable),
      ),
      (env) => env.variable,
    );
  };

  return (
    <Form.List
      {...props}
      rules={[
        ...(props.rules || []),
        // check if all required fields are filled
        {
          validator: async (
            _rule,
            envVars: EnvVarFormListValue[] | undefined,
          ) => {
            if (requiredEnvVars && requiredEnvVars.length > 0) {
              const missingRequiredVars = _.filter(
                requiredEnvVars,
                (requiredEnv) => {
                  return !_.some(
                    envVars,
                    (envVar) =>
                      envVar &&
                      envVar.variable === requiredEnv.variable &&
                      envVar.value.trim() !== '',
                  );
                },
              );
              if (missingRequiredVars.length > 0) {
                return Promise.reject(
                  t('session.launcher.MissingRequiredEnvironmentVariables', {
                    vars: _.map(missingRequiredVars, 'variable').join(', '),
                  }),
                );
              }
            }
          },
        },
      ]}
    >
      {(fields, { add, remove }, { errors }) => {
        // Recomputed per render of this list — `fields` changes whenever a row
        // is added or removed, so the menu drops names as they get used.
        const suggestedVariableNames = getSuggestedVariableNames();
        return (
          <BAIFlex direction="column" gap="xs" align="stretch">
            {fields.map(({ key, name, ...restField }) => (
              <BAIFlex key={key} direction="row" align="baseline" gap="xs">
                <Form.Item
                  {...restField}
                  style={{ marginBottom: 0, flex: 1 }}
                  name={[name, 'variable']}
                  rules={[
                    ...(externalRules || []),
                    {
                      required: true,
                      message: t('session.launcher.EnterEnvironmentVariable'),
                    },
                    {
                      pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                      message: t(
                        'session.launcher.EnvironmentVariableNamePatternError',
                      ),
                    },
                    ({ getFieldValue }) => ({
                      validator(_rule, variableName) {
                        const variableNames = _.map(
                          getFieldValue(props.name),
                          (i) => i?.variable,
                        );

                        if (
                          !_.isEmpty(variableName) &&
                          variableNames.length > 0 &&
                          _.filter(variableNames, (i) => i === variableName)
                            .length > 1
                        ) {
                          return Promise.reject(
                            t(
                              'session.launcher.EnvironmentVariableDuplicateName',
                            ),
                            // EnvironmentVariableDuplicateName
                          );
                        } else {
                          return Promise.resolve();
                        }
                      },
                    }),
                  ]}
                  {...restFormItemProps}
                >
                  <AstryxFormTextInput
                    label={t('session.launcher.EnvironmentVariable')}
                    placeholder={t('session.launcher.EnvironmentVariable')}
                    onChange={() => {
                      const fieldNames = fields.map((_field, fieldIndex) => [
                        props.name,
                        fieldIndex,
                        'variable',
                      ]);
                      form.validateFields(fieldNames);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'value']}
                  style={{ marginBottom: 0, flex: 1 }}
                  rules={[
                    {
                      required: true,
                      message: t(
                        'session.launcher.EnvironmentVariableValueRequired',
                      ),
                    },
                  ]}
                  validateTrigger={['onChange', 'onBlur']}
                >
                  <EnvVarValueInput
                    form={form}
                    variableNamePath={[props.name, name, 'variable']}
                    getPlaceholderForVariable={getPlaceholderForVariable}
                    label={t('session.launcher.EnvironmentVariableValue')}
                  />
                </Form.Item>
                <CircleMinus size="1em" onClick={() => remove(name)} />
              </BAIFlex>
            ))}
            <Form.Item noStyle>
              <BAIFlex direction="row" gap="xs" align="stretch">
                <BAIButton
                  type="dashed"
                  // PILOT-DECISION: the antd `InputRef.focus()` that jumped the
                  // caret into the row just added is DROPPED. Astryx uses a
                  // `handleRef` convention rather than `ref` + `InputRef`
                  // (MAPPING §6.2) and `AstryxFormTextInput` exposes no ref
                  // slot; the same call was already made for the select stack
                  // (P26-8).
                  onClick={() => {
                    add();
                  }}
                  icon={<PlusIcon />}
                  block
                >
                  {t('session.launcher.AddEnvironmentVariable')}
                </BAIButton>
                {suggestedVariableNames.length > 0 ? (
                  <DropdownMenu
                    button={{
                      icon: <SparklesIcon size="1em" />,
                      isIconOnly: true,
                      label: t(
                        'session.launcher.AddSuggestedEnvironmentVariable',
                      ),
                      variant: 'secondary',
                    }}
                    hasChevron={false}
                    alignment="end"
                    items={_.map(suggestedVariableNames, (variable) => ({
                      label: variable,
                      // Appending with `variable` pre-filled is what replaces
                      // the old type-to-filter dropdown. The name is already
                      // known to be unused (`getSuggestedVariableNames`
                      // excludes the ones in the list), so this cannot create
                      // the duplicate the `variable` rule guards against.
                      onClick: () => add({ variable, value: '' }),
                    }))}
                  />
                ) : null}
              </BAIFlex>
            </Form.Item>
            <Form.ErrorList errors={errors} />
          </BAIFlex>
        );
      }}
    </Form.List>
  );
};

const sensitivePatterns = [
  /AUTH/i,
  /ACCESS/i,
  /SECRET/i,
  /_KEY/i,
  /PASSWORD/i,
  /PASSWD/i,
  /PWD/i,
  /TOKEN/i,
  /PRIVATE/i,
  /CREDENTIAL/i,
  /JWT/i,
  /KEYPAIR/i,
  /CERTIFICATE/i,
  /SSH/i,
  /ENCRYPT/i,
  /SIGNATURE/i,
  /SALT/i,
  /PIN/i,
  /PASSPHRASE/i,
  /OAUTH/i,
];

export function isSensitiveEnv(key: string) {
  return _.some(sensitivePatterns, (pattern) => pattern.test(key));
}

export function sanitizeSensitiveEnv(envs: EnvVarFormListValue[]) {
  return _.map(envs, (env) => {
    if (env && isSensitiveEnv(env.variable)) {
      return { ...env, value: '' };
    }
    return env;
  });
}

export default EnvVarFormList;
