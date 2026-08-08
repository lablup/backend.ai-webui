/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ManageImageResourceLimitModalMutation,
  ResourceLimitInput,
} from '../__generated__/ManageImageResourceLimitModalMutation.graphql';
import { ManageImageResourceLimitModal_image$key } from '../__generated__/ManageImageResourceLimitModal_image.graphql';
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { compareNumberWithUnits } from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import BAIFormItem from './BAIFormItem';
import { AstryxFormNumberInput } from './astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
import { Grid } from '@astryxdesign/core/Grid';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIDynamicUnitInputNumber,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

const DEFAULT_MIN_MEMORY = '1g'; // Default minimum memory value for resource limits
const DEFAULT_MIN_CPU = 1; // Default minimum CPU value for resource limits
const DEFAULT_MIN_OTHER = 0; // Default minimum value for other resource limits (e.g., Accelerators like GPUs)
interface ManageImageResourceLimitModalProps extends BAIModalProps {
  imageFrgmt: ManageImageResourceLimitModal_image$key | null;
  open: boolean;
  onRequestClose: (success: boolean) => void;
}

const ManageImageResourceLimitModal: React.FC<
  ManageImageResourceLimitModalProps
> = ({ imageFrgmt, open, onRequestClose, ...BAIModalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const image = useFragment(
    graphql`
      fragment ManageImageResourceLimitModal_image on ImageNode {
        resource_limits {
          key
          min
          max
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
    useMutation<ManageImageResourceLimitModalMutation>(graphql`
      mutation ManageImageResourceLimitModalMutation(
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

  const handleOnClick = async () => {
    const isValid = await formRef.current?.validateFields().catch(() => false);
    if (!isValid) {
      return;
    }
    const fieldsValue = await formRef.current?.getFieldsValue();
    const resource_limits: ResourceLimitInput[] = Object.entries(fieldsValue)
      .map(([key, value]: [string, any]) => ({
        key,
        min: _.toString(value) ?? '0',
        max:
          image?.resource_limits?.find((item) => item?.key === key)?.max ??
          undefined,
      }))
      .filter((item) => !_.isEmpty(item?.min));

    // Image resource limits are pure DB metadata read by the scheduler at
    // session-enqueue time, so a modification applies to newly created
    // sessions immediately without any image reinstall.
    commitModifyImageInput({
      variables: {
        target: `${image?.registry}/${image?.name ?? image?.namespace}:${image?.tag}`,
        architecture: image?.architecture,
        props: {
          resource_limits,
        },
      },
      onCompleted: (res, errors) => {
        if (!res?.modify_image?.ok) {
          message.error(res?.modify_image?.msg);
          return;
        }
        if (errors?.length) {
          _.forEach(errors, (error) => message.error(error.message));
        } else {
          message.success(t('environment.DescImageResourceModified'));
          onRequestClose(true);
        }
      },
      onError: () => {
        message.error(t('dialog.ErrorOccurred'));
      },
    });
  };

  return (
    <BAIModal
      destroyOnHidden
      open={open}
      maskClosable={false}
      onOk={handleOnClick}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlightModifyImageInput}
      centered
      title={t('environment.ModifyMinimumImageResourceLimit')}
      okText={t('button.Save')}
      {...BAIModalProps}
    >
      {/* antd Alert type="info" -> Astryx Banner status="info"; `showIcon`
          dropped (Banner shows its icon by default). Margin becomes the
          BAIFlex column gap. */}
      <BAIFlex direction="column" align="stretch" gap="md">
        <Banner
          status="info"
          title={t('environment.ResourceLimitAppliesToNewSessionsOnly')}
        />
        <Form
          ref={formRef}
          layout="vertical"
          initialValues={_.fromPairs(
            _.map(image?.resource_limits ?? [], (item) => [
              item?.key,
              item?.min,
            ]),
          )}
        >
          {/* antd Row gutter={[24,16]} + Col span={12} (no breakpoint props)
              -> Astryx Grid columns={2} (MAPPING.md §3.9; responsive policy
              R-fixed: the original was a fixed 2-up grid). */}
          <Grid columns={2} columnGap={6} rowGap={4} align="start">
            {_.map(
              _.chunk(image?.resource_limits ?? [], 2),
              (resourceLimitChunk, index) => (
                <Fragment key={index}>
                  {_.map(resourceLimitChunk, (resourceLimit) => {
                    const key = _.get(resourceLimit, 'key', '');

                    if (!key) {
                      return null;
                    }

                    return (
                      <BAIFormItem
                        key={key}
                        label={
                          _.get(mergedResourceSlots, key)?.description ||
                          _.upperCase(key)
                        }
                        name={key}
                        rules={[
                          // Minimum resource values are assumed as 1 CPU core and 1 GiB memory.
                          // Accelerators (e.g., GPUs) have no minimum requirement and can be set arbitrarily.
                          // To preserve the key, the UI marks this field as required to prevent users from submitting an empty value.
                          {
                            required: true,
                          },
                          {
                            validator: (_, value) => {
                              if (
                                key === 'mem' &&
                                value &&
                                compareNumberWithUnits(
                                  value,
                                  DEFAULT_MIN_MEMORY,
                                ) < 0
                              ) {
                                return Promise.reject(
                                  new Error(
                                    t('environment.ErrorMinimumValue', {
                                      value: DEFAULT_MIN_MEMORY,
                                      key: mergedResourceSlots?.[key]
                                        ?.description,
                                    }),
                                  ),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        {key === 'mem' ? (
                          <BAIDynamicUnitInputNumber
                            defaultUnit="g"
                            min={DEFAULT_MIN_MEMORY}
                            style={{ width: '100%' }}
                          />
                        ) : (
                          // antd InputNumber `suffix` -> Astryx NumberInput
                          // `units` (MAPPING.md §3.17), via the Form adapter.
                          <AstryxFormNumberInput
                            label={
                              _.get(mergedResourceSlots, key)?.description ||
                              _.upperCase(key)
                            }
                            min={
                              key === 'cpu'
                                ? DEFAULT_MIN_CPU
                                : DEFAULT_MIN_OTHER
                            }
                            step={_.includes(key, '.shares') ? 0.1 : 1}
                            units={
                              mergedResourceSlots?.[key]?.display_unit || ''
                            }
                          />
                        )}
                      </BAIFormItem>
                    );
                  })}
                </Fragment>
              ),
            )}
          </Grid>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default ManageImageResourceLimitModal;
