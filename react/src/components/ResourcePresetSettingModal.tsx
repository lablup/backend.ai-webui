/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourcePresetSettingModalCreateMutation } from '../__generated__/ResourcePresetSettingModalCreateMutation.graphql';
import { ResourcePresetSettingModalFragment$key } from '../__generated__/ResourcePresetSettingModalFragment.graphql';
import { ResourcePresetSettingModalModifyMutation } from '../__generated__/ResourcePresetSettingModalModifyMutation.graphql';
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { convertToBinaryUnit } from '../helper';
import { reasonMessage } from '../helper/mutationError';
import { useResourceSlots, useResourceSlotsDetails } from '../hooks/backendai';
import BAIFormItem from './BAIFormItem';
import {
  AstryxFormNumberInput,
  AstryxFormTextInput,
} from './astryxFormControls';
import {
  BAIDynamicUnitInputNumber,
  BAIModal,
  BAIModalProps,
  BAIResourceGroupSelect,
  BAIResourceGroupSelectProps,
  BAISelect,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Fragment, Suspense, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import { type PayloadError } from 'relay-runtime';

/**
 * Resource groups a preset may be bound to, listed at ADMIN scope — no project
 * involved. A resource preset has no project dimension in the manager
 * (`resource_presets` has no group column; its only relation is to one
 * `ScalingGroupRow`, and a null `scaling_group_name` means the preset is
 * global), so the options must not be narrowed by any project.
 * `BAIResourceGroupSelect` queries `scaling_groups` unscoped, which is
 * exactly that list. Spreading `props` keeps the value/onChange pair
 * `BAIFormItem` injects into its direct child from being swallowed by the
 * Suspense boundary.
 */
const ResourceGroupSelect: React.FC<BAIResourceGroupSelectProps> = (props) => {
  'use memo';
  return (
    <Suspense fallback={<BAISelect {...props} loading disabled />}>
      <BAIResourceGroupSelect {...props} />
    </Suspense>
  );
};

interface ResourcePresetSettingModalProps extends BAIModalProps {
  resourcePresetFrgmt?: ResourcePresetSettingModalFragment$key | null;
  onRequestClose: (success: boolean) => void;
}

const ResourcePresetSettingModal: React.FC<ResourcePresetSettingModalProps> = ({
  resourcePresetFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);

  const [resourceSlots] = useResourceSlots();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const resourcePreset = useFragment(
    graphql`
      fragment ResourcePresetSettingModalFragment on ResourcePreset {
        id
        name
        resource_slots
        shared_memory
        scaling_group_name
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
        $id: UUID!
        $props: ModifyResourcePresetInput!
      ) {
        modify_resource_preset(id: $id, props: $props) {
          ok
          msg
        }
      }
    `);

  const handleMutationResult = (
    result: { ok?: boolean | null; msg?: string | null } | null | undefined,
    errors: PayloadError[] | null,
    successMessage: string,
  ) => {
    if (!result?.ok) {
      message.error(result?.msg);
      onRequestClose(false);
    } else if (errors && errors.length > 0) {
      message.error(reasonMessage(errors));
      onRequestClose(false);
    } else {
      message.success(successMessage);
      onRequestClose(true);
    }
  };
  const handleMutationError = (err: Error) => {
    message.error(err?.message);
  };

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

        const props = {
          resource_slots: JSON.stringify(resourceSlots || {}),
          shared_memory: values?.shared_memory
            ? convertToBinaryUnit(values?.shared_memory, '', 0)?.numberFixed
            : null,
          scaling_group_name: values?.scaling_group_name || null,
        };
        if (resourcePreset?.id) {
          commitModifyResourcePreset({
            variables: { id: resourcePreset.id, props },
            onCompleted: (res, errors) =>
              handleMutationResult(
                res?.modify_resource_preset,
                errors,
                t('resourcePreset.Updated'),
              ),
            onError: handleMutationError,
          });
        } else {
          commitCreateResourcePreset({
            variables: { name: values?.name, props },
            onCompleted: (res, errors) =>
              handleMutationResult(
                res?.create_resource_preset,
                errors,
                t('resourcePreset.Created'),
              ),
            onError: handleMutationError,
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
      destroyOnHidden
      confirmLoading={
        isInFlightCommitCreateResourcePreset ||
        isInFlightCommitModifyResourcePreset
      }
      okText={resourcePreset ? t('button.Save') : t('button.Create')}
    >
      <Form
        ref={formRef}
        layout="vertical"
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
        <BAIFormItem
          label={t('resourcePreset.PresetName')}
          name="name"
          rules={[
            { required: true, message: t('resourcePreset.NoPresetName') },
            {
              pattern: /^[a-zA-Z0-9._-]*$/,
              message: t('data.AllowsLettersNumbersAnd-_Dot'),
            },
          ]}
        >
          <AstryxFormTextInput
            label={t('resourcePreset.PresetName')}
            disabled={!!resourcePreset}
          />
        </BAIFormItem>
        <ErrorBoundary
          fallbackRender={() => (
            <BAIFormItem
              label={t('general.ResourceGroup')}
              name="scaling_group_name"
            >
              <BAISelect disabled />
            </BAIFormItem>
          )}
        >
          {/* Optional by design: a preset with no resource group is the
              manager's "global" preset, so the field stays clearable. */}
          <BAIFormItem
            label={t('general.ResourceGroup')}
            name="scaling_group_name"
          >
            <ResourceGroupSelect allowClear popupMatchSelectWidth={false} />
          </BAIFormItem>
        </ErrorBoundary>
        <BAIFormItem
          label={t('resourcePreset.ResourcePreset')}
          required
          layout="vertical"
        >
          {_.map(
            _.chunk(_.keys(resourceSlots), 2),
            (resourceSlotKeys, index) => (
              <Fragment key={index}>
                {_.map(resourceSlotKeys, (resourceSlotKey) => (
                  <BAIFormItem
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
                      <BAIDynamicUnitInputNumber
                        style={{ width: '100%' }}
                        defaultUnit="g"
                      />
                    ) : (
                      // PILOT-DECISION: antd InputNumber `stringMode`
                      // (big-number safety) has no NumberInput equivalent
                      // (MAPPING.md §3.17) and is dropped — slot counts stay
                      // well inside float precision. `suffix` -> `units`.
                      <AstryxFormNumberInput
                        label={
                          _.get(mergedResourceSlots, resourceSlotKey)
                            ?.description || resourceSlotKey
                        }
                        min={resourceSlotKey === 'cpu' ? 1 : 0}
                        step={_.includes(resourceSlotKey, '.shares') ? 0.1 : 1}
                        units={
                          _.get(mergedResourceSlots, resourceSlotKey)
                            ?.display_unit
                        }
                      />
                    )}
                  </BAIFormItem>
                ))}
              </Fragment>
            ),
          )}
          <BAIFormItem
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
            <BAIDynamicUnitInputNumber
              max="7.999p"
              style={{ width: '100%' }}
              defaultUnit="g"
            />
          </BAIFormItem>
        </BAIFormItem>
      </Form>
    </BAIModal>
  );
};

export default ResourcePresetSettingModal;
