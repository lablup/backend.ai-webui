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
import { App } from '../../app-shim';
import { Form } from '../../form-engine';
import {
  isValueTypeCompatibleWithUIType,
  READ_UI_TYPE_TO_FORM_UI_TYPE,
  toLocalId,
  UI_TYPE_TO_ALLOWED_VALUE_TYPES,
  type RuntimeVariantPresetUIType as UIType,
  type RuntimeVariantPresetValueType as ValueType,
} from '../../helper';
import { useBAILogger } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIAlert from '../BAIAlert';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAIModal, { BAIModalProps } from '../BAIModal';
import BAISelect from '../BAISelect';
import {
  AstryxFormNumberInput,
  AstryxFormSwitch,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from '../astryxFormControls';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import BAIRuntimeVariantSelect from './BAIRuntimeVariantSelect';
import { PlusIcon, Trash2 } from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { graphql, useFragment, useMutation } from 'react-relay';
import { PayloadError } from 'relay-runtime';

type RuntimeVariantPresetFormValues = {
  runtimeVariantId: string;
  name: string;
  description?: string;
  presetTarget: 'ENV' | 'ARGS';
  valueType: ValueType;
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

/**
 * Trims a text field and collapses an empty/whitespace-only result to `null`
 * so clearing `category`/`displayName` in the form actually clears the
 * metadata on the manager, instead of persisting `""` (which the read side's
 * `?? name` / `?? 'general'` nullish fallback doesn't treat as absent).
 */
function normalizeOptionalText(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

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

  // A control type this build does not know about cannot be represented in the
  // form, so the builder would emit `undefined` and we would send an explicit
  // `uiOption: null` — which the manager reads as "clear it" (the input field
  // is SENTINEL-defaulted). Omit the key instead and leave the server's value
  // alone.
  const hasUnknownUIType =
    !!preset?.uiOption?.uiType &&
    !READ_UI_TYPE_TO_FORM_UI_TYPE[preset.uiOption.uiType];

  // Constrains the value type below. `uiType` is seeded from the preset
  // regardless of `isUIMetadataSupported`, so a manager too old to let the
  // admin EDIT the control still constrains the value type against the
  // control it already stores — otherwise this screen could author the
  // mismatch it is meant to prevent. An unrecognised stored type constrains
  // nothing: this build cannot know what it renders.
  const isValueTypeAllowed = (value: ValueType) =>
    isValueTypeCompatibleWithUIType(uiType, value);

  // One enumeration of each vocabulary, shared by the select below and the
  // mismatch banner. A parallel map of translation KEYS would both drift from
  // these options and hide the keys from the i18n extractor, which only sees
  // `t()` called on a literal.
  const uiTypeOptions: Array<{ label: string; value: UIType }> = [
    {
      label: t('comp:BAIRuntimeVariantPresetSettingModal.UITypeSlider'),
      value: 'SLIDER',
    },
    {
      label: t('comp:BAIRuntimeVariantPresetSettingModal.UITypeNumberInput'),
      value: 'NUMBER_INPUT',
    },
    {
      label: t('comp:BAIRuntimeVariantPresetSettingModal.UITypeSelect'),
      value: 'SELECT',
    },
    {
      label: t('comp:BAIRuntimeVariantPresetSettingModal.UITypeCheckbox'),
      value: 'CHECKBOX',
    },
    {
      label: t('comp:BAIRuntimeVariantPresetSettingModal.UITypeTextInput'),
      value: 'TEXT_INPUT',
    },
  ];

  const valueTypeOptions: Array<{ label: string; value: ValueType }> = [
    {
      label: t('comp:BAIRuntimeVariantPresetSettingModal.ValueTypeStr'),
      value: 'STR',
    },
    {
      label: t('comp:BAIRuntimeVariantPresetSettingModal.ValueTypeInt'),
      value: 'INT',
    },
    {
      label: t('comp:BAIRuntimeVariantPresetSettingModal.ValueTypeFloat'),
      value: 'FLOAT',
    },
    {
      label: t('comp:BAIRuntimeVariantPresetSettingModal.ValueTypeBool'),
      value: 'BOOL',
    },
    {
      label: t('comp:BAIRuntimeVariantPresetSettingModal.ValueTypeFlag'),
      value: 'FLAG',
    },
  ];

  // The banner reports what is STORED, not what the form currently holds: the
  // field validator already gives live feedback, and deriving this from form
  // state would need `Form.useWatch`, which this file avoids on purpose (see
  // the `uiType` state comment) — and would misfire right after `uiType`
  // changes clear `valueType`.
  const storedUIType = preset?.uiOption?.uiType
    ? READ_UI_TYPE_TO_FORM_UI_TYPE[preset.uiOption.uiType]
    : undefined;
  const storedValueType = preset?.targetSpec?.valueType as
    ValueType | undefined;
  const hasStoredValueTypeMismatch =
    !!storedUIType &&
    !!storedValueType &&
    !isValueTypeCompatibleWithUIType(storedUIType, storedValueType);

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
              category: normalizeOptionalText(values.category),
              displayName: normalizeOptionalText(values.displayName),
              // Only hold back while the form still has no representable
              // type — once the admin picks a supported one, that selection
              // must reach the server.
              ...(hasUnknownUIType && values.uiType === undefined
                ? {}
                : { uiOption: buildUIOptionInput(values) ?? null }),
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
            const nextUIType: UIType | undefined = changedValues.uiType;
            setUiType(nextUIType);
            const nextAllowed = nextUIType
              ? UI_TYPE_TO_ALLOWED_VALUE_TYPES[nextUIType]
              : undefined;
            const currentValueType: ValueType | undefined =
              form.getFieldValue('valueType');
            // Clear the other UI types' config so switching types doesn't
            // leak stale values into the submitted `uiOption` (previously
            // handled by `preserve={false}` on the Form, which turned out to
            // garbage-collect the `choices` Form.List's per-row content —
            // see the `uiType` state comment above).
            form.setFieldsValue({
              // Drop a value type the new control cannot render rather than
              // substituting one, so the admin re-picks deliberately.
              ...(nextAllowed &&
              currentValueType &&
              !nextAllowed.includes(currentValueType)
                ? { valueType: undefined }
                : {}),
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
        {/* Deliberately NOT gated on `isUIMetadataSupported`. Below 26.9.0 the
            UI type select is hidden but `valueType` stays writable, so that is
            exactly where the greyed-out value types have no visible cause. The
            copy names the stored control as a fact about the preset rather
            than a field to edit, so it reads correctly either way. */}
        {storedUIType && storedValueType && hasStoredValueTypeMismatch ? (
          <BAIAlert
            type="warning"
            description={t(
              'comp:BAIRuntimeVariantPresetSettingModal.StoredValueTypeMismatch',
              {
                uiType:
                  uiTypeOptions.find(({ value }) => value === storedUIType)
                    ?.label ?? storedUIType,
                valueType:
                  valueTypeOptions.find(
                    ({ value }) => value === storedValueType,
                  )?.label ?? storedValueType,
              },
            )}
          />
        ) : null}
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
              label={t(
                'comp:BAIRuntimeVariantPresetSettingModal.RuntimeVariant',
              )}
              isLabelHidden
              isDisabled={!!preset}
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
          <AstryxFormTextInput
            label={t('comp:BAIRuntimeVariantPresetSettingModal.Name')}
            placeholder={t(
              'comp:BAIRuntimeVariantPresetSettingModal.NamePlaceholder',
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIRuntimeVariantPresetSettingModal.Description')}
          name="description"
        >
          <AstryxFormTextArea
            label={t('comp:BAIRuntimeVariantPresetSettingModal.Description')}
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
              {/* PILOT-DECISION: antd `AutoComplete` -> `AstryxFormTextInput`.
                  MAPPING §3.15 — free-text AutoComplete does not map to
                  `Typeahead` (it commits `T | null` and cannot keep a typed
                  string), and category must stay free text so a new category
                  can be created here. Following the AutoScalingRuleEditorModal
                  precedent, the suggestion dropdown is dropped and the known
                  categories (`categoryOptions`) are surfaced in the
                  placeholder instead; the client-side `filterOption` goes
                  with it. */}
              <AstryxFormTextInput
                label={t('comp:BAIRuntimeVariantPresetSettingModal.Category')}
                placeholder={
                  categoryOptions && categoryOptions.length > 0
                    ? categoryOptions.join(', ')
                    : t(
                        'comp:BAIRuntimeVariantPresetSettingModal.CategoryPlaceholder',
                      )
                }
              />
            </Form.Item>
            <Form.Item
              label={t('comp:BAIRuntimeVariantPresetSettingModal.DisplayName')}
              name="displayName"
              tooltip={t(
                'comp:BAIRuntimeVariantPresetSettingModal.DisplayNameTooltip',
              )}
            >
              <AstryxFormTextInput
                label={t(
                  'comp:BAIRuntimeVariantPresetSettingModal.DisplayName',
                )}
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
        {/* Above the value type on purpose: the control is the driver field
            for everything that follows it — the value type here, and the
            slider / number / choices / placeholder config further down. */}
        {isUIMetadataSupported ? (
          <Form.Item
            label={t('comp:BAIRuntimeVariantPresetSettingModal.UIType')}
            name="uiType"
            tooltip={t(
              'comp:BAIRuntimeVariantPresetSettingModal.UITypeTooltip',
            )}
          >
            <BAISelect allowClear options={uiTypeOptions} />
          </Form.Item>
        ) : null}
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
            {
              // Disabling the options stops a NEW mismatch being picked; this
              // catches one already stored (authored by an older build, the
              // CLI, or the API), which arrives selected and would otherwise
              // be saved straight back.
              validator: async (_rule, value?: ValueType) => {
                if (value && !isValueTypeAllowed(value)) {
                  throw new Error(
                    t(
                      'comp:BAIRuntimeVariantPresetSettingModal.ValueTypeIncompatibleWithUIType',
                    ),
                  );
                }
              },
            },
          ]}
        >
          <BAISelect
            options={valueTypeOptions.map((option) => ({
              ...option,
              disabled: !isValueTypeAllowed(option.value),
            }))}
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
          <AstryxFormTextInput
            label={t('comp:BAIRuntimeVariantPresetSettingModal.Key')}
            placeholder={t(
              'comp:BAIRuntimeVariantPresetSettingModal.KeyPlaceholder',
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIRuntimeVariantPresetSettingModal.DefaultValue')}
          name="defaultValue"
        >
          <AstryxFormTextInput
            label={t('comp:BAIRuntimeVariantPresetSettingModal.DefaultValue')}
            placeholder={t(
              'comp:BAIRuntimeVariantPresetSettingModal.DefaultValuePlaceholder',
            )}
          />
        </Form.Item>
        {isUIMetadataSupported ? (
          <>
            {uiType === 'SLIDER' ? (
              <BAIFlex
                gap="sm"
                align="start"
                wrap="wrap"
                style={{ width: '100%' }}
              >
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
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <AstryxFormNumberInput
                    label={t(
                      'comp:BAIRuntimeVariantPresetSettingModal.SliderMin',
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.SliderMax',
                  )}
                  name="sliderMax"
                  // Revalidate against the minimum whenever it changes too,
                  // not just when the maximum itself is edited.
                  dependencies={['sliderMin']}
                  rules={[
                    {
                      required: true,
                      message: t(
                        'comp:BAIRuntimeVariantPresetSettingModal.SliderMaxRequired',
                      ),
                    },
                    ({ getFieldValue }) => ({
                      validator(_rule, value) {
                        const min = getFieldValue('sliderMin');
                        if (
                          value !== undefined &&
                          value !== null &&
                          min !== undefined &&
                          min !== null &&
                          value <= min
                        ) {
                          return Promise.reject(
                            new Error(
                              t(
                                'comp:BAIRuntimeVariantPresetSettingModal.SliderMaxMustExceedMin',
                              ),
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <AstryxFormNumberInput
                    label={t(
                      'comp:BAIRuntimeVariantPresetSettingModal.SliderMax',
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.SliderStep',
                  )}
                  name="sliderStep"
                  tooltip={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.SliderStepTooltip',
                  )}
                  // A step of 0 (or below) can never advance the slider, so
                  // require a strictly positive value rather than only
                  // rejecting negatives.
                  rules={[
                    {
                      validator: async (_rule, value) => {
                        if (
                          value !== undefined &&
                          value !== null &&
                          value <= 0
                        ) {
                          throw new Error(
                            t(
                              'comp:BAIRuntimeVariantPresetSettingModal.SliderStepMustBePositive',
                            ),
                          );
                        }
                      },
                    },
                  ]}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <AstryxFormNumberInput
                    label={t(
                      'comp:BAIRuntimeVariantPresetSettingModal.SliderStep',
                    )}
                    placeholder="1"
                  />
                </Form.Item>
              </BAIFlex>
            ) : null}
            {uiType === 'NUMBER_INPUT' ? (
              <BAIFlex
                gap="sm"
                align="start"
                wrap="wrap"
                style={{ width: '100%' }}
              >
                <Form.Item
                  label={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.NumberMin',
                  )}
                  name="numberMin"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <AstryxFormNumberInput
                    label={t(
                      'comp:BAIRuntimeVariantPresetSettingModal.NumberMin',
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.NumberMax',
                  )}
                  name="numberMax"
                  // Revalidate against the minimum whenever it changes too,
                  // not just when the maximum itself is edited.
                  dependencies={['numberMin']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_rule, value) {
                        const min = getFieldValue('numberMin');
                        if (
                          value !== undefined &&
                          value !== null &&
                          min !== undefined &&
                          min !== null &&
                          value <= min
                        ) {
                          return Promise.reject(
                            new Error(
                              t(
                                'comp:BAIRuntimeVariantPresetSettingModal.NumberMaxMustExceedMin',
                              ),
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <AstryxFormNumberInput
                    label={t(
                      'comp:BAIRuntimeVariantPresetSettingModal.NumberMax',
                    )}
                  />
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
                      {fields.map(({ key, name, ...restField }) => (
                        <BAIFlex key={key} gap="xs" align="start">
                          <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            style={{ marginBottom: 0, flex: 1, minWidth: 0 }}
                            rules={[
                              {
                                required: true,
                                message: t(
                                  'comp:BAIRuntimeVariantPresetSettingModal.ChoiceValueRequired',
                                ),
                              },
                            ]}
                          >
                            <AstryxFormTextInput
                              label={t(
                                'comp:BAIRuntimeVariantPresetSettingModal.ChoiceValue',
                              )}
                              placeholder={t(
                                'comp:BAIRuntimeVariantPresetSettingModal.ChoiceValuePlaceholder',
                              )}
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'label']}
                            style={{ marginBottom: 0, flex: 1, minWidth: 0 }}
                            rules={[
                              {
                                required: true,
                                message: t(
                                  'comp:BAIRuntimeVariantPresetSettingModal.ChoiceLabelRequired',
                                ),
                              },
                            ]}
                          >
                            <AstryxFormTextInput
                              label={t(
                                'comp:BAIRuntimeVariantPresetSettingModal.ChoiceLabel',
                              )}
                              placeholder={t(
                                'comp:BAIRuntimeVariantPresetSettingModal.ChoiceLabelPlaceholder',
                              )}
                            />
                          </Form.Item>
                          <BAIButton
                            type="text"
                            danger
                            icon={<Trash2 />}
                            aria-label={t('general.button.Delete')}
                            style={{ flexShrink: 0 }}
                            onClick={() => remove(name)}
                          />
                        </BAIFlex>
                      ))}
                      <BAIButton
                        type="dashed"
                        icon={<PlusIcon />}
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
                <AstryxFormTextInput
                  label={t(
                    'comp:BAIRuntimeVariantPresetSettingModal.TextPlaceholderLabel',
                  )}
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
            <AstryxFormSwitch
              label={t('comp:BAIRuntimeVariantPresetSettingModal.Required')}
            />
          </Form.Item>
        ) : null}
        {preset ? (
          <Form.Item
            label={t('comp:BAIRuntimeVariantPresetSettingModal.Rank')}
            name="rank"
            tooltip={t('comp:BAIRuntimeVariantPresetSettingModal.RankTooltip')}
          >
            {/* PILOT-DECISION (to-astryx final-B): antd `InputNumber
                precision={0}` -> `AstryxFormNumberInput step={1}`. Astryx's
                `NumberInput` has no display-precision knob; `step={1}` is the
                integer contract the field actually wants (rank is an ordinal),
                and the mutation input is an `Int` the server rejects a
                fraction for either way. `style={{ width: '100%' }}` is dropped
                because the adapter already defaults `width` to `'100%'`. */}
            <AstryxFormNumberInput
              label={t('comp:BAIRuntimeVariantPresetSettingModal.Rank')}
              min={0}
              step={1}
            />
          </Form.Item>
        ) : null}
      </Form>
    </BAIModal>
  );
};

export default BAIRuntimeVariantPresetSettingModal;
