import type {
  BAIRuntimeVariantPresetSettingModalCreateMutation,
  CreateRuntimeVariantPresetInput,
} from '../../__generated__/BAIRuntimeVariantPresetSettingModalCreateMutation.graphql';
import type { BAIRuntimeVariantPresetSettingModalFragment$key } from '../../__generated__/BAIRuntimeVariantPresetSettingModalFragment.graphql';
import type {
  BAIRuntimeVariantPresetSettingModalUpdateMutation,
  UpdateRuntimeVariantPresetInput,
} from '../../__generated__/BAIRuntimeVariantPresetSettingModalUpdateMutation.graphql';
import { toLocalId } from '../../helper';
import { useBAILogger } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIModal, { BAIModalProps } from '../BAIModal';
import BAISelect from '../BAISelect';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import BAIRuntimeVariantSelect from './BAIRuntimeVariantSelect';
import {
  App,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Switch,
} from 'antd';
import React, { Suspense, useRef } from 'react';
import { graphql, useFragment, useMutation } from 'react-relay';
import { PayloadError } from 'relay-runtime';

type RuntimeVariantPresetFormValues = {
  runtimeVariantId: string;
  name: string;
  description?: string;
  presetTarget: 'ENV' | 'ARGS';
  valueType: 'STR' | 'INT' | 'FLOAT' | 'BOOL' | 'FLAG';
  defaultValue?: string;
  key: string;
  required?: boolean;
  rank?: number;
};

export interface BAIRuntimeVariantPresetSettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  presetFrgmt?: BAIRuntimeVariantPresetSettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const BAIRuntimeVariantPresetSettingModal: React.FC<
  BAIRuntimeVariantPresetSettingModalProps
