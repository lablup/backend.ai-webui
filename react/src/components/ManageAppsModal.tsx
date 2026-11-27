/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ManageAppsModalMutation } from '../__generated__/ManageAppsModalMutation.graphql';
import { ManageAppsModal_image$key } from '../__generated__/ManageAppsModal_image.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import BAIFormItem from './BAIFormItem';
import { Banner } from '@lablup/ui-common/Banner';
import {
  BAIDynamicList,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAITextInput,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface ManageAppsModalProps extends BAIModalProps {
  open: boolean;
  imageFrgmt: ManageAppsModal_image$key | null;
  onRequestClose: (success: boolean) => void;
}

type ServicePort = { app: string; protocol: string; port: number };

const ManageAppsModal: React.FC<ManageAppsModalProps> = ({
  open,
  imageFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const formRef = React.useRef<FormInstance>(null);

  const image = useFragment(
    graphql`
      fragment ManageAppsModal_image on ImageNode {
        id
        labels {
          key
          value
        }
      }
    `,
    imageFrgmt,
  );

  const [commitModifyImageInput, isInFlightModifyImageInput] =
    useMutation<ManageAppsModalMutation>(graphql`
      mutation ManageAppsModalMutation($id: UUID!, $input: UpdateImageInput!) {
        updateImage(id: $id, input: $input) {
          item {
            id
          }
        }
      }
    `);

  if (!image) return null;

  const getServicePorts = () => {
    let servicePorts: ServicePort[] = [];
    if (image.labels) {
      const servicePortsIdx = _.findIndex(
        image.labels as { key: string; value: string }[],
        (item: { [key: string]: string }) =>
          item !== null && item?.key === 'ai.backend.service-ports',
      );
      if (servicePortsIdx !== -1) {
        const rawValue = image.labels[servicePortsIdx]?.value;
        if (rawValue) {
          servicePorts = rawValue.split(',').map((e: string): ServicePort => {
            const sp = e.split(':');
            return {
              app: sp[0],
              protocol: sp[1],
              port: Number(sp[2]),
            };
          });
        }
      }
    }
    return servicePorts;
  };
  const servicePorts = getServicePorts();

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
          image.labels as { key: string; value: string }[],
          (label) => {
            if (label.key.includes('service-ports')) {
              return { key: label.key, value: values };
            } else {
              return { key: label.key, value: label.value?.toString() || '' };
            }
          },
        );
        // Service ports are stored as image label metadata read by the
        // manager at session-creation time, so a modification applies to
        // newly created sessions immediately without any image reinstall.
        commitModifyImageInput({
          variables: {
            id: toLocalId(image.id),
            input: {
              // An empty label list left the labels untouched under `modify_image`.
              labels: _.isEmpty(labels)
                ? undefined
                : _.fromPairs(_.map(labels, (l) => [l.key, l.value])),
            },
          },
          onCompleted: (_res, errors) => {
            if (errors && errors?.length > 0) {
              const errorMsgList = _.map(errors, (error) => error.message);
              for (const error of errorMsgList) {
                message.error(error);
              }
            } else {
              message.success(t('environment.DescImagePortsModified'));
              onRequestClose(true);
            }
            return;
          },
          onError: (error) => {
            message.error(getErrorMessage(error, t('dialog.ErrorOccurred')));
          },
        });
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      open={open}
      onOk={handleOnClick}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlightModifyImageInput}
      title={t('environment.ManageApps')}
      width={800}
      {...baiModalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Banner
          role="status"
          status="info"
          title={t('environment.AppPortsApplyToNewSessionsOnly')}
        />
        <Form
          ref={formRef}
          layout="vertical"
          autoComplete="off"
          initialValues={{ apps: servicePorts }}
        >
          <Form.List name="apps">
            {(fields, { add, remove }) => (
              <BAIDynamicList
                items={fields}
                addButton={{
                  onClick: () => add(),
                  label: t('environment.AddApp'),
                }}
                onRemove={(field) => remove(field.name)}
                disabled={!image}
                columns={[
                  {
                    key: 'app',
                    header: t('environment.AppName'),
                    render: ({ key: _key, ...field }, index) => (
                      <BAIFormItem
                        {...field}
                        name={[field.name, 'app']}
                        style={{ marginBottom: 0 }}
                        rules={[
                          {
                            required: true,
                            message: t('environment.AppNameMustNotBeEmpty'),
                          },
                        ]}
                        validateTrigger={['onChange', 'onBlur']}
                      >
                        <BAITextInput
                          aria-label={`${t('environment.AppName')} ${index + 1}`}
                          placeholder={t('general.Example', {
                            value: 'jupyter',
                          })}
                        />
                      </BAIFormItem>
                    ),
                  },
                  {
                    key: 'protocol',
                    header: t('environment.Protocol'),
                    render: ({ key: _key, ...field }, index) => (
                      <BAIFormItem
                        {...field}
                        name={[field.name, 'protocol']}
                        style={{ marginBottom: 0 }}
                        rules={[
                          {
                            pattern: /^(http|tcp|pty|preopen)$/,
                            required: true,
                            message: t(
                              'environment.ProtocolMustBeOneOfSupported',
                            ),
                          },
                        ]}
                        validateTrigger={['onChange', 'onBlur']}
                      >
                        <BAITextInput
                          aria-label={`${t('environment.Protocol')} ${index + 1}`}
                          placeholder={t('general.Example', { value: 'http' })}
                        />
                      </BAIFormItem>
                    ),
                  },
                  {
                    key: 'port',
                    header: t('environment.Port'),
                    render: ({ key: _key, ...field }, index) => (
                      <BAIFormItem
                        {...field}
                        name={[field.name, 'port']}
                        style={{ marginBottom: 0 }}
                        rules={[
                          {
                            validator: (_rules, rawValue) => {
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
                            validator: (_rule, value) => {
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
                        validateTrigger={['onChange', 'onBlur']}
                      >
                        <BAITextInput
                          aria-label={`${t('environment.Port')} ${index + 1}`}
                          placeholder={t('general.Example', { value: '8888' })}
                        />
                      </BAIFormItem>
                    ),
                  },
                ]}
              />
            )}
          </Form.List>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default ManageAppsModal;
