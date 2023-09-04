import Flex from './Flex';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { FormListProps } from 'antd/lib/form';
import _ from 'lodash';
import React from 'react';

interface EnvVarFormListProps extends Omit<FormListProps, 'children'> {}
const EnvVarFormList: React.FC<EnvVarFormListProps> = ({ ...props }) => {
  return (
    <Form.List {...props}>
      {(fields, { add, remove }) => {
        return (
          <Flex direction="column" gap="xs" align="stretch">
            <Form.Item noStyle>
              <Button
                type="dashed"
                onClick={() => add()}
                icon={<PlusOutlined />}
                block
              >
                Add variable
              </Button>
            </Form.Item>
            {fields.map(({ key, name, ...restField }) => (
              <Flex key={key} direction="row" align="baseline" gap="xs">
                <Form.Item
                  {...restField}
                  style={{ marginBottom: 0, flex: 1 }}
                  name={[name, 'variable']}
                  rules={[
                    { required: true, message: 'Enter Variable name' },
                    {
                      pattern: /^\S+(?: \S+)*$/,
                      message: 'Variable name can not start or end with space',
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
                >
                  <Input placeholder="Variable" />
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
          </Flex>
        );
      }}
    </Form.List>
  );
};

export default EnvVarFormList;
