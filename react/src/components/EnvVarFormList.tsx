import Flex from './Flex';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, FormItemProps, Input, InputRef } from 'antd';
import { FormListProps } from 'antd/lib/form';
import _ from 'lodash';
import React, { useRef } from 'react';

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

  return (
    <Form.List {...props}>
      {(fields, { add, remove }) => {
        return (
          <Flex direction="column" gap="xs" align="stretch">
            {fields.map(({ key, name, ...restField }, index) => (
              <Flex key={key} direction="row" align="baseline" gap="xs">
                <Form.Item
                  {...restField}
                  style={{ marginBottom: 0, flex: 1 }}
                  name={[name, 'variable']}
                  rules={[
                    { required: true, message: 'Enter Variable name' },
                    {
                      pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                      message:
                        'Variable name must start with a letter or underscore, and can only contain letters, numbers, and underscores.',
                    },
                    ({ getFieldValue }) => ({
                      validator(rule, variableName) {
                        const variableNames = _.map(
                          getFieldValue('envList'),
                          (i) => i?.variable,
                        );

                        if (
                          variableNames.length > 0 &&
                          _.filter(variableNames, (i) => i === variableName)
                            .length > 1
                        ) {
                          return Promise.reject('Variable name already exists');
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
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'value']}
                  style={{ marginBottom: 0, flex: 1 }}
                  rules={[{ required: true, message: 'Enter value' }]}
                >
                  <Input placeholder="Value" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Flex>
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
                Add variable
              </Button>
            </Form.Item>
          </Flex>
        );
      }}
    </Form.List>
  );
};

export default EnvVarFormList;
