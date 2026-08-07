import type {
  BAIRuntimeVariantPresetSettingModalCreateMutation,
  CreateRuntimeVariantPresetInput,
  RuntimeVariantPresetUIOptionInput,
} from '../../__generated__/BAIRuntimeVariantPresetSettingModalCreateMutation.graphql';
import type { BAIRuntimeVariantPresetSettingModalFragment$key } from '../../__generated__/BAIRuntimeVariantPresetSettingModalFragment.graphql';
import type {
  BAIRuntimeVariantPresetSettingModalUpdateMutation,
  UpdateRuntimeVariantPresetInput,
} from '../../__generated__/BAIRuntimeVariantPresetSettingModalUpdateMutation.graphql';
import { toLocalId } from '../../helper';
import { useBAILogger } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAIModal, { BAIModalProps } from '../BAIModal';
import BAISelect from '../BAISelect';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import BAIRuntimeVariantSelect from './BAIRuntimeVariantSelect';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App, AutoComplete, Form, Input, InputNumber, Switch } from 'antd';
import React, { Suspense, useState } from 'react';
import { graphql, useFragment, useMutation } from 'react-relay';
import { PayloadError } from 'relay-runtime';

type UIType = 'SLIDER' | 'NUMBER_INPUT' | 'SELECT' | 'CHECKBOX' | 'TEXT_INPUT';

const READ_UI_TYPE_TO_FORM_UI_TYPE: Record<string, UIType> = {
  slider: 'SLIDER',
  number_input: 'NUMBER_INPUT',
  select: 'SELECT',
  checkbox: 'CHECKBOX',
  text_input: 'TEXT_INPUT',
};

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
  category?: string;
  displayName?: string;
  uiType?: UIType;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  numberMin?: number;
  numberMax?: number;
  choices?: Array<{ value: string; label: string }>;
  textPlaceholder?: string;
};

/** Builds the `uiOption` mutation input from the flattened form fields, or `undefined` when no UI type was chosen. */
function buildUIOptionInput(
  values: RuntimeVariantPresetFormValues,
): RuntimeVariantPresetUIOptionInput | undefined {
  switch (values.uiType) {
    case 'SLIDER':
      return {
        uiType: 'SLIDER',
        slider: {
          min: values.sliderMin ?? 0,
          max: values.sliderMax ?? 100,
          step: values.sliderStep ?? 1,
        },
      };
    case 'NUMBER_INPUT':
      return {
        uiType: 'NUMBER_INPUT',
        number: {
          min: values.numberMin ?? null,
          max: values.numberMax ?? null,
        },
      };
    case 'SELECT':
      return {
        uiType: 'SELECT',
        choices: {
          items: (values.choices ?? []).map((item) => ({
            value: item.value,
            label: item.label,
          })),
        },
      };
    case 'CHECKBOX':
      return { uiType: 'CHECKBOX' };
    case 'TEXT_INPUT':
      return {
        uiType: 'TEXT_INPUT',
        text: { placeholder: values.textPlaceholder ?? null },
      };
    default:
      return undefined;
  }
}

export interface BAIRuntimeVariantPresetSettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  presetFrgmt?: BAIRuntimeVariantPresetSettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
  /** Category values already used by other presets, offered as autocomplete suggestions. */
  categoryOptions?: ReadonlyArray<string>;
}

const BAIRuntimeVariantPresetSettingModal: React.FC<
  BAIRuntimeVariantPresetSettingModalProps
