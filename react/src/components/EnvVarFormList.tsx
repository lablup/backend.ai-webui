import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Form,
  FormItemProps,
  Input,
  InputRef,
} from 'antd';
import { FormListProps } from 'antd/lib/form';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useRef } from 'react';
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
// TODO: validation rule for duplicate variable name
const EnvVarFormList: React.FC<EnvVarFormListProps> = ({
  formItemProps,
  requiredEnvVars,
  optionalEnvVars,
  ...props
}) => {
  'use memo';
  const inputRef = useRef<InputRef>(null);
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

  const getAutoCompleteOptions = () => {
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
      (env) => ({
        value: env.variable,
        label: env.variable,
      }),
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
            {fields.map(({ key, name, ...restField }, index) => (
              <BAIFlex key={key} direction="row" align="baseline" gap="xs">
                <Form.Item
                  {...restField}
                  style={{ marginBottom: 0, flex: 1 }}
                  name={[name, 'variable']}
                  rules={[
                    ...(formItemProps?.rules || []),
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
                  {...formItemProps}
                >
                  {optionalEnvVars && getAutoCompleteOptions().length > 0 ? (
                    <AutoComplete
                      placeholder={t('session.launcher.EnvironmentVariable')}
                      options={getAutoCompleteOptions()}
                      onChange={() => {
                        const fieldNames = fields.map((_field, index) => [
                          props.name,
                          index,
                          'variable',
                        ]);
                        form.validateFields(fieldNames);
                      }}
                      filterOption={(inputValue, option) =>
                        option?.value
                          ?.toLowerCase()
                          .indexOf(inputValue.toLowerCase()) !== -1
                      }
                    />
                  ) : (
                    <Input
                      ref={index === fields.length - 1 ? inputRef : null}
                      placeholder={t('session.launcher.EnvironmentVariable')}
                      onChange={() => {
                        const fieldNames = fields.map((_field, index) => [
                          props.name,
                          index,
                          'variable',
                        ]);
                        form.validateFields(fieldNames);
                      }}
                    />
                  )}
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
                  <Input
                    placeholder={getPlaceholderForVariable(
                      form.getFieldValue([props.name, name, 'variable']),
                    )}
                  />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </BAIFlex>
            ))}
            <Form.Item noStyle>
              <Button
                type="dashed"
                onClick={() => {
                  add();
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }, 0);
                }}
                icon={<PlusOutlined />}
                block
              >
                {t('session.launcher.AddEnvironmentVariable')}
              </Button>
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
