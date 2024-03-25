import { useSuspendedBackendaiClient } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import { useWebComponentInfo } from './DefaultProviders';
import Flex from './Flex';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Input, Button, Form, message, Typography } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ManageAppsModal: React.FC<BAIModalProps> = ({ ...baiModalProps }) => {
  const [open, setOpen] = useState<boolean>(true);
  const [validateDetail, setValidateDetail] = useState<string>('');
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { value, dispatchEvent } = useWebComponentInfo();
  const baiClient = useSuspendedBackendaiClient();

  let parsedValue: {
    image: any;
    servicePorts: any;
  };
  try {
    parsedValue = JSON.parse(value || '');
  } catch (error) {
    parsedValue = {
      image: {},
      servicePorts: [],
    };
  }
  const { image, servicePorts } = parsedValue;

  const handleOnclick = async () => {
    try {
      await form.validateFields();

      const values = form
        .getFieldValue('apps')
        .map((item: { app: string; protocol: string; port: number }) => {
          return `${item.app}:${item.protocol}:${item.port}`;
        })
        .join(',');

      const { result } = await baiClient.image.modifyLabel(
        image.registry,
        image.name,
        image.tag,
        'service-ports',
        values,
      );

      if (result === 'ok') {
        message.success(t('environment.DescServicePortModified'));
        dispatchEvent('ok', null);
        return;
      }
      message.error(t('dialog.ErrorOccurred'));
    } catch (info: any) {
      setValidateDetail(info.errorFields[0].errors[0]);
      return;
    }
  };

  return (
    <BAIModal
      destroyOnClose
      open={open}
      onOk={handleOnclick}
      onCancel={() => setOpen(false)}
      afterClose={() => dispatchEvent('cancel', null)}
      centered
      title={t('environment.ManageApps')}
      {...baiModalProps}
      footer={(_, { OkBtn, CancelBtn }) => (
        <Flex justify="between">
          <Typography.Text type="danger">{validateDetail}</Typography.Text>
          <Flex gap={'xs'}>
            <CancelBtn />
            <OkBtn />
          </Flex>
        </Flex>
      )}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        initialValues={{ apps: servicePorts }}
        requiredMark={false}
        onChange={() => {
          setValidateDetail('');
        }}
      >
        <Flex direction="column">
          <Form.List name="apps">
            {(fields, { add, remove }) => (
              <Flex direction="column" style={{ width: '100%' }}>
                {fields.map((field, index) => (
                  <Flex
                    direction="row"
                    key={field.key}
                    gap={'xs'}
                    align={index === 0 ? undefined : 'start'}
                  >
                    <Form.Item
                      label={index === 0 && t('environment.AppName')}
                      {...field}
                      name={[field.name, 'app']}
                      help=""
                      rules={[
                        {
                          required: true,
                          message: t('environment.AppNameMustNotBeEmpty'),
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={index === 0 && t('environment.Protocol')}
                      {...field}
                      name={[field.name, 'protocol']}
                      help=""
                      rules={[
                        {
                          pattern: /^(http|tcp|pty|preopen)$/,
                          required: true,
                          message: t(
                            'environment.ProtocolMustBeOneOfSupported',
                          ),
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={index === 0 && t('environment.Port')}
                      {...field}
                      name={[field.name, 'port']}
                      help=""
                      rules={[
                        {
                          required: true,
                          validator: (_, value) => {
                            if (
                              isNaN(Number(value)) ||
                              value < 0 ||
                              value >= 65535
                            ) {
                              return Promise.reject(
                                t('environment.PortMustBeInRange'),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                        {
                          validator: (_, value) => {
                            const apps = form.getFieldValue('apps');
                            if (
                              apps.some(
                                (item: any, itemIndex: number) =>
                                  itemIndex !== index && item?.port === value,
                              )
                            ) {
                              return Promise.reject(
                                t('environment.PortMustBeUnique'),
                              );
                            }
                            if (
                              [2000, 2001, 2002, 2003, 2200, 7681].includes(
                                Number(value),
                              )
                            ) {
                              return Promise.reject(
                                t('environment.PortReservedForInternalUse'),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      onClick={() => remove(field.name)}
                      style={
                        index === 0
                          ? { width: '10%', marginTop: 8 }
                          : { width: '10%' }
                      }
                      icon={<DeleteOutlined />}
                    />
                  </Flex>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  {t('button.Add')}
                </Button>
              </Flex>
            )}
          </Form.List>
        </Flex>
      </Form>
    </BAIModal>
  );
};

export default ManageAppsModal;
