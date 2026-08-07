/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ManageAppsModalMutation } from '../__generated__/ManageAppsModalMutation.graphql';
import { ManageAppsModal_image$key } from '../__generated__/ManageAppsModal_image.graphql';
import { App } from '../app-shim';
import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { Form, FormInstance } from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Trash, PlusIcon } from 'lucide-react';
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
  const formRef = React.useRef<FormInstance>(null);

  const image = useFragment(
    graphql`
      fragment ManageAppsModal_image on ImageNode {
        labels {
          key
          value
        }
        registry
        name @deprecatedSince(version: "24.12.0")
        namespace @since(version: "24.12.0")
        architecture
        tag
      }
    `,
    imageFrgmt,
  );

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
            target: `${image?.registry}/${image?.name ?? image.namespace}:${image?.tag}`,
            architecture: image?.architecture,
            props: {
              labels: labels,
              resource_limits: undefined,
            },
          },
          onCompleted: (res, errors) => {
            if (!res?.modify_image?.ok) {
              message.error(res?.modify_image?.msg);
              return;
            }
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
          onError: () => {
            message.error(t('dialog.ErrorOccurred'));
          },
        });
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      destroyOnHidden
      open={open}
      onOk={handleOnClick}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlightModifyImageInput}
      title={t('environment.ManageApps')}
      {...baiModalProps}
    >
      {/* antd Alert type="info" -> Astryx Banner status="info"; `showIcon` is
          dropped (Banner shows its icon by default — MAPPING.md §4). The
          marginBottom token becomes BAIFlex column gaps. */}
      <BAIFlex direction="column" align="stretch" gap="md">
        <Banner
          status="info"
          title={t('environment.AppPortsApplyToNewSessionsOnly')}
        />
        <BAIFlex direction="row" style={{ width: '100%' }}>
          <BAIFlex style={{ width: '32%' }}>
            <Text weight="semibold">{t('environment.AppName')}</Text>
          </BAIFlex>
          <BAIFlex style={{ width: '32%' }}>
            <Text weight="semibold">{t('environment.Protocol')}</Text>
          </BAIFlex>
          <BAIFlex style={{ width: '32%' }}>
            <Text weight="semibold">{t('environment.Port')}</Text>
          </BAIFlex>
          <BAIFlex></BAIFlex>
        </BAIFlex>
      </BAIFlex>
      <Form
        ref={formRef}
        layout="vertical"
        autoComplete="off"
        initialValues={{ apps: servicePorts }}
      >
        <BAIFlex direction="column">
          <Form.List name="apps">
            {(fields, { add, remove }) => (
              <BAIFlex direction="column" style={{ width: '100%' }}>
                {_.map(fields, (field, index) => (
                  <BAIFormItem>
                    <BAIFlex direction="row" key={field.key} gap={'xs'}>
                      <BAIFormItem
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
                        <AstryxFormTextInput
                          label={t('environment.AppName')}
                          placeholder={t('environment.AppName')}
                        />
                      </BAIFormItem>
                      <BAIFormItem
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
                        <AstryxFormTextInput
                          label={t('environment.Protocol')}
                          placeholder={t('environment.Protocol')}
                        />
                      </BAIFormItem>
                      <BAIFormItem
                        {...field}
                        name={[field.name, 'port']}
                        noStyle
                        required
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
                      >
                        <AstryxFormTextInput
                          label={t('environment.Port')}
                          placeholder={t('environment.Port')}
                        />
                      </BAIFormItem>
                      {/* PILOT-DECISION: antd `type="text" danger` -> ghost
                          IconButton; the red tint is dropped (closed variant
                          enum, P5/P11). The first-row marginTop nudge against
                          antd's label offset is obsolete and dropped. */}
                      <IconButton
                        variant="ghost"
                        label={t('button.Delete')}
                        tooltip={t('button.Delete')}
                        onClick={() => remove(field.name)}
                        icon={<Trash size="1em" />}
                      />
                    </BAIFlex>
                  </BAIFormItem>
                ))}
                {/* PILOT-DECISION: antd `type="dashed"` has no Astryx
                    equivalent -> `variant="secondary"` (MAPPING.md §3.3);
                    `block` -> width="100%". */}
                <Button
                  variant="secondary"
                  onClick={() => add()}
                  width="100%"
                  icon={<PlusIcon />}
                  isDisabled={!image}
                  label={t('button.Add')}
                />
              </BAIFlex>
            )}
          </Form.List>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default ManageAppsModal;