> = ({ presetFrgmt, onRequestClose, ...baiModalProps }) => {
  'use memo';

  const { t } = useBAIi18n();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const formRef = useRef<FormInstance<RuntimeVariantPresetFormValues>>(null);
  const baiClient = useConnectedBAIClient();
  const isRequiredSupported = baiClient.supports(
    'runtime-variant-preset-required',
  );

  const preset = useFragment(
    graphql`
      fragment BAIRuntimeVariantPresetSettingModalFragment on RuntimeVariantPreset {
        id
        runtimeVariantId
        name
        description
        rank
        targetSpec {
          presetTarget
          valueType
          defaultValue
          key
        }
        required @since(version: "26.4.4")
      }
    `,
    presetFrgmt,
  );

  const [commitCreate, isInFlightCreate] =
    useMutation<BAIRuntimeVariantPresetSettingModalCreateMutation>(graphql`
      mutation BAIRuntimeVariantPresetSettingModalCreateMutation(
        $input: CreateRuntimeVariantPresetInput!
      ) {
        adminCreateRuntimeVariantPreset(input: $input) {
          preset {
            id
            runtimeVariantId
            name
            description
            rank
            targetSpec {
              presetTarget
              valueType
              defaultValue
              key
            }
            required @since(version: "26.4.4")
            createdAt
            updatedAt
          }
        }
      }
    `);

  const [commitUpdate, isInFlightUpdate] =
    useMutation<BAIRuntimeVariantPresetSettingModalUpdateMutation>(graphql`
      mutation BAIRuntimeVariantPresetSettingModalUpdateMutation(
        $input: UpdateRuntimeVariantPresetInput!
      ) {
        adminUpdateRuntimeVariantPreset(input: $input) {
          preset {
            id
            runtimeVariantId
            name
            description
            rank
            targetSpec {
              presetTarget
              valueType
              defaultValue
              key
            }
            required @since(version: "26.4.4")
            createdAt
            updatedAt
          }
        }
      }
    `);

  const buildMutationCallbacks = <TResponse,>(successMessageKey: string) => ({
    onCompleted: (
      _data: TResponse,
      errors?: ReadonlyArray<PayloadError> | null,
    ) => {
      if (errors && errors.length > 0) {
        logger.error(errors[0]);
        message.error(errors[0]?.message);
        return;
      }
      message.success(t(successMessageKey));
      onRequestClose(true);
    },
    onError: (error: Error) => {
      logger.error(error);
      message.error(error?.message);
    },
  });

  const handleOk = () => {
    return formRef.current
      ?.validateFields()
      .then((values) => {
        const requiredField = isRequiredSupported
          ? { required: values.required ?? false }
          : {};
        if (preset) {
          const input: UpdateRuntimeVariantPresetInput = {
            id: toLocalId(preset.id),
            name: values.name,
            description: values.description ?? null,
            rank: values.rank,
            presetTarget: values.presetTarget,
            valueType: values.valueType,
            defaultValue: values.defaultValue ?? null,
            key: values.key,
            ...requiredField,
          };
          commitUpdate({
            variables: { input },
            ...buildMutationCallbacks<
              BAIRuntimeVariantPresetSettingModalUpdateMutation['response']
            >('comp:BAIRuntimeVariantPresetSettingModal.PresetUpdated'),
          });
        } else {
          const input: CreateRuntimeVariantPresetInput = {
            runtimeVariantId: values.runtimeVariantId,
            name: values.name,
            description: values.description ?? null,
            presetTarget: values.presetTarget,
            valueType: values.valueType,
            defaultValue: values.defaultValue ?? null,
            key: values.key,
            ...requiredField,
          };
          commitCreate({
            variables: { input },
            ...buildMutationCallbacks<
              BAIRuntimeVariantPresetSettingModalCreateMutation['response']
            >('comp:BAIRuntimeVariantPresetSettingModal.PresetCreated'),
          });
        }
      })
      .catch((err) => {
        logger.error(err);
      });
  };

  return (
    <BAIModal
      {...baiModalProps}
      title={
        preset
          ? t('comp:BAIRuntimeVariantPresetSettingModal.EditPreset')
          : t('comp:BAIRuntimeVariantPresetSettingModal.CreatePreset')
      }
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      destroyOnHidden
      confirmLoading={isInFlightCreate || isInFlightUpdate}
      okText={preset ? t('general.button.Save') : t('general.button.Create')}
    >
      <Form
        ref={formRef}
        layout="vertical"
        preserve={false}
        initialValues={
          preset
            ? {
                runtimeVariantId: preset.runtimeVariantId,
                name: preset.name,
                description: preset.description ?? undefined,
                rank: preset.rank,
                presetTarget: preset.targetSpec?.presetTarget,
                valueType: preset.targetSpec?.valueType,
                defaultValue: preset.targetSpec?.defaultValue ?? undefined,
                key: preset.targetSpec?.key,
                required: preset.required ?? false,
              }
            : {
                presetTarget: 'ENV',
                valueType: 'STR',
                required: false,
              }
        }
      >
        <Suspense
          fallback={
            // Keep the field registered (name + required rule) while the
            // variant options load, so submitting during this transient
            // Suspense window is blocked by validation instead of sending a
            // create mutation with `runtimeVariantId` undefined.
            <Form.Item
              label={t(
                'comp:BAIRuntimeVariantPresetSettingModal.RuntimeVariant',
              )}
              name="runtimeVariantId"
              rules={[
                {
                  required: true,
                  message: t(
                    'comp:BAIRuntimeVariantPresetSettingModal.RuntimeVariantRequired',
                  ),
                },
              ]}
            >
              <BAISelect loading disabled />
            </Form.Item>
          }
        >
          <Form.Item
            label={t('comp:BAIRuntimeVariantPresetSettingModal.RuntimeVariant')}
            name="runtimeVariantId"
            rules={[
              {
                required: true,
                message: t(
                  'comp:BAIRuntimeVariantPresetSettingModal.RuntimeVariantRequired',
                ),
              },
            ]}
          >
            <BAIRuntimeVariantSelect
              disabled={!!preset}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Suspense>
        <Form.Item
          label={t('comp:BAIRuntimeVariantPresetSettingModal.Name')}
          name="name"
          rules={[
            {
              required: true,
              message: t(
                'comp:BAIRuntimeVariantPresetSettingModal.NameRequired',
              ),
            },
          ]}
        >
          <Input
            placeholder={t(
              'comp:BAIRuntimeVariantPresetSettingModal.NamePlaceholder',
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIRuntimeVariantPresetSettingModal.Description')}
          name="description"
        >
          <Input.TextArea
            rows={2}
            placeholder={t(
              'comp:BAIRuntimeVariantPresetSettingModal.DescriptionPlaceholder',
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIRuntimeVariantPresetSettingModal.PresetTarget')}
          name="presetTarget"
          rules={[
            {
              required: true,
              message: t(
                'comp:BAIRuntimeVariantPresetSettingModal.PresetTargetRequired',
              ),
            },
          ]}
        >
          <BAISelect
            options={[
              {
                label: t(
                  'comp:BAIRuntimeVariantPresetSettingModal.PresetTargetEnv',
                ),
                value: 'ENV',
              },
              {
                label: t(
                  'comp:BAIRuntimeVariantPresetSettingModal.PresetTargetArgs',
                ),
                value: 'ARGS',
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIRuntimeVariantPresetSettingModal.ValueType')}
          name="valueType"
          rules={[
            {
              required: true,
              message: t(
                'comp:BAIRuntimeVariantPresetSettingModal.ValueTypeRequired',
              ),
            },
          ]}
        >
          <BAISelect
            options={[
              {
                label: t(
                  'comp:BAIRuntimeVariantPresetSettingModal.ValueTypeStr',
                ),
                value: 'STR',
              },
              {
                label: t(
                  'comp:BAIRuntimeVariantPresetSettingModal.ValueTypeInt',
                ),
                value: 'INT',
              },
              {
                label: t(
                  'comp:BAIRuntimeVariantPresetSettingModal.ValueTypeFloat',
                ),
                value: 'FLOAT',
              },
              {
                label: t(
                  'comp:BAIRuntimeVariantPresetSettingModal.ValueTypeBool',
                ),
                value: 'BOOL',
              },
              {
                label: t(
                  'comp:BAIRuntimeVariantPresetSettingModal.ValueTypeFlag',
                ),
                value: 'FLAG',
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIRuntimeVariantPresetSettingModal.Key')}
          name="key"
          rules={[
            {
              required: true,
              message: t(
                'comp:BAIRuntimeVariantPresetSettingModal.KeyRequired',
              ),
            },
          ]}
        >
          <Input
            placeholder={t(
              'comp:BAIRuntimeVariantPresetSettingModal.KeyPlaceholder',
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIRuntimeVariantPresetSettingModal.DefaultValue')}
          name="defaultValue"
        >
          <Input
            placeholder={t(
              'comp:BAIRuntimeVariantPresetSettingModal.DefaultValuePlaceholder',
            )}
          />
        </Form.Item>
        {isRequiredSupported ? (
          <Form.Item
            label={t('comp:BAIRuntimeVariantPresetSettingModal.Required')}
            name="required"
            valuePropName="checked"
            tooltip={t(
              'comp:BAIRuntimeVariantPresetSettingModal.RequiredTooltip',
            )}
          >
            <Switch />
          </Form.Item>
        ) : null}
        {preset ? (
          <Form.Item
            label={t('comp:BAIRuntimeVariantPresetSettingModal.Rank')}
            name="rank"
            tooltip={t('comp:BAIRuntimeVariantPresetSettingModal.RankTooltip')}
          >
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        ) : null}
      </Form>
    </BAIModal>
  );
};

export default BAIRuntimeVariantPresetSettingModal;
