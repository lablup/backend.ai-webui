import { iSizeToSize } from '../helper';
import { useResourceSlots, useResourceSlotsDetails } from '../hooks/backendai';
import BAIModal, { BAIModalProps } from './BAIModal';
import DynamicUnitInputNumber from './DynamicUnitInputNumber';
import {
  CreateResourcePresetInput,
  ResourcePresetSettingModalCreateMutation,
} from './__generated__/ResourcePresetSettingModalCreateMutation.graphql';
import { ResourcePresetSettingModalFragment$key } from './__generated__/ResourcePresetSettingModalFragment.graphql';
import {
  ModifyResourcePresetInput,
  ResourcePresetSettingModalModifyMutation,
} from './__generated__/ResourcePresetSettingModalModifyMutation.graphql';
import { App, Col, Form, FormInstance, Input, InputNumber, Row } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { Fragment, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

interface ResourcePresetSettingModalProps extends BAIModalProps {
  resourcePresetFrgmt?: ResourcePresetSettingModalFragment$key | null;
  existingResourcePresetNames?: Array<string>;
  onRequestClose: (success: boolean) => void;
}

const ResourcePresetSettingModal: React.FC<ResourcePresetSettingModalProps> = ({
  resourcePresetFrgmt,
  existingResourcePresetNames,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);

  const [resourceSlots] = useResourceSlots();
  const [resourceSlotsDetails] = useResourceSlotsDetails();

  const resourcePreset = useFragment(
    graphql`
      fragment ResourcePresetSettingModalFragment on ResourcePreset {
        name
        resource_slots
        shared_memory
      }
    `,
    resourcePresetFrgmt,
  );

  const [commitCreateResourcePreset, isInFlightCommitCreateResourcePreset] =
    useMutation<ResourcePresetSettingModalCreateMutation>(graphql`
      mutation ResourcePresetSettingModalCreateMutation(
        $name: String!
        $props: CreateResourcePresetInput!
      ) {
        create_resource_preset(name: $name, props: $props) {
          ok
          msg
        }
      }
    `);

  const [commitModifyResourcePreset, isInFlightCommitModifyResourcePreset] =
    useMutation<ResourcePresetSettingModalModifyMutation>(graphql`
      mutation ResourcePresetSettingModalModifyMutation(
        $name: String!
        $props: ModifyResourcePresetInput!
      ) {
        modify_resource_preset(name: $name, props: $props) {
          ok
          msg
        }
      }
    `);

  const handleOk = () => {
    return formRef.current
      ?.validateFields()
      .then((values) => {
        let resourceSlots = _.mapValues(
          values?.resource_slots,
          (value, key) => {
            if (_.includes(key, 'mem')) {
              return iSizeToSize(value, 'b', 0)?.numberFixed;
            }
            return value;
          },
        );
        resourceSlots = _.pickBy(resourceSlots, _.negate(_.isUndefined));

        const props: CreateResourcePresetInput | ModifyResourcePresetInput = {
          resource_slots: JSON.stringify(resourceSlots || {}),
          shared_memory: values?.shared_memory
            ? iSizeToSize(values?.shared_memory, 'b', 0)?.numberFixed
            : null,
        };
        if (_.isEmpty(resourcePreset)) {
          commitCreateResourcePreset({
            variables: {
              name: values?.name,
              props: props as CreateResourcePresetInput,
            },
            onCompleted: (res, errors) => {
              if (!res?.create_resource_preset?.ok) {
                message.error(res?.create_resource_preset?.msg);
                onRequestClose(false);
              } else if (errors && errors?.length > 0) {
                const errorMsgList = _.map(errors, (err) => err.message);
                _.forEach(errorMsgList, (err) => {
                  message.error(err, 2.5);
                });
                onRequestClose(false);
              } else {
                message.success(t('resourcePreset.Created'));
                onRequestClose(true);
              }
            },
            onError(err) {
              message.error(err?.message);
            },
          });
        } else {
          commitModifyResourcePreset({
            variables: {
              name: values?.name,
              props: props as ModifyResourcePresetInput,
            },
            onCompleted: (res, errors) => {
              if (!res?.modify_resource_preset?.ok) {
                message.error(res?.modify_resource_preset?.msg);
                onRequestClose(false);
              } else if (errors && errors?.length > 0) {
                const errorMsgList = _.map(errors, (err) => err?.message);
                _.forEach(errorMsgList, (err) => {
                  message.error(err, 2.5);
                });
                onRequestClose(false);
              } else {
                message.success(t('resourcePreset.Updated'));
                onRequestClose(true);
              }
            },
            onError(err) {
              message.error(err?.message);
            },
          });
        }
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      {...baiModalProps}
      title={
        resourcePreset
          ? t('resourcePreset.ModifyResourcePreset')
          : t('resourcePreset.CreateResourcePreset')
      }
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      destroyOnClose
      confirmLoading={
        isInFlightCommitCreateResourcePreset ||
        isInFlightCommitModifyResourcePreset
      }
    >
      <Form
        ref={formRef}
        layout="vertical"
        // requiredMark="optional"
        preserve={false}
        initialValues={
          resourcePreset
            ? {
                name: resourcePreset.name,
                resource_slots:
                  _.mapValues(
                    JSON.parse(resourcePreset?.resource_slots || '{}'),
                    (value, key) =>
                      _.includes(key, 'mem')
                        ? iSizeToSize(value + 'b', 'g')?.numberUnit
                        : value,
                  ) || {},
                shared_memory: resourcePreset?.shared_memory
                  ? iSizeToSize(resourcePreset?.shared_memory + 'b', 'g')
                      ?.numberUnit
                  : null,
              }
            : {}
        }
      >
        <Form.Item
          label={t('resourcePreset.PresetName')}
          name="name"
          rules={[
            { required: true, message: t('resourcePreset.NoPresetName') },
            {
              pattern: /^[a-zA-Z0-9._-]*$/,
              message: t('data.Allowslettersnumbersand-_dot'),
            },
            {
              validator(_, value) {
                if (
                  !resourcePreset &&
                  existingResourcePresetNames?.includes(value)
                ) {
                  return Promise.reject(
                    new Error(t('resourcePreset.PresetNameAlreadyExists')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input disabled={!!resourcePreset} />
        </Form.Item>
        <Form.Item label={t('resourcePreset.ResourcePreset')}>
          <Row gutter={16}>
            {_.map(
              _.chunk(_.keys(resourceSlots), 2),
              (resourceSlotKeys, index) => (
                <Fragment key={index}>
                  {_.map(resourceSlotKeys, (resourceSlotKey) => (
                    <Col
                      span={12}
                      key={resourceSlotKey}
                      style={{ alignSelf: 'end' }}
                    >
                      <Form.Item
                        label={
                          _.get(resourceSlotsDetails, resourceSlotKey)
                            ?.description || resourceSlotKey
                        }
                        name={['resource_slots', resourceSlotKey]}
                        rules={[
                          {
                            validator(__, value) {
                              if (
                                value &&
                                _.includes(resourceSlotKey, 'mem') &&
                                // @ts-ignore
                                iSizeToSize(value, 'p').number >
                                  // @ts-ignore
                                  iSizeToSize('300p', 'p').number
                              ) {
                                return Promise.reject(
                                  new Error(
                                    'Memory size should be less than 300 PiB',
                                  ),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        {_.includes(resourceSlotKey, 'mem') ? (
                          <DynamicUnitInputNumber />
                        ) : (
                          <InputNumber
                            min={resourceSlotKey === 'cpu' ? 1 : 0}
                            step={
                              _.includes(resourceSlotKey, '.shares') ? 0.1 : 1
                            }
                            addonAfter={
                              _.get(resourceSlotsDetails, resourceSlotKey)
                                ?.display_unit
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>
                  ))}
                </Fragment>
              ),
            )}
            <Col span={12} style={{ alignSelf: 'end' }}>
              <Form.Item
                label={t('resourcePreset.SharedMemory')}
                name="shared_memory"
                dependencies={['resource_slots', 'mem']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(__, value) {
                      if (
                        value &&
                        getFieldValue('resource_slots')?.mem &&
                        (iSizeToSize(getFieldValue('resource_slots')?.mem, 'b')
                          ?.number ?? 0) <
                          (iSizeToSize(value, 'b')?.number ?? 0)
                      ) {
                        return Promise.reject(
                          t('resourcePreset.MemoryShouldBeLargerThanSHMEM'),
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DynamicUnitInputNumber />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default ResourcePresetSettingModal;
