import BAIModal, { BAIModalProps } from './BAIModal';
import { useWebComponentInfo } from './DefaultProviders';
import Flex from './Flex';
import { ImageFromEnvironment } from './ManageImageResourceLimitModal';
import { ManageAppsModalMutation } from './__generated__/ManageAppsModalMutation.graphql';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Input,
  Button,
  Form,
  message,
  Typography,
  App,
  FormInstance,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation } from 'react-relay';

const ManageAppsModal: React.FC<BAIModalProps> = ({ ...baiModalProps }) => {
  const { t } = useTranslation();
  const formRef = React.useRef<FormInstance>(null);
  const app = App.useApp();

  const { token } = theme.useToken();

  const {
    parsedValue: { open, image, servicePorts },
    dispatchEvent,
  } = useWebComponentInfo<{
    open?: boolean;
    image: NonNullable<ImageFromEnvironment>; //TODO: This is not 100% same with Image type
    servicePorts?: any;
  }>();

  const [commitModifyImageInput, isInFlightModifyImageInput] =
    useMutation<ManageAppsModalMutation>(graphql`
      mutation ManageAppsModalMutation(
        $target: String!
        $architecture: String
        $props: ModifyImageInput!
      ) {
        modify_image(
          target: $target
          architecture: $architecture
          props: $props
        ) {
          ok
          msg
        }
      }
    `);

  const handleOnClick = () => {
    formRef.current
      ?.validateFields()
      .then(() => {
        const values = formRef.current
          ?.getFieldValue('apps')
          .map((item: { app: string; protocol: string; port: number }) => {
            return `${item.app}:${item.protocol}:${item.port}`;
          })
          .join(',');

        const labels = _.map(
          image.labels as { [key in string]: string },
          (value, key) => {
            if (key.includes('service-ports')) {
              return { key: key, value: values };
            } else {
              return { key: key, value: value?.toString() || '' };
            }
          },
        );

        const commitRequest = () =>
          commitModifyImageInput({
            variables: {
              target: `${image.registry}/${image.name}:${image.tag}`,
              architecture: image.architecture,
              props: {
                labels: labels,
                resource_limits: null,
              },
            },
            onCompleted: (res, err) => {
              if (err) {
                message.error(t('dialog.ErrorOccurred'));
              } else {
                message.success(t('environment.DescImagePortsModified'));
                dispatchEvent('ok', null);
              }
              return;
            },
            onError: (err) => {
              message.error(t('dialog.ErrorOccurred'));
            },
          });

        if (image.installed) {
          app.modal.confirm({
            title: 'Image reinstallation required',
            content: (
              <>
                <Trans
                  i18nKey={
                    'envrionment.ModifyImageResourceLimitReinstallRequired'
                  }
                />
              </>
            ),
            onOk: commitRequest,
            getContainer: () => document.body,
            closable: true,
          });
        } else {
          commitRequest();
        }
      })
      .catch((e) => {});
  };

  return (
    <BAIModal
      destroyOnClose
      open={open}
      onOk={handleOnClick}
      onCancel={() => dispatchEvent('cancel', null)}
      confirmLoading={isInFlightModifyImageInput}
      title={t('environment.ManageApps')}
      {...baiModalProps}
    >
      <Flex
        direction="row"
        style={{ width: '100%', marginBottom: token.marginXS }}
      >
        <Typography.Text strong style={{ width: '32%' }}>
          {t('environment.AppName')}
        </Typography.Text>
        <Typography.Text strong style={{ width: '32%' }}>
          {t('environment.Protocol')}
        </Typography.Text>
        <Typography.Text strong style={{ width: '32%' }}>
          {t('environment.Port')}
        </Typography.Text>
        <Flex></Flex>
      </Flex>
      <Form
        ref={formRef}
        layout="vertical"
        autoComplete="off"
        initialValues={{ apps: servicePorts }}
        requiredMark={false}
      >
        <Flex direction="column">
          <Form.List name="apps">
            {(fields, { add, remove }) => (
              <Flex direction="column" style={{ width: '100%' }}>
                {_.map(fields, (field, index) => (
                  <Form.Item>
                    <Flex direction="row" key={field.key} gap={'xs'}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'app']}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: t('environment.AppNameMustNotBeEmpty'),
                          },
                        ]}
                      >
                        <Input placeholder={t('environment.AppName')} />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'protocol']}
                        noStyle
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
                        <Input placeholder={t('environment.Protocol')} />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'port']}
                        noStyle
                        rules={[
                          {
                            validator: (rules, rawValue) => {
                              const value =
                                _.isUndefined(rawValue) || rawValue === ''
                                  ? NaN
                                  : _.toNumber(rawValue);
                              if (
                                _.isNaN(value) ||
                                value < 0 ||
                                value >= 65535
                              ) {
                                return Promise.reject(
                                  t('environment.PortMustBeInRange'),
                                );
                              } else if (
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
                          {
                            validator: (rule, value) => {
                              const apps =
                                formRef.current?.getFieldValue('apps');
                              if (
                                _.isString(value) &&
                                value.length > 0 &&
                                apps.some(
                                  (item: any, itemIndex: number) =>
                                    itemIndex !== index && item?.port === value,
                                )
                              ) {
                                return Promise.reject(
                                  t('environment.PortMustBeUnique'),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input placeholder={t('environment.Port')} />
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
                  </Form.Item>
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