> = ({ presetFrgmt, onRequestClose, categoryOptions, ...baiModalProps }) => {
  'use memo';

  const { t } = useBAIi18n();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const [form] = Form.useForm<RuntimeVariantPresetFormValues>();
  const baiClient = useConnectedBAIClient();
  const isRequiredSupported = baiClient.supports(
    'runtime-variant-preset-required',
  );
  const isUIMetadataSupported = baiClient.supports(
    'runtime-variant-preset-ui-metadata',
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
        category
        displayName
        uiOption {
          uiType
          slider {
            min
            max
            step
          }
          number {
            min
            max
          }
          choices {
            items {
              value
              label
            }
          }
          text {
            placeholder
          }
        }
      }
    `,
    presetFrgmt,
  );

  // Derived synchronously from `preset` at mount (not via `Form.useWatch`,
  // which returns `undefined` on the very first render by design). With
  // `preserve={false}` on the Form, any field path that isn't actively
  // mounted on that first render gets garbage-collected from the form
  // store — so a `Form.useWatch`-driven `uiType` would mount the
  // slider/number/choices/text sub-fields one render too late and lose
  // their edit-mode initial values (Form.List keeps the row *count* but
  // not the per-row content).
  const [uiType, setUiType] = useState<UIType | undefined>(() =>
    preset?.uiOption?.uiType
      ? READ_UI_TYPE_TO_FORM_UI_TYPE[preset.uiOption.uiType]
      : undefined,
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
            category
            displayName
            uiOption {
              uiType
              slider {
                min
                max
                step
              }
              number {
                min
                max
              }
              choices {
                items {
                  value
                  label
                }
              }
              text {
                placeholder
              }
            }
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
            category
            displayName
            uiOption {
              uiType
              slider {
                min
                max
                step
              }
              number {
                min
                max
              }
              choices {
                items {
                  value
                  label
                }
              }
              text {
                placeholder
              }
            }
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
    return form
      .validateFields()
      .then((values) => {
        const requiredField = isRequiredSupported
          ? { required: values.required ?? false }
          : {};
        const uiMetadataFields = isUIMetadataSupported
          ? {
              category: values.category ?? null,
              displayName: values.displayName ?? null,
              uiOption: buildUIOptionInput(values) ?? null,
            }
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
            ...uiMetadataFields,
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
            ...uiMetadataFields,
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
        form={form}
        layout="vertical"
        onValuesChange={(changedValues) => {
          if ('uiType' in changedValues) {
            setUiType(changedValues.uiType);
            // Clear the other UI types' config so switching types doesn't
            // leak stale values into the submitted `uiOption` (previously
            // handled by `preserve={false}` on the Form, which turned out to
            // garbage-collect the `choices` Form.List's per-row content —
            // see the `uiType` state comment above).
            form.setFieldsValue({
              sliderMin: undefined,
              sliderMax: undefined,
              sliderStep: undefined,
              numberMin: undefined,
              numberMax: undefined,
              choices: undefined,
              textPlaceholder: undefined,
            });
          }
        }}
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
                category: preset.category ?? undefined,
                displayName: preset.displayName ?? undefined,
                uiType: preset.uiOption?.uiType
                  ? READ_UI_TYPE_TO_FORM_UI_TYPE[preset.uiOption.uiType]
                  : undefined,
                sliderMin: preset.uiOption?.slider?.min ?? undefined,
                sliderMax: preset.uiOption?.slider?.max ?? undefined,
                sliderStep: preset.uiOption?.slider?.step ?? undefined,
                numberMin: preset.uiOption?.number?.min ?? undefined,
                numberMax: preset.uiOption?.number?.max ?? undefined,
                choices: preset.uiOption?.choices?.items
                  ? preset.uiOption.choices.items.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))
                  : undefined,
                textPlaceholder:
                  preset.uiOption?.text?.placeholder ?? undefined,
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
        {isUIMetadataSupported ? (
          <>
            <Form.Item
              label={t('comp:BAIRuntimeVariantPresetSettingModal.Category')}
              name="category"
              tooltip={t(
                'comp:BAIRuntimeVariantPresetSettingModal.CategoryTooltip',
              )}
            >
              <AutoComplete
                options={(categoryOptions ?? []).map((category) => ({
                  value: category,
                }))}
                filterOption={(inputValue, option) =>
                  !!option?.value
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
                }
                placeholder={t(
                  'comp:BAIRuntimeVariantPresetSettingModal.CategoryPlaceholder',
                )}
              />
            </Form.Item>
            <Form.Item
              label={t('comp:BAIRuntimeVariantPresetSettingModal.DisplayName')}
              name="displayName"
              tooltip={t(
                'comp:BAIRuntimeVariantPresetSettingModal.DisplayNameTooltip',
              )}
            >
              <Input
                placeholder={t(
                  'comp:BAIRuntimeVariantPresetSettingModal.DisplayNamePlaceholder',
                )}
              />
            </Form.Item>
          </>
        ) : null}
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
        {isUIMetadataSupported ? (
          <>
            <Form.Item
              label={t('comp:BAIRuntimeVariantPresetSettingModal.UIType')}
              name="uiType"
              tooltip={t(
                'comp:BAIRuntimeVariantPresetSettingModal.UITypeTooltip',
              )}
            >
              <BAISelect
                allowClear
                options={[
                  {
                    label: t(
                      'comp:BAIRuntimeVariantPresetSettingModal.UITypeSlider',
                    ),
                    value: 'SLIDER',
                  },
                  {
                    label: t(
                      'comp:BAIRuntimeVariantPresetSettingModal.UITypeNumberInput',
                    ),
                    value: 'NUMBER_INPUT',
                  },
                  {
                    label: t(
                      'comp:BAIRuntimeVariantPresetSettingModal.UITypeSelect',
                    ),
                    value: 'SELECT',
                  },
                  {
                    label: t(
                      'comp:BAIRuntimeVariantPresetSettingModal.UITypeCheckbox',
                    ),
                    value: 'CHECKBOX',
                  },
                  {
                    label: t(
                      'comp:BAIRuntimeVariantPresetSettingModal.UITypeTextInput',
                    ),
                    value: 'TEXT_INPUT',
                  },
                ]}
              />
            </Form.Item>
            {uiType === 'SLIDER' ? (
              <BAIFlex gap="sm" align="start" style={{ width: '100%' }}>
                <Form.Item
                  label={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.SliderMin',
                  )}
                  name="sliderMin"
                  rules={[
                    {
                      required: true,
                      message: t(
                        'comp:BAIRuntimeVariantPresetSettingModal.SliderMinRequired',
                      ),
                    },
                  ]}
                  style={{ flex: 1 }}
                >
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  label={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.SliderMax',
                  )}
                  name="sliderMax"
                  rules={[
                    {
                      required: true,
                      message: t(
                        'comp:BAIRuntimeVariantPresetSettingModal.SliderMaxRequired',
                      ),
                    },
                  ]}
                  style={{ flex: 1 }}
                >
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  label={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.SliderStep',
                  )}
                  name="sliderStep"
                  tooltip={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.SliderStepTooltip',
                  )}
                  style={{ flex: 1 }}
                >
                  <InputNumber style={{ width: '100%' }} placeholder="1" />
                </Form.Item>
              </BAIFlex>
            ) : null}
            {uiType === 'NUMBER_INPUT' ? (
              <BAIFlex gap="sm" align="start" style={{ width: '100%' }}>
                <Form.Item
                  label={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.NumberMin',
                  )}
                  name="numberMin"
                  style={{ flex: 1 }}
                >
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  label={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.NumberMax',
                  )}
                  name="numberMax"
                  style={{ flex: 1 }}
                >
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </BAIFlex>
            ) : null}
            {uiType === 'SELECT' ? (
              <Form.List
                name="choices"
                rules={[
                  {
                    validator: async (_, choices) => {
                      if (!choices || choices.length < 1) {
                        return Promise.reject(
                          new Error(
                            t(
                              'comp:BAIRuntimeVariantPresetSettingModal.ChoicesRequired',
                            ),
                          ),
                        );
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <Form.Item
                    label={t(
                      'comp:BAIRuntimeVariantPresetSettingModal.Choices',
                    )}
                  >
                    <BAIFlex direction="column" align="stretch" gap="xs">
                      {fields.map((field) => (
                        <BAIFlex key={field.key} gap="xs" align="start">
                          <Form.Item
                            {...field}
                            name={[field.name, 'value']}
                            noStyle
                            rules={[
                              {
                                required: true,
                                message: t(
                                  'comp:BAIRuntimeVariantPresetSettingModal.ChoiceValueRequired',
                                ),
                              },
                            ]}
                          >
                            <Input
                              placeholder={t(
                                'comp:BAIRuntimeVariantPresetSettingModal.ChoiceValuePlaceholder',
                              )}
                              style={{ flex: 1 }}
                            />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, 'label']}
                            noStyle
                            rules={[
                              {
                                required: true,
                                message: t(
                                  'comp:BAIRuntimeVariantPresetSettingModal.ChoiceLabelRequired',
                                ),
                              },
                            ]}
                          >
                            <Input
                              placeholder={t(
                                'comp:BAIRuntimeVariantPresetSettingModal.ChoiceLabelPlaceholder',
                              )}
                              style={{ flex: 1 }}
                            />
                          </Form.Item>
                          <BAIButton
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            aria-label={t('general.button.Delete')}
                            onClick={() => remove(field.name)}
                          />
                        </BAIFlex>
                      ))}
                      <BAIButton
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => add()}
                        block
                      >
                        {t(
                          'comp:BAIRuntimeVariantPresetSettingModal.AddChoice',
                        )}
                      </BAIButton>
                      <Form.ErrorList errors={errors} />
                    </BAIFlex>
                  </Form.Item>
                )}
              </Form.List>
            ) : null}
            {uiType === 'TEXT_INPUT' ? (
              <Form.Item
                label={t(
                  'comp:BAIRuntimeVariantPresetSettingModal.TextPlaceholderLabel',
                )}
                name="textPlaceholder"
              >
                <Input
                  placeholder={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.TextPlaceholderExample',
                  )}
                />
              </Form.Item>
            ) : null}
          </>
        ) : null}
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
