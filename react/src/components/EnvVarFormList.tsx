import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, FormItemProps, Input, InputRef } from 'antd';
import { FormListProps } from 'antd/lib/form';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface EnvVarFormListProps extends Omit<FormListProps, 'children'> {
  formItemProps?: FormItemProps;
}

export interface EnvVarFormListValue {
  variable: string;
  value: string;
}
// TODO: validation rule for duplicate variable name
const EnvVarFormList: React.FC<EnvVarFormListProps> = ({
  formItemProps,
  ...props
}) => {
  const inputRef = useRef<InputRef>(null);
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  return (
    <Form.List {...props}>
      {(fields, { add, remove }) => {
        return (
          <BAIFlex direction="column" gap="xs" align="stretch">
            {fields.map(({ key, name, ...restField }, index) => (
              <BAIFlex key={key} direction="row" align="baseline" gap="xs">
                <Form.Item
                  {...restField}
                  style={{ marginBottom: 0, flex: 1 }}
                  name={[name, 'variable']}
                  rules={[
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
                      validator(rule, variableName) {
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
                  <Input
                    ref={index === fields.length - 1 ? inputRef : null}
                    placeholder="Variable"
                    onChange={() => {
                      const fieldNames = fields.map((field, index) => [
                        props.name,
                        index,
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
                  <Input
                    placeholder="Value"
                    // onChange={() => {
                    //   const valueFields = fields.map((field, index) => [
                    //     props.name,
                    //     index,
                    //     'value',
                    //   ]);
                    //   form.validateFields(valueFields);
                    // }}
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
  return sensitivePatterns.some((pattern) => pattern.test(key));
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
