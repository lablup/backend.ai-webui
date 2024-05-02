import {
  addNumberWithUnits,
  compareNumberWithUnits,
  iSizeToSize,
} from '../helper';
import { useCurrentProjectValue, useSuspendedBackendaiClient } from '../hooks';
import { useResourceSlots } from '../hooks/backendai';
import { useCurrentKeyPairResourcePolicyLazyLoadQuery } from '../hooks/hooksUsingRelay';
import { useEventNotStable } from '../hooks/useEventNotStable';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import DynamicUnitInputNumberWithSlider from './DynamicUnitInputNumberWithSlider';
import Flex from './Flex';
import { ImageEnvironmentFormInput } from './ImageEnvironmentSelectFormItems';
import InputNumberWithSlider from './InputNumberWithSlider';
import ResourceGroupSelect from './ResourceGroupSelect';
import { ACCELERATOR_UNIT_MAP } from './ResourceNumber';
import ResourcePresetSelect from './ResourcePresetSelect';
import { CaretDownOutlined } from '@ant-design/icons';
import {
  Card,
  Col,
  Divider,
  Form,
  Radio,
  Row,
  Select,
  Switch,
  theme,
} from 'antd';
import _ from 'lodash';
import React, { useEffect, useMemo, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const AUTOMATIC_DEFAULT_SHMEM = '64m';
export const RESOURCE_ALLOCATION_INITIAL_FORM_VALUES = {
  resource: {
    cpu: 0,
    mem: '0g',
    shmem: '0g',
    accelerator: 0,
  },
  num_of_sessions: 1,
  cluster_mode: 'single-node',
  cluster_size: 1,
  enabledAutomaticShmem: true,
};

export interface ResourceAllocationFormValue {
  resource: {
    cpu: number;
    mem: string;
    shmem: string;
    accelerator: number;
    acceleratorType: string;
  };
  resourceGroup: string;
  num_of_sessions?: number;
  cluster_mode: 'single-node' | 'multi-node';
  cluster_size: number;
  enabledAutomaticShmem: boolean;
  allocationPreset?: string;
}

type MergedResourceAllocationFormValue = ResourceAllocationFormValue &
  ImageEnvironmentFormInput;

interface ResourceAllocationFormItemsProps {
  enableNumOfSessions?: boolean;
  enableResourcePresets?: boolean;
  forceImageMinValues?: boolean;
}

const ResourceAllocationFormItems: React.FC<
  ResourceAllocationFormItemsProps
> = ({
  enableNumOfSessions,
  enableResourcePresets,
  forceImageMinValues = false,
}) => {
  const form = Form.useFormInstance<MergedResourceAllocationFormValue>();
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const baiClient = useSuspendedBackendaiClient();
  const [resourceSlots] = useResourceSlots();

  const [{ keypairResourcePolicy, sessionLimitAndRemaining }] =
    useCurrentKeyPairResourcePolicyLazyLoadQuery();

  const currentProject = useCurrentProjectValue();

  const [isPendingCheckResets, startCheckRestsTransition] = useTransition();
  const currentImage = Form.useWatch(['environments', 'image'], {
    form,
    preserve: true,
  });
  const currentResourceGroup = Form.useWatch('resourceGroup', {
    form,
    preserve: true,
  });
  const [{ currentImageMinM, remaining, resourceLimits, checkPresetInfo }] =
    useResourceLimitAndRemaining({
      currentProjectName: currentProject.name,
      currentResourceGroup: currentResourceGroup,
      currentImage: currentImage,
    });

  const acceleratorSlots = _.omitBy(resourceSlots, (value, key) => {
    if (['cpu', 'mem', 'shmem'].includes(key)) return true;

    if (
      !resourceLimits.accelerators[key]?.max ||
      resourceLimits.accelerators[key]?.max === 0
    )
      return true;
    return false;
  });

  const currentImageAcceleratorLimits = _.filter(
    currentImage?.resource_limits,
    (limit) =>
      limit ? !_.includes(['cpu', 'mem', 'shmem'], limit.key) : false,
  );

  const sessionSliderLimitAndRemaining = {
    min: 1,
    max: sessionLimitAndRemaining.max,
    remaining: sessionLimitAndRemaining.remaining,
  };

  const allocatablePresetNames = useMemo(() => {
    const byPresetInfo = _.filter(checkPresetInfo?.presets, (preset) => {
      return preset.allocatable;
    }).map((preset) => preset.name);

    const bySliderLimit = _.filter(checkPresetInfo?.presets, (preset) => {
      if (
        typeof preset.resource_slots.mem === 'string' &&
        typeof resourceLimits.mem?.max === 'string' &&
        compareNumberWithUnits(
          preset.resource_slots.mem,
          resourceLimits.mem?.max,
        ) > 0
      ) {
        return false;
      }
      if (
        typeof preset.resource_slots.cpu === 'number' &&
        typeof resourceLimits.cpu?.max === 'number' &&
        preset.resource_slots.cpu > resourceLimits.cpu?.max
      ) {
        return false;
      }
      const acceleratorKeys = _.keys(
        _.omit(preset.resource_slots, ['mem', 'cpu', 'shmem']),
      );
      const isAvailable = _.every(acceleratorKeys, (key) => {
        if (
          key &&
          typeof preset.resource_slots[key] === 'string' &&
          typeof resourceLimits.accelerators[key]?.max === 'number' &&
          _.toNumber(preset.resource_slots[key]) >
            _.toNumber(resourceLimits.accelerators[key]?.max)
        ) {
          return false;
        }
        return true;
      });
      return isAvailable;
    }).map((preset) => preset.name);

    const byImageAcceleratorLimits = _.filter(
      checkPresetInfo?.presets,
      (preset) => {
        const acceleratorResourceOfPreset = _.omitBy(
          preset.resource_slots,
          (value, key) => {
            if (['mem', 'cpu', 'shmem'].includes(key) || value === '0')
              return true;
          },
        );
        if (currentImageAcceleratorLimits.length === 0) {
          if (_.isEmpty(acceleratorResourceOfPreset)) {
            return true;
          } else {
            return false;
          }
        }

        return _.some(currentImageAcceleratorLimits, (limit) => {
          return _.some(acceleratorResourceOfPreset, (value, key) => {
            return (
              limit?.key === key && _.toNumber(value) >= _.toNumber(limit?.min)
            );
          });
        });
      },
    ).map((preset) => preset.name);

    return currentImageAcceleratorLimits.length > 0
      ? baiClient._config?.always_enqueue_compute_session
        ? bySliderLimit
        : byPresetInfo
      : _.intersection(
          baiClient._config?.always_enqueue_compute_session
            ? bySliderLimit
            : byPresetInfo,
          byImageAcceleratorLimits,
        );
  }, [
    baiClient._config?.always_enqueue_compute_session,
    checkPresetInfo?.presets,
    resourceLimits.accelerators,
    resourceLimits.cpu?.max,
    resourceLimits.mem?.max,
    currentImageAcceleratorLimits,
  ]);

  const updateAllocationPresetBasedOnResourceGroup = useEventNotStable(() => {
    if (
      _.includes(
        ['custom', 'minimum-required'],
        form.getFieldValue('allocationPreset'),
      )
    ) {
    } else {
      if (
        allocatablePresetNames.includes(form.getFieldValue('allocationPreset'))
      ) {
        // if the current preset is available in the current resource group, do nothing.
      } else if (allocatablePresetNames[0]) {
        const autoSelectedPreset = _.sortBy(allocatablePresetNames, 'name')[0];
        form.setFieldsValue({
          allocationPreset: autoSelectedPreset,
        });
        updateResourceFieldsBasedOnPreset(autoSelectedPreset);
      } else {
        form.setFieldsValue({
          allocationPreset: 'custom',
        });
      }
    }
    // monkey patch for the issue that the validation result is not updated when the resource group is changed.
    setTimeout(() => {
      form.validateFields().catch(() => {});
    }, 200);
  });

  // update allocation preset based on resource group and current image
  useEffect(() => {
    currentResourceGroup && updateAllocationPresetBasedOnResourceGroup();
  }, [
    currentResourceGroup,
    updateAllocationPresetBasedOnResourceGroup,
    currentImage,
  ]);

  const updateResourceFieldsBasedOnImage = (force?: boolean) => {
    // when image changed, set value of resources to min value only if it's larger than current value
    const minimumResources: Partial<ResourceAllocationFormValue['resource']> = {
      cpu: resourceLimits.cpu?.min,
      mem:
        iSizeToSize(
          (iSizeToSize(resourceLimits.shmem?.min, 'm')?.number || 0) +
            (iSizeToSize(resourceLimits.mem?.min, 'm')?.number || 0) +
            'm',
          'g',
        )?.number + 'g', //to prevent loosing precision
    };

    // NOTE: accelerator value setting is done inside the conditional statement
    if (currentImageAcceleratorLimits.length > 0) {
      if (
        _.find(
          currentImageAcceleratorLimits,
          (limit) =>
            limit?.key === form.getFieldValue(['resource', 'acceleratorType']),
        )
      ) {
        // if current selected accelerator type is supported in the selected image,
        minimumResources.acceleratorType = form.getFieldValue([
          'resource',
          'acceleratorType',
        ]);
        minimumResources.accelerator =
          resourceLimits.accelerators[
            form.getFieldValue(['resource', 'acceleratorType'])
          ]?.min;
      } else {
        // if current selected accelerator type is not supported in the selected image,
        // change accelerator type to the first supported accelerator type.
        const nextImageSelectorType: string | undefined | null = // NOTE:
          // filter from resourceSlots since resourceSlots and supported image could be non-identical.
          // resourceSlots returns "all resources enable to allocate(including AI accelerator)"
          // imageAcceleratorLimit returns "all resources that is supported in the selected image"
          _.filter(currentImageAcceleratorLimits, (acceleratorInfo: any) =>
            _.keys(resourceSlots).includes(acceleratorInfo?.key),
          )[0]?.key;

        if (nextImageSelectorType) {
          minimumResources.accelerator =
            resourceLimits.accelerators[nextImageSelectorType]?.min;
          minimumResources.acceleratorType = nextImageSelectorType;
        }
      }
    } else {
      minimumResources.accelerator = 0;
    }

    if (!forceImageMinValues && !force) {
      // delete keys that is not less than current value
      (['cpu', 'accelerator'] as const).forEach((key) => {
        const minNum = minimumResources[key];
        if (
          _.isNumber(minNum) &&
          minNum < form.getFieldValue(['resource', key])
        ) {
          delete minimumResources[key];
        }
      });
      (['mem', 'shmem'] as const).forEach((key) => {
        const minNumStr = minimumResources[key];
        if (
          _.isString(minNumStr) &&
          compareNumberWithUnits(
            minNumStr,
            form.getFieldValue(['resource', key]),
          ) < 0
        ) {
          delete minimumResources[key];
        }
      });
    }

    form.setFieldsValue({
      resource: {
        ...minimumResources,
      },
    });

    // set to 0 when currentImage doesn't support any AI accelerator
    if (currentImage && currentImageAcceleratorLimits.length === 0) {
      form.setFieldValue(['resource', 'accelerator'], 0);
    }

    if (form.getFieldValue('enabledAutomaticShmem')) {
      runShmemAutomationRule(form.getFieldValue(['resource', 'mem']) || '0g');
    }
    form.validateFields(['resource']).catch(() => {});
  };

  useEffect(() => {
    updateResourceFieldsBasedOnImage();
    // When the currentImage is changed, execute the latest updateResourceFieldsBasedOnImage function.
    // So we don't need to add `updateResourceFieldsBasedOnImage` to the dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage]);

  const updateResourceFieldsBasedOnPreset = (name: string) => {
    const preset = _.find(
      checkPresetInfo?.presets,
      (preset) => preset.name === name,
    );
    const slots = _.pick(preset?.resource_slots, _.keys(resourceSlots));
    const mem = iSizeToSize((slots?.mem || 0) + 'b', 'g', 2)?.numberUnit;
    const acceleratorObj = _.omit(slots, ['cpu', 'mem', 'shmem']);

    // Select the first matched AI accelerator type and value
    const firstMatchedAcceleratorType = _.find(
      _.keys(acceleratorSlots),
      (value) => acceleratorObj[value] !== undefined,
    );

    let acceleratorSetting: {
      acceleratorType?: string;
      accelerator: number;
    } = {
      accelerator: 0,
    };
    if (firstMatchedAcceleratorType) {
      acceleratorSetting = {
        acceleratorType: firstMatchedAcceleratorType,
        accelerator: Number(acceleratorObj[firstMatchedAcceleratorType] || 0),
      };
    }
    form.setFieldsValue({
      resource: {
        // ...slots,
        ...acceleratorSetting,
        // transform to GB based on preset values
        mem,
        shmem: iSizeToSize((preset?.shared_memory || 0) + 'b', 'g', 2)
          ?.numberUnit,
        cpu: parseInt(slots?.cpu || '0') || 0,
      },
    });
    runShmemAutomationRule(mem || '0g');
  };

  const runShmemAutomationRule = (M_plus_S: string) => {
    // if M+S > 4G, S can be 1G regard to current image's minimum mem(M)
    if (
      // M+S > 4G
      compareNumberWithUnits(M_plus_S, '4g') >= 0 &&
      // M+S > M+1G
      compareNumberWithUnits(
        M_plus_S,
        addNumberWithUnits(currentImageMinM, '1g') || '0b',
      ) >= 0 &&
      // if 1G < AUTOMATIC_DEFAULT_SHMEM, no need to apply 1G rule
      compareNumberWithUnits('1g', AUTOMATIC_DEFAULT_SHMEM) > 0
    ) {
      form.setFieldValue(['resource', 'shmem'], '1g');
    } else {
      form.setFieldValue(['resource', 'shmem'], AUTOMATIC_DEFAULT_SHMEM);
    }
  };

  return (
    <>
      <Form.Item
        name="resourceGroup"
        label={t('session.ResourceGroup')}
        rules={[
          {
            required: true,
          },
        ]}
        // Set the trigger to something not used event to manually handle updates for the granular pending status management.
        trigger={'onSubmit'}
      >
        <ResourceGroupSelect
          showSearch
          loading={isPendingCheckResets}
          onChange={(v) => {
            startCheckRestsTransition(() => {
              // update manually to handle granular pending status management
              form.setFieldValue('resourceGroup', v);
              form.validateFields(['resourceGroup']).catch(() => {});
            });
          }}
        />
      </Form.Item>

      {enableResourcePresets ? (
        <Form.Item
          label={t('resourcePreset.ResourcePresets')}
          name="allocationPreset"
          required
          style={{ marginBottom: token.marginXS }}
        >
          <ResourcePresetSelect
            showCustom
            showMinimumRequired
            onChange={(value, options) => {
              switch (value) {
                case 'custom':
                  break;
                case 'minimum-required':
                  form.setFieldValue('enabledAutomaticShmem', true);
                  updateResourceFieldsBasedOnImage(true);
                  break;
                default:
                  form.setFieldValue('enabledAutomaticShmem', true);
                  updateResourceFieldsBasedOnPreset(value);
                  break;
              }
            }}
            allocatablePresetNames={allocatablePresetNames}
          />
        </Form.Item>
      ) : null}
      <Card
        style={{
          marginBottom: token.margin,
        }}
      >
        <Form.Item
          shouldUpdate={(prev, cur) =>
            prev.allocationPreset !== cur.allocationPreset
          }
          noStyle
        >
          {({ getFieldValue }) => {
            return (
              // getFieldValue('allocationPreset') === 'custom' && (
              <>
                {resourceSlots?.cpu && (
                  <Form.Item
                    name={['resource', 'cpu']}
                    // initialValue={0}
                    label={t('session.launcher.CPU')}
                    tooltip={{
                      placement: 'right',
                      title: <Trans i18nKey={'session.launcher.DescCPU'} />,
                    }}
                    required
                    rules={[
                      {
                        required: true,
                      },
                      {
                        type: 'number',
                        min: resourceLimits.cpu?.min,
                        // TODO: set message
                      },
                      {
                        warningOnly:
                          baiClient._config?.always_enqueue_compute_session,
                        validator: async (rule, value: number) => {
                          if (
                            _.isNumber(remaining.cpu) &&
                            value > remaining.cpu
                          ) {
                            return Promise.reject(
                              baiClient._config?.always_enqueue_compute_session
                                ? t(
                                    'session.launcher.EnqueueComputeSessionWarning',
                                    {
                                      amount: remaining.cpu,
                                    },
                                  )
                                : t(
                                    'session.launcher.ErrorCanNotExceedRemaining',
                                    {
                                      amount: remaining.cpu,
                                    },
                                  ),
                            );
                          } else {
                            return Promise.resolve();
                          }
                        },
                      },
                    ]}
                  >
                    <InputNumberWithSlider
                      inputNumberProps={{
                        addonAfter: t('session.launcher.Core'),
                      }}
                      sliderProps={{
                        marks: {
                          // remaining mark code should be located before max mark code to prevent overlapping when it is same value
                          ...(remaining.cpu
                            ? {
                                [remaining.cpu]: {
                                  label: <RemainingMark />,
                                },
                              }
                            : {}),
                          ...(resourceLimits.cpu?.min
                            ? {
                                [resourceLimits.cpu?.min]:
                                  resourceLimits.cpu?.min,
                              }
                            : {}),
                          ...(resourceLimits.cpu?.max
                            ? {
                                [resourceLimits.cpu?.max]: {
                                  style: {
                                    color: token.colorTextSecondary,
                                  },
                                  label: resourceLimits.cpu?.max,
                                },
                              }
                            : {}),
                        },
                      }}
                      min={resourceLimits.cpu?.min}
                      max={resourceLimits.cpu?.max}
                      step={1}
                      onChange={() => {
                        form.setFieldValue('allocationPreset', 'custom');
                      }}
                    />
                  </Form.Item>
                )}
                {resourceSlots?.mem && (
                  <Form.Item
                    label={t('session.launcher.Memory')}
                    tooltip={{
                      placement: 'right',
                      props: {
                        onClick: (e: any) => e.preventDefault(),
                      },
                      title: (
                        <Flex
                          direction="column"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Trans i18nKey={'session.launcher.DescMemory'} />
                          {/* <Divider
                            style={{
                              margin: 0,
                              backgroundColor: token.colorBorderSecondary,
                            }}
                          />
                         
                          <Trans
                            i18nKey={'session.launcher.DescSharedMemory'}
                          /> */}
                        </Flex>
                      ),
                    }}
                    required
                  >
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, next) =>
                        prev.resource.shmem !== next.resource.shmem
                      }
                    >
                      {() => {
                        return (
                          <Form.Item
                            name={['resource', 'mem']}
                            noStyle
                            rules={[
                              {
                                required: true,
                              },
                              {
                                // TODO: min of mem should be shmem + image's mem limit??
                                validator: async (rule, value: string) => {
                                  // const memMinPlusShmem =
                                  //   addNumberWithUnits(
                                  //     resourceLimits.mem?.min,
                                  //     form.getFieldValue(['resource', 'shmem']),
                                  //   ) || '0b';

                                  if (
                                    !_.isElement(value) &&
                                    resourceLimits.mem?.min &&
                                    compareNumberWithUnits(
                                      value,
                                      resourceLimits.mem?.min || '0g',
                                    ) < 0
                                  ) {
                                    return Promise.reject(
                                      t('session.launcher.MinMemory', {
                                        size: _.toUpper(
                                          resourceLimits.mem?.min || '0g',
                                        ),
                                      }),
                                    );
                                  } else {
                                    return Promise.resolve();
                                  }
                                },
                              },
                              {
                                warningOnly:
                                  baiClient._config
                                    ?.always_enqueue_compute_session,
                                validator: async (rule, value: string) => {
                                  if (
                                    !_.isElement(value) &&
                                    resourceLimits.mem &&
                                    compareNumberWithUnits(
                                      value,
                                      remaining.mem + 'b',
                                    ) > 0
                                  ) {
                                    return Promise.reject(
                                      baiClient._config
                                        ?.always_enqueue_compute_session
                                        ? t(
                                            'session.launcher.EnqueueComputeSessionWarning',
                                            {
                                              amount:
                                                iSizeToSize(
                                                  remaining.mem + 'b',
                                                  'g',
                                                  3,
                                                )?.numberUnit + 'iB',
                                            },
                                          )
                                        : t(
                                            'session.launcher.ErrorCanNotExceedRemaining',
                                            {
                                              amount:
                                                iSizeToSize(
                                                  remaining.mem + 'b',
                                                  'g',
                                                  3,
                                                )?.numberUnit + 'iB',
                                            },
                                          ),
                                    );
                                  } else {
                                    return Promise.resolve();
                                  }
                                },
                              },
                            ]}
                          >
                            <DynamicUnitInputNumberWithSlider
                              max={resourceLimits.mem?.max}
                              // min="256m"
                              // min={'0g'}
                              // min={addNumberWithUnits(
                              //   resourceLimits.mem?.min,
                              //   form.getFieldValue(['resource', 'shmem']) || '0g',
                              // )}
                              min={resourceLimits.mem?.min}
                              // warn={
                              //   checkPresetInfo?.scaling_group_remaining.mem ===
                              //   undefined
                              //     ? undefined
                              //     : checkPresetInfo?.scaling_group_remaining.mem + 'g'
                              // }
                              addonBefore={'MEM'}
                              extraMarks={{
                                // ...(checkPresetInfo?.scaling_group_remaining.mem
                                //   ? {
                                //       // @ts-ignore
                                //       [iSizeToSize(
                                //         checkPresetInfo?.scaling_group_remaining
                                //           .mem,
                                //         'g',
                                //         3,
                                //       ).numberFixed]: {
                                //         label: '-',
                                //       },
                                //     }
                                //   : {}),
                                // ...(form.getFieldValue(['resource', 'shmem'])
                                //   ? {
                                //       [iSizeToSize(
                                //         form.getFieldValue([
                                //           'resource',
                                //           'shmem',
                                //         ]),
                                //         'g',
                                //       )?.number || 0]: (
                                //         <Flex
                                //           style={{
                                //             height: 8,
                                //             width: 8,
                                //             borderRadius: 4,
                                //             backgroundColor: token.colorInfo,
                                //             position: 'absolute',
                                //             top: -10,
                                //             transform: 'translateX(-50%)',
                                //             opacity: 0.5,
                                //             pointerEvents: 'none',
                                //           }}
                                //         ></Flex>
                                //       ),
                                //     }
                                //   : undefined),
                                ...(remaining.mem
                                  ? {
                                      //@ts-ignore
                                      [iSizeToSize(remaining.mem + 'b', 'g', 3)
                                        ?.numberFixed]: {
                                        label: <RemainingMark />,
                                      },
                                    }
                                  : {}),
                              }}
                              onChange={(M_plus_S) => {
                                if (
                                  !M_plus_S ||
                                  !form.getFieldValue('enabledAutomaticShmem')
                                )
                                  return;
                                runShmemAutomationRule(M_plus_S);

                                form.setFieldValue(
                                  'allocationPreset',
                                  'custom',
                                );
                              }}
                            />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>

                    <Flex direction="column" gap={'xxs'} align="start">
                      <Flex direction="row" gap={'xs'}>
                        {t('session.launcher.EnableAutomaticMiniumShmem')}{' '}
                        <Form.Item
                          noStyle
                          name={'enabledAutomaticShmem'}
                          valuePropName="checked"
                        >
                          <Switch
                            size="small"
                            onChange={(checked) => {
                              if (checked) {
                                runShmemAutomationRule(
                                  form.getFieldValue(['resource', 'mem']) ||
                                    '0g',
                                );
                              }
                              form.setFieldValue('allocationPreset', 'custom');
                            }}
                          />
                        </Form.Item>
                      </Flex>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, next) =>
                          prev.resource.mem !== next.resource.mem ||
                          prev.enabledAutomaticShmem !==
                            next.enabledAutomaticShmem
                        }
                      >
                        {() => {
                          return (
                            <Form.Item
                              noStyle
                              name={['resource', 'shmem']}
                              // initialValue={'0g'}
                              // label={t('session.launcher.SharedMemory')}
                              hidden={form.getFieldValue(
                                'enabledAutomaticShmem',
                              )}
                              tooltip={
                                <Trans
                                  i18nKey={'session.launcher.DescSharedMemory'}
                                />
                              }
                              dependencies={[['resource', 'mem']]}
                              rules={[
                                {
                                  required: true,
                                },
                                {},
                                {
                                  validator: async (rule, value: string) => {
                                    if (
                                      _.isEmpty(
                                        getFieldValue('resource')?.mem,
                                      ) ||
                                      _.isEmpty(value) ||
                                      compareNumberWithUnits(
                                        getFieldValue('resource')?.mem,
                                        value,
                                      ) >= 0
                                    ) {
                                      return Promise.resolve();
                                    } else {
                                      throw t(
                                        'resourcePreset.SHMEMShouldBeSmallerThanMemory',
                                      );
                                    }
                                  },
                                },
                              ]}
                            >
                              <DynamicUnitInputNumberWithSlider
                                // shmem max is mem max
                                // min={resourceLimits.shmem?.min}
                                min={resourceLimits.shmem?.min}
                                // max={resourceLimits.mem?.max || '0g'}
                                addonBefore={'SHM'}
                                max={
                                  form.getFieldValue(['resource', 'mem']) ||
                                  '0g'
                                }
                                hideSlider
                                onChange={() => {
                                  form.setFieldValue(
                                    'allocationPreset',
                                    'custom',
                                  );
                                }}
                              />
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                )}
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, next) => {
                    return (
                      prev.resource?.acceleratorType !==
                        next.resource?.acceleratorType ||
                      // ref: https://github.com/lablup/backend.ai-webui/issues/868
                      // change gpu step to 1 when cluster_size > 1
                      prev.cluster_size !== next.cluster_size
                    );
                  }}
                >
                  {({ getFieldValue }) => {
                    const currentAcceleratorType = getFieldValue([
                      'resource',
                      'acceleratorType',
                    ]);
                    return (
                      <Form.Item
                        name={['resource', 'accelerator']}
                        label={t(`session.launcher.AIAccelerator`)}
                        tooltip={{
                          placement: 'right',
                          title: (
                            <Trans
                              i18nKey={'session.launcher.DescAIAccelerator'}
                            />
                          ),
                        }}
                        rules={[
                          {
                            required: currentImageAcceleratorLimits.length > 0,
                          },
                          {
                            type: 'number',
                            min:
                              resourceLimits.accelerators[
                                currentAcceleratorType
                              ]?.min || 0,
                            max: resourceLimits.accelerators[
                              currentAcceleratorType
                            ]?.max,
                          },
                          {
                            validator: async (rule: any, value: number) => {
                              if (
                                _.endsWith(currentAcceleratorType, 'shares') &&
                                form.getFieldValue('cluster_size') >= 2 &&
                                value % 1 !== 0
                              ) {
                                return Promise.reject(
                                  t(
                                    'session.launcher.OnlyAllowsDiscreteNumberByClusterSize',
                                  ),
                                );
                              } else {
                                return Promise.resolve();
                              }
                            },
                          },
                          {
                            warningOnly:
                              baiClient._config?.always_enqueue_compute_session,
                            validator: async (rule: any, value: number) => {
                              if (
                                _.isNumber(
                                  remaining.accelerators[
                                    currentAcceleratorType
                                  ],
                                ) &&
                                value >
                                  remaining.accelerators[currentAcceleratorType]
                              ) {
                                return Promise.reject(
                                  baiClient._config
                                    ?.always_enqueue_compute_session
                                    ? t(
                                        'session.launcher.EnqueueComputeSessionWarning',
                                        {
                                          amount:
                                            remaining.accelerators[
                                              currentAcceleratorType
                                            ],
                                        },
                                      )
                                    : t(
                                        'session.launcher.ErrorCanNotExceedRemaining',
                                        {
                                          amount:
                                            remaining.accelerators[
                                              currentAcceleratorType
                                            ],
                                        },
                                      ),
                                );
                              } else {
                                return Promise.resolve();
                              }
                            },
                          },
                        ]}
                      >
                        <InputNumberWithSlider
                          sliderProps={{
                            marks: {
                              0: 0,
                              // remaining mark code should be located before max mark code to prevent overlapping when it is same value
                              ...(remaining.accelerators[currentAcceleratorType]
                                ? {
                                    [remaining.accelerators[
                                      currentAcceleratorType
                                    ]]: {
                                      label: <RemainingMark />,
                                    },
                                  }
                                : {}),
                              ...(_.isNumber(
                                resourceLimits.accelerators[
                                  currentAcceleratorType
                                ]?.max,
                              )
                                ? {
                                    // @ts-ignore
                                    [resourceLimits.accelerators[
                                      currentAcceleratorType
                                    ]?.max]:
                                      resourceLimits.accelerators[
                                        currentAcceleratorType
                                      ]?.max,
                                  }
                                : {}),
                            },
                            tooltip: {
                              formatter: (value = 0) => {
                                return `${value} ${ACCELERATOR_UNIT_MAP[currentAcceleratorType]}`;
                              },
                              open:
                                currentImageAcceleratorLimits.length <= 0
                                  ? false
                                  : undefined,
                            },
                          }}
                          disabled={
                            currentImageAcceleratorLimits.length === 0 &&
                            _.isEmpty(
                              form.getFieldValue(['environments', 'manual']),
                            )
                          }
                          min={0}
                          max={
                            resourceLimits.accelerators[currentAcceleratorType]
                              ?.max
                          }
                          step={
                            _.endsWith(currentAcceleratorType, 'shares') &&
                            form.getFieldValue('cluster_size') < 2
                              ? 0.1
                              : 1
                          }
                          onChange={() => {
                            form.setFieldValue('allocationPreset', 'custom');
                          }}
                          inputNumberProps={{
                            addonAfter: (
                              <Form.Item
                                noStyle
                                name={['resource', 'acceleratorType']}
                                initialValue={_.keys(acceleratorSlots)[0]}
                              >
                                <Select
                                  tabIndex={-1}
                                  disabled={
                                    currentImageAcceleratorLimits.length ===
                                      0 &&
                                    _.isEmpty(
                                      form.getFieldValue([
                                        'environments',
                                        'manual',
                                      ]),
                                    )
                                  }
                                  suffixIcon={
                                    _.size(acceleratorSlots) > 1
                                      ? undefined
                                      : null
                                  }
                                  // open={
                                  //   _.size(acceleratorSlots) > 1
                                  //     ? undefined
                                  //     : false
                                  // }
                                  popupMatchSelectWidth={false}
                                  options={_.map(
                                    acceleratorSlots,
                                    (value, name) => {
                                      return {
                                        value: name,
                                        label:
                                          ACCELERATOR_UNIT_MAP[name] || 'UNIT',
                                        disabled:
                                          currentImageAcceleratorLimits.length >
                                            0 &&
                                          !_.find(
                                            currentImageAcceleratorLimits,
                                            (limit) => limit?.key === name,
                                          ),
                                      };
                                    },
                                  )}
                                />
                              </Form.Item>
                            ),
                          }}
                        />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </>
            );
          }}
        </Form.Item>
      </Card>
      {enableNumOfSessions ? (
        <Card
          style={{
            marginBottom: token.margin,
          }}
        >
          <Form.Item
            noStyle
            shouldUpdate={(prev, next) =>
              prev.cluster_size !== next.cluster_size
            }
          >
            {() => {
              return (
                <Form.Item
                  name={['num_of_sessions']}
                  label={t('webui.menu.Sessions')}
                  tooltip={<Trans i18nKey={'session.launcher.DescSession'} />}
                  required
                  rules={[
                    {
                      required: true,
                    },
                    {
                      warningOnly: true,
                      validator: async (rule, value: number) => {
                        if (
                          sessionSliderLimitAndRemaining &&
                          value > sessionSliderLimitAndRemaining.remaining
                        ) {
                          return Promise.reject(
                            t('session.launcher.EnqueueComputeSessionWarning', {
                              amount: sessionSliderLimitAndRemaining.remaining,
                            }),
                          );
                        } else {
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}
                >
                  <InputNumberWithSlider
                    inputNumberProps={{
                      addonAfter: '#',
                    }}
                    disabled={form.getFieldValue('cluster_size') > 1}
                    sliderProps={{
                      marks: {
                        [sessionSliderLimitAndRemaining?.min]:
                          sessionSliderLimitAndRemaining?.min,
                        // remaining mark code should be located before max mark code to prevent overlapping when it is same value
                        ...(sessionSliderLimitAndRemaining?.remaining
                          ? {
                              [sessionSliderLimitAndRemaining?.remaining]: {
                                label: <RemainingMark />,
                              },
                            }
                          : {}),
                        [sessionSliderLimitAndRemaining?.max]:
                          sessionSliderLimitAndRemaining?.max,
                      },
                    }}
                    min={sessionSliderLimitAndRemaining?.min}
                    max={sessionSliderLimitAndRemaining?.max}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Card>
      ) : null}
      {/* TODO: Support cluster mode */}
      {baiClient.supports('multi-container') && (
        // {false && (
        <Form.Item
          label={t('session.launcher.ClusterMode')}
          tooltip={
            <Flex direction="column" align="start">
              {t('session.launcher.SingleNode')}
              <Trans i18nKey={'session.launcher.DescSingleNode'} />
              <Divider style={{ backgroundColor: token.colorBorder }} />
              {t('session.launcher.MultiNode')}
              <Trans i18nKey={'session.launcher.DescMultiNode'} />
            </Flex>
          }
          required
        >
          <Card
            style={{
              marginBottom: token.margin,
            }}
          >
            <Row gutter={token.marginMD}>
              <Col xs={24}>
                {/* <Col xs={24} lg={12}> */}
                <Form.Item name={'cluster_mode'} required>
                  <Radio.Group
                    onChange={(e) => {
                      form.validateFields().catch(() => {});
                    }}
                  >
                    <Radio.Button value="single-node">
                      {t('session.launcher.SingleNode')}
                    </Radio.Button>
                    <Radio.Button value="multi-node">
                      {t('session.launcher.MultiNode')}
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, next) =>
                    prev.cluster_mode !== next.cluster_mode
                  }
                >
                  {() => {
                    const derivedClusterSizeMaxLimit = _.min([
                      resourceLimits.cpu?.max,
                      keypairResourcePolicy.max_containers_per_session,
                    ]);
                    const clusterUnit =
                      form.getFieldValue('cluster_mode') === 'single-node'
                        ? t('session.launcher.Container')
                        : t('session.launcher.Node');
                    return (
                      <Form.Item
                        name={'cluster_size'}
                        label={t('session.launcher.ClusterSize')}
                        required
                        rules={[
                          {
                            warningOnly:
                              baiClient._config?.always_enqueue_compute_session,
                            validator: async (rule, value: number) => {
                              const minCPU = _.min([
                                remaining.cpu,
                                keypairResourcePolicy.max_containers_per_session,
                              ]);
                              if (_.isNumber(minCPU) && value > minCPU) {
                                return Promise.reject(
                                  t(
                                    'session.launcher.EnqueueComputeSessionWarning',
                                    {
                                      amount: minCPU,
                                    },
                                  ),
                                );
                              } else {
                                return Promise.resolve();
                              }
                            },
                          },
                        ]}
                      >
                        <InputNumberWithSlider
                          min={1}
                          step={1}
                          // TODO: max cluster size
                          max={
                            _.isNumber(derivedClusterSizeMaxLimit)
                              ? derivedClusterSizeMaxLimit
                              : undefined
                          }
                          disabled={derivedClusterSizeMaxLimit === 1}
                          sliderProps={{
                            marks: {
                              1: '1',
                              // remaining mark code should be located before max mark code to prevent overlapping when it is same value
                              ...(remaining.cpu
                                ? {
                                    [remaining.cpu]: {
                                      label: <RemainingMark />,
                                    },
                                  }
                                : {}),
                              ...(_.isNumber(derivedClusterSizeMaxLimit)
                                ? {
                                    [derivedClusterSizeMaxLimit]:
                                      derivedClusterSizeMaxLimit,
                                  }
                                : {}),
                            },
                            tooltip: {
                              formatter: (value = 0) => {
                                return `${value} ${clusterUnit}`;
                              },
                            },
                          }}
                          inputNumberProps={{
                            addonAfter: clusterUnit,
                          }}
                          onChange={(value) => {
                            if (value > 1) {
                              form.setFieldValue('num_of_sessions', 1);
                            }
                          }}
                        />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form.Item>
      )}
    </>
  );
};

const RemainingMark: React.FC<{ title?: string }> = () => {
  const { token } = theme.useToken();
  return (
    <Flex
      style={{
        position: 'absolute',
        top: -24,
        transform: 'translateX(-50%)',
        color: token.colorSuccess,
        opacity: 0.5,
      }}
    >
      <CaretDownOutlined />
    </Flex>
  );
};

const MemoizedResourceAllocationFormItems = React.memo(
  ResourceAllocationFormItems,
);

export default MemoizedResourceAllocationFormItems;
