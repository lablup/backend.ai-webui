/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, FormItemProps, FormListProps } from '../form-engine';
import { AstryxFormTextInput } from './astryxFormControls';
import { BAIButton, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleMinus, PlusIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface EnvVarConfig {
  variable: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
}

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
   * PILOT-DECISION: this used to feed an antd `AutoComplete` dropdown of the
   * still-unused optional variable names. MAPPING §3.15 gives free-text
   * `AutoComplete` no Astryx destination (`Typeahead` commits `T | null` and
   * cannot keep a typed string), and free text is mandatory here — the whole
   * point of the field is arbitrary env var names. The names now surface as
   * the field's PLACEHOLDER instead of a popup, which keeps them discoverable
   * without rebuilding `TextInput` + `Popover`.
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
                    placeholder={
                      optionalEnvVars && getSuggestedVariableNames().length > 0
                        ? getSuggestedVariableNames().join(', ')
                        : t('session.launcher.EnvironmentVariable')
                    }
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
                  dependencies={[[props.name, name, 'variable']]}
                >
                  <AstryxFormTextInput
                    label={t('session.launcher.EnvironmentVariableValue')}
                    placeholder={getPlaceholderForVariable(
                      form.getFieldValue([props.name, name, 'variable']),
                    )}
                  />
                </Form.Item>
                <CircleMinus size="1em" onClick={() => remove(name)} />
              </BAIFlex>
            ))}
            <Form.Item noStyle>
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
