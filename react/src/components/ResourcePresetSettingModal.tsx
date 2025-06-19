import {
  CreateResourcePresetInput,
  ResourcePresetSettingModalCreateMutation,
} from '../__generated__/ResourcePresetSettingModalCreateMutation.graphql';
import { ResourcePresetSettingModalFragment$key } from '../__generated__/ResourcePresetSettingModalFragment.graphql';
import {
  ModifyResourcePresetInput,
  ResourcePresetSettingModalModifyByIdMutation,
} from '../__generated__/ResourcePresetSettingModalModifyByIdMutation.graphql';
import { ResourcePresetSettingModalModifyByNameMutation } from '../__generated__/ResourcePresetSettingModalModifyByNameMutation.graphql';
import { convertToBinaryUnit } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useResourceSlots, useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAIModal, { BAIModalProps } from './BAIModal';
import DynamicUnitInputNumber from './DynamicUnitInputNumber';
import ResourceGroupSelect from './ResourceGroupSelect';
import { App, Col, Form, FormInstance, Input, InputNumber, Row } from 'antd';
import _ from 'lodash';
import React, { Fragment, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

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
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();

  const [resourceSlots] = useResourceSlots();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const resourcePreset = useFragment(
    graphql`
      fragment ResourcePresetSettingModalFragment on ResourcePreset {
        id @since(version: "25.4.0")
        name
        resource_slots
        shared_memory
        scaling_group_name @since(version: "25.4.0")
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

  const [
    commitModifyResourcePresetByName,
    isInFlightCommitModifyResourcePresetByName,
  ] = useMutation<ResourcePresetSettingModalModifyByNameMutation>(graphql`
    mutation ResourcePresetSettingModalModifyByNameMutation(
      $name: String!
      $props: ModifyResourcePresetInput!
    ) {
      modify_resource_preset(name: $name, props: $props) {
        ok
        msg
      }
    }
  `);
  const [
    commitModifyResourcePresetById,
    isInFlightCommitModifyResourcePresetById,
  ] = useMutation<ResourcePresetSettingModalModifyByIdMutation>(graphql`
    mutation ResourcePresetSettingModalModifyByIdMutation(
      $id: UUID!
      $props: ModifyResourcePresetInput!
    ) {
      modify_resource_preset(id: $id, props: $props) {
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
            if (value && _.includes(key, 'mem')) {
              return convertToBinaryUnit(value, '', 0)?.numberFixed;
            }
            return value;
          },
        );

        resourceSlots = _.pickBy(resourceSlots, _.negate(_.isNil));

        const props: CreateResourcePresetInput | ModifyResourcePresetInput = {
          resource_slots: JSON.stringify(resourceSlots || {}),
          shared_memory: values?.shared_memory
            ? convertToBinaryUnit(values?.shared_memory, '', 0)?.numberFixed
            : null,
        };
        if (baiClient?.supports('resource-presets-per-resource-group')) {
          props.scaling_group_name = values?.scaling_group_name || null;
        }
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
                  message.error(err);
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
          if (resourcePreset.id) {
            commitModifyResourcePresetById({
              variables: {
                id: resourcePreset.id,
                props: props as ModifyResourcePresetInput,
              },
              onCompleted: (res, errors) => {
                if (!res?.modify_resource_preset?.ok) {
                  message.error(res?.modify_resource_preset?.msg);
                  onRequestClose(false);
                } else if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (err) => err?.message);
                  _.forEach(errorMsgList, (err) => {
                    message.error(err);
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
          } else {
            // TODO: if support for "name" is discontinued after version 25.4.0, this block should be removed
            commitModifyResourcePresetByName({
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
                    message.error(err);
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
        isInFlightCommitModifyResourcePresetByName ||
        isInFlightCommitModifyResourcePresetById
      }
      okText={resourcePreset ? t('button.Save') : t('button.Create')}
    >
      <Form
        ref={formRef}
        layout="vertical"
        // requiredMark="optional"
        preserve={false}
        initialValues={
          resourcePreset
            ? {
                ...resourcePreset,
                resource_slots:
                  _.mapValues(
                    JSON.parse(resourcePreset?.resource_slots || '{}'),
                    (value, key) =>
                      _.includes(key, 'mem')
                        ? convertToBinaryUnit(
                            value,
                            value === '0' ? 'g' : 'auto',
                          )?.value
                        : value,
                  ) || {},
                shared_memory: resourcePreset?.shared_memory
                  ? convertToBinaryUnit(
                      resourcePreset?.shared_memory,
                      resourcePreset?.shared_memory === '0' ? 'g' : 'auto',
                    )?.value
                  : null,
              }
            : {
                resource_slots: {
                  mem: null,
                },
                shared_memory: null,
              }
        }
      >
        <Form.Item
          label={t('resourcePreset.PresetName')}
          name="name"
          rules={[
            { required: true, message: t('resourcePreset.NoPresetName') },
            {
              pattern: /^[a-zA-Z0-9._-]*$/,
              message: t('data.AllowsLettersNumbersAnd-_Dot'),
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
        {baiClient?.supports('resource-presets-per-resource-group') && (
          <Form.Item
            label={t('general.ResourceGroup')}
            name="scaling_group_name"
          >
            <ResourceGroupSelect
              projectName={currentProject.name}
              allowClear
              popupMatchSelectWidth={false}
            />
          </Form.Item>
        )}
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
                          _.get(mergedResourceSlots, resourceSlotKey)
                            ?.description || resourceSlotKey
                        }
                        name={['resource_slots', resourceSlotKey]}
                        rules={[
                          _.includes(['cpu', 'mem'], resourceSlotKey)
                            ? {
                                required: true,
                                message: t('data.explorer.ValueRequired'),
                              }
                            : {},
                          {
                            validator(__, value) {
                              if (
                                value &&
                                _.includes(resourceSlotKey, 'mem') &&
                                // @ts-ignore
                                convertToBinaryUnit(value, 'p').number >
                                  // @ts-ignore
                                  convertToBinaryUnit('300p', 'p').number
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
                            stringMode
                            min={resourceSlotKey === 'cpu' ? 1 : 0}
                            step={
                              _.includes(resourceSlotKey, '.shares') ? 0.1 : 1
                            }
                            addonAfter={
                              _.get(mergedResourceSlots, resourceSlotKey)
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
                dependencies={[['resource_slots', 'mem']]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(__, value) {
                      if (
                        value &&
                        getFieldValue('resource_slots')?.mem &&
                        (convertToBinaryUnit(
                          getFieldValue('resource_slots')?.mem,
                          '',
                        )?.number ?? 0) <
                          (convertToBinaryUnit(value, '')?.number ?? 0)
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
                <DynamicUnitInputNumber max="7.999p" />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default ResourcePresetSettingModal;
