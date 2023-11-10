import { compareNumberWithUnits, iSizeToSize } from '../helper';
import { useCurrentProjectValue, useSuspendedBackendaiClient } from '../hooks';
import {
  useResourceSlots,
  useResourceSlotsByResourceGroup,
} from '../hooks/backendai';
import { useTanQuery } from '../hooks/reactQueryAlias';
import DynamicUnitInputNumberWithSlider from './DynamicUnitInputNumberWithSlider';
import {
  Image,
  ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import ResourceGroupSelect from './ResourceGroupSelect';
import { ACCELERATOR_UNIT_MAP } from './ResourceNumber';
import ResourcePresetSelect from './ResourcePresetSelect';
import SliderInputItem from './SliderInputFormItem';
import { Card, Form, FormRule, Select, theme } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const RESOURCE_ALLOCATION_INITIAL_FORM_VALUES = {
  resource: {
    cpu: 0,
    mem: '0g',
    shmem: '0g',
    accelerator: 0,
  },
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
}

type MergedResourceAllocationFormValue = ResourceAllocationFormValue &
  ImageEnvironmentFormInput;
const limitParser = (limit: string | undefined) => {
  if (limit === undefined) {
    return undefined;
  } else if (limit === 'Infinity') {
    return undefined;
  } else if (limit === 'NaN') {
    return undefined;
  } else {
    return _.toNumber(limit);
  }
};

const ResourceAllocationFormItems = () => {
  const form = Form.useFormInstance<MergedResourceAllocationFormValue>();
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const baiClient = useSuspendedBackendaiClient();
  const [resourceSlots] = useResourceSlots();
  const acceleratorSlots = _.omit(resourceSlots, ['cpu', 'mem', 'shmem']);

  const currentProject = useCurrentProjectValue();

  // Form watch
  // const currentResourceGroup = Form.useWatch('resourceGroup', {
  //   form,
  //   preserve: true,
  // });

  // use `useState` instead of `Form.useWatch` for handling `resourcePreset.check` pending state
  const [currentResourceGroup, setCurrentResourceGroup] = useState(
    form.getFieldValue('resourceGroup'),
  );
  const [isPendingCheckResets, startCheckRestsTransition] = useTransition();
  const currentImage = Form.useWatch(['environments', 'image'], {
    form,
    preserve: true,
  });
  const currentImageAcceleratorLimits = _.filter(
    currentImage?.resource_limits,
    (limit) =>
      limit ? !_.includes(['cpu', 'mem', 'shmem'], limit.key) : false,
  );

  const { data: checkPresetInfo } = useTanQuery<ResourceAllocation>({
    queryKey: ['check-resets', currentProject.name, currentResourceGroup],
    queryFn: () => {
      if (currentResourceGroup) {
        return baiClient.resourcePreset.check({
          group: currentProject.name,
          scaling_group: currentResourceGroup,
        });
      } else {
        return;
      }
    },
    staleTime: 0,
    suspense: !_.isEmpty(currentResourceGroup), //prevent flicking
  });

  // interface ResourceLimit {
  //   min: number | string;
  //   max: number | string;
  //   remaining?: number | string;
  // }

  // interface AcceleratorLimit {
  //   min: number;
  //   max: number;
  //   remaining: number;
  // }

  // type ResourceSlots = {
  //   cpu?: ResourceLimit;
  //   mem?: ResourceLimit;
  //   shmem?: {
  //     min: string | undefined;
  //   };
  // } & {
  //   [key in string]?: AcceleratorLimit | undefined;
  // };

  const sliderMinMax: any = {
    ...(resourceSlots?.cpu
      ? {
          cpu: {
            min: _.max([
              _.toNumber(
                _.find(currentImage?.resource_limits, (i) => i?.key === 'cpu')
                  ?.min || '0',
              ),
            ]),
            max: _.min([
              baiClient._config.maxCPUCoresPerContainer,
              limitParser(checkPresetInfo?.keypair_limits.cpu),
              limitParser(checkPresetInfo?.group_limits.cpu),
              // scaling group all cpu (using + remaining), string type
              !_.isEmpty(
                checkPresetInfo?.scaling_groups[currentResourceGroup]?.using
                  ?.cpu,
              ) &&
              !_.isEmpty(
                checkPresetInfo?.scaling_groups[currentResourceGroup]?.remaining
                  ?.cpu,
              )
                ? _.toNumber(
                    checkPresetInfo?.scaling_groups[currentResourceGroup]?.using
                      .cpu,
                  ) +
                  _.toNumber(
                    checkPresetInfo?.scaling_groups[currentResourceGroup]
                      ?.remaining.cpu,
                  )
                : undefined,
            ]),
            remaining:
              _.min([
                checkPresetInfo?.keypair_remaining.cpu,
                checkPresetInfo?.group_remaining.cpu,
                checkPresetInfo?.scaling_group_remaining.cpu,
              ]) ?? Number.MAX_SAFE_INTEGER,
          },
        }
      : {}),
    ...(resourceSlots?.mem
      ? {
          mem: {
            min:
              _.max([
                _.find(currentImage?.resource_limits, (i) => i?.key === 'mem')
                  ?.min,
              ]) || '0g',
            max:
              _.min([
                baiClient._config.maxMemoryPerContainer,
                limitParser(checkPresetInfo?.keypair_limits.mem) &&
                  iSizeToSize(
                    limitParser(checkPresetInfo?.keypair_limits.mem) + '',
                    'g',
                  )?.number,
                limitParser(checkPresetInfo?.group_limits.mem) &&
                  iSizeToSize(
                    limitParser(checkPresetInfo?.group_limits.mem) + '',
                    'g',
                  )?.number,
                // scaling group all mem (using + remaining), string type
                !_.isEmpty(
                  checkPresetInfo?.scaling_groups[currentResourceGroup]?.using
                    ?.mem,
                ) &&
                !_.isEmpty(
                  checkPresetInfo?.scaling_groups[currentResourceGroup]?.using
                    ?.mem,
                )
                  ? iSizeToSize(
                      _.toNumber(
                        checkPresetInfo?.scaling_groups[currentResourceGroup]
                          ?.using.mem,
                      ) +
                        _.toNumber(
                          checkPresetInfo?.scaling_groups[currentResourceGroup]
                            ?.remaining.mem,
                        ) +
                        'b',
                      'g',
                      2,
                    )?.numberFixed
                  : undefined,
              ]) + 'g',
            remaining:
              _.min([
                checkPresetInfo?.keypair_remaining.mem,
                checkPresetInfo?.group_remaining.mem,
                checkPresetInfo?.scaling_group_remaining.mem,
              ]) ?? Number.MAX_SAFE_INTEGER,
          },
          shmem: {
            min:
              _.max([
                _.find(currentImage?.resource_limits, (i) => i?.key === 'shmem')
                  ?.min,
              ]) || '0g',
            // shmem max is mem max
          },
        }
      : {}),
    ..._.reduce(
      acceleratorSlots,
      (result, value, key) => {
        const configName =
          {
            'cuda.device': 'maxCUDADevicesPerContainer',
            'cuda.shares': 'maxCUDASharesPerContainer',
            'rocm.device': 'maxROCMDevicesPerContainer',
            'tpu.device': 'maxTPUDevicesPerContainer',
            'ipu.device': 'maxIPUDevicesPerContainer',
            'atom.device': 'maxATOMDevicesPerContainer',
            'warboy.device': 'maxWarboyDevicesPerContainer',
          }[key] || 'cuda.device'; // FIXME: temporally `cuda.device` config, when undefined
        result[key] = {
          min:
            parseInt(
              _.filter(
                currentImageAcceleratorLimits,
                (supportedAcceleratorInfo) => {
                  return supportedAcceleratorInfo?.key === key;
                },
              )[0]?.min as string,
            ) || 0,
          //
          max: _.min([
            baiClient._config[configName] || 8,
            // scaling group all cpu (using + remaining), string type
            !_.isEmpty(
              // @ts-ignore
              checkPresetInfo?.scaling_groups[currentResourceGroup]?.using?.[
                key
              ],
            ) &&
            !_.isEmpty(
              // @ts-ignore
              checkPresetInfo?.scaling_groups[currentResourceGroup]
                ?.remaining?.[key],
            )
              ? _.toNumber(
                  // @ts-ignore
                  checkPresetInfo?.scaling_groups[currentResourceGroup]?.using[
                    key
                  ],
                ) +
                _.toNumber(
                  // @ts-ignore
                  checkPresetInfo?.scaling_groups[currentResourceGroup]
                    ?.remaining[key],
                )
              : undefined,
          ]),
          remaining:
            _.min([
              // @ts-ignore
              _.toNumber(checkPresetInfo?.keypair_remaining[key]),
              // @ts-ignore
              _.toNumber(checkPresetInfo?.group_remaining[key]),
              // @ts-ignore
              _.toNumber(checkPresetInfo?.scaling_group_remaining[key]),
            ]) ?? Number.MAX_SAFE_INTEGER,
        };
        return result;
      },
      {} as {
        [key: string]: {
          min: number;
          max: number;
          remaining: number;
        };
      },
    ),
    // ...(acceleratorSlots)
    // ..._.map(['cuda.device'], (key) => {
    //   return {
    //     [key]: {
    //       min: _.max([
    //         _.find(form.getFieldValue('image')?.resource_limits, key)?.min,
    //       ]),
    //       max: _.min([
    //         baiClient._config.max,
    //         _.toNumber(
    //           _.find(
    //             currentImage?.resource_limits,
    //             (i) => i?.key === 'cuda.device',
    //           )?.max || '0',
    //         ),
    //       ]),
    //     },
    //   };
    // }),
  };

  useEffect(() => {
    // when image changed, set value of resources to min value
    form.setFieldsValue({
      resource: {
        cpu: sliderMinMax.cpu?.min,
        mem: sliderMinMax.mem?.min,
        shmem: sliderMinMax.shmem?.min,
      },
    });

    if (currentImageAcceleratorLimits.length > 0) {
      if (
        _.find(
          currentImageAcceleratorLimits,
          (limit) =>
            limit?.key === form.getFieldValue(['resource', 'acceleratorType']),
        )
      ) {
        // if current selected accelerator type is supported in the selected image,
        form.setFieldValue(
          ['resource', 'accelerator'],
          sliderMinMax[form.getFieldValue(['resource', 'acceleratorType'])].min,
        );
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
          form.setFieldValue(
            ['resource', 'accelerator'],
            sliderMinMax[nextImageSelectorType].min,
          );
          form.setFieldValue(
            ['resource', 'acceleratorType'],
            nextImageSelectorType,
          );
        }
      }
    }

    form.validateFields().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage]);

  const remainingValidationRules: {
    [key: string]: FormRule;
  } = {
    cpu: {
      warningOnly: true,
      validator: async (rule, value: string) => {
        if (sliderMinMax.cpu && value > sliderMinMax.cpu.remaining) {
          return Promise.reject(
            t('session.launcher.EnqueueComputeSessionWarning'),
          );
        } else {
          return Promise.resolve();
        }
      },
    },
    mem: {
      warningOnly: true,
      validator: async (rule, value: string) => {
        if (
          !_.isElement(value) &&
          sliderMinMax.mem &&
          compareNumberWithUnits(value, sliderMinMax.mem.remaining + 'b') > 0
        ) {
          return Promise.reject(
            t('session.launcher.EnqueueComputeSessionWarning'),
          );
        } else {
          return Promise.resolve();
        }
      },
    },
    ..._.reduce(
      acceleratorSlots,
      (result, slot, slotKey) => {
        return {
          ...result,
          [slotKey]: {
            warningOnly: true,
            validator: async (rule: any, value: string) => {
              if (
                sliderMinMax[slotKey] &&
                value > sliderMinMax[slotKey].remaining
              ) {
                return Promise.reject(
                  t('session.launcher.EnqueueComputeSessionWarning'),
                );
              } else {
                return Promise.resolve();
              }
            },
          },
        };
      },
      {},
    ),
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
      >
        <ResourceGroupSelect
          autoSelectDefault
          loading={isPendingCheckResets}
          onChange={(v) => {
            startCheckRestsTransition(() => {
              setCurrentResourceGroup(v);
            });
          }}
        />
      </Form.Item>
      <Form.Item
        label={t('resourcePreset.ResourcePresets')}
        name="allocationPreset"
        required
        style={{ marginBottom: token.marginXS }}
      >
        <ResourcePresetSelect
          onChange={(value, options) => {
            const slots = _.pick(
              JSON.parse(options?.preset?.resource_slots || '{}'),
              _.keys(resourceSlots),
            );
            form.setFieldsValue({
              resource: {
                ...slots,
                // transform to GB based on preset values
                mem: iSizeToSize((slots?.mem || 0) + 'b', 'g', 2)?.numberUnit,
                shmem: iSizeToSize(
                  (options?.preset?.shared_memory || 0) + 'b',
                  'g',
                  2,
                )?.numberUnit,
              },
            });
          }}
        />
      </Form.Item>
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
                  <SliderInputItem
                    name={['resource', 'cpu']}
                    // initialValue={0}
                    label={t('session.launcher.CPU')}
                    tooltip={<Trans i18nKey={'session.launcher.DescCPU'} />}
                    // min={parseInt(
                    //   _.find(
                    //     currentImage?.resource_limits,
                    //     (i) => i?.key === 'cpu',
                    //   )?.min || '0',
                    // )}
                    // max={parseInt(
                    //   _.find(
                    //     currentImage?.resource_limits,
                    //     (i) => i?.key === 'cpu',
                    //   )?.max || '100',
                    // )}
                    inputNumberProps={{
                      addonAfter: t('session.launcher.Core'),
                    }}
                    sliderProps={{
                      marks: {
                        0: {
                          style: {
                            color: token.colorTextSecondary,
                          },
                          label: 0,
                        },
                        ...(sliderMinMax.cpu?.max
                          ? {
                              [sliderMinMax.cpu?.max]: {
                                style: {
                                  color: token.colorTextSecondary,
                                },
                                label: sliderMinMax.cpu?.max,
                              },
                            }
                          : {}),
                      },
                    }}
                    min={0}
                    max={sliderMinMax.cpu?.max}
                    required
                    rules={[
                      {
                        required: true,
                      },
                      {
                        type: 'number',
                        min: sliderMinMax.cpu?.min,
                        // TODO: set message
                      },
                      remainingValidationRules.cpu,
                    ]}
                  />
                )}
                {resourceSlots?.mem && (
                  <Form.Item
                    name={['resource', 'mem']}
                    label={t('session.launcher.Memory')}
                    tooltip={<Trans i18nKey={'session.launcher.DescMemory'} />}
                    rules={[
                      {
                        required: true,
                      },
                      {
                        validator: async (rule, value: string) => {
                          if (
                            compareNumberWithUnits(
                              value || '0b',
                              sliderMinMax.mem?.min,
                            ) < 0
                          ) {
                            return Promise.reject(
                              t('session.launcher.MinMemory', {
                                size: _.toUpper(sliderMinMax.mem?.min),
                              }),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                      remainingValidationRules.mem,
                      // {
                      //   warningOnly: true,
                      //   validator: async (rule, value: string) => {
                      //     if (
                      //       compareNumberWithUnits(
                      //         value || '0b',
                      //         checkPresetInfo?.keypair_remaining.mem + 'b',
                      //       ) > 0
                      //     ) {
                      //       return Promise.reject(
                      //         t(
                      //           'session.launcher.EnqueueComputeSessionWarning',
                      //         ),
                      //       );
                      //     }
                      //     return Promise.resolve();
                      //   },
                      // },
                    ]}
                  >
                    <DynamicUnitInputNumberWithSlider
                      max={sliderMinMax.mem?.max}
                      // min="256m"
                      min={'0g'}
                      // warn={
                      //   checkPresetInfo?.scaling_group_remaining.mem ===
                      //   undefined
                      //     ? undefined
                      //     : checkPresetInfo?.scaling_group_remaining.mem + 'g'
                      // }
                      extraMarks={
                        checkPresetInfo?.scaling_group_remaining.mem
                          ? {
                              // @ts-ignore
                              [iSizeToSize(
                                checkPresetInfo?.scaling_group_remaining.mem,
                                'g',
                                3,
                              ).numberFixed]: {
                                label: '-',
                              },
                            }
                          : undefined
                      }
                    />
                  </Form.Item>
                )}
                {resourceSlots?.mem && (
                  <Form.Item
                    name={['resource', 'shmem']}
                    // initialValue={'0g'}
                    label={t('session.launcher.SharedMemory')}
                    tooltip={
                      <Trans i18nKey={'session.launcher.DescSharedMemory'} />
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
                            _.isEmpty(getFieldValue('resource')?.mem) ||
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
                      min="0g"
                      max={sliderMinMax.mem?.max}
                    />
                  </Form.Item>
                )}
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, next) => {
                    return (
                      prev.resource?.acceleratorType !==
                      next.resource?.acceleratorType
                    );
                  }}
                >
                  {({ getFieldValue }) => {
                    const currentAcceleratorType = getFieldValue([
                      'resource',
                      'acceleratorType',
                    ]);
                    return (
                      <SliderInputItem
                        name={['resource', 'accelerator']}
                        // initialValue={0}
                        label={t(`session.launcher.AIAccelerator`)}
                        // tooltip={
                        //   <Trans i18nKey={'session.launcher.DescSharedMemory'} />
                        // }
                        sliderProps={{
                          marks: {
                            0: 0,
                          },
                        }}
                        min={0}
                        max={sliderMinMax[currentAcceleratorType]?.max}
                        step={
                          _.endsWith(currentAcceleratorType, 'shares') ? 0.1 : 1
                        }
                        inputNumberProps={{
                          addonAfter: (
                            <Form.Item
                              noStyle
                              name={['resource', 'acceleratorType']}
                              initialValue={_.keys(acceleratorSlots)[0]}
                            >
                              <Select
                                suffixIcon={
                                  _.size(acceleratorSlots) > 1
                                    ? undefined
                                    : null
                                }
                                open={
                                  _.size(acceleratorSlots) > 1
                                    ? undefined
                                    : false
                                }
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
                        required
                        rules={[
                          {
                            required: true,
                          },
                          {
                            type: 'number',
                            min: sliderMinMax[currentAcceleratorType]?.min || 0,
                          },
                          remainingValidationRules[currentAcceleratorType],
                        ]}
                      />
                    );
                  }}
                </Form.Item>
              </>
            );
          }}
        </Form.Item>
      </Card>
    </>
  );
};

type ResourceLimits = {
  cpu: string | 'Infinity' | 'NaN';
  mem: string | 'Infinity' | 'NaN';
  'cuda.device': string | 'Infinity' | 'NaN';
};
type ResourceUsing = ResourceLimits;
type ResourceRemaining = ResourceLimits;

type ResourceSlots = {
  cpu: string;
  mem: string;
  'cuda.device': string;
  [key: string]: string;
};

type Preset = {
  name: string;
  resource_slots: ResourceSlots;
  shared_memory: string | null;
  allocatable: boolean;
};

type ScalingGroup = {
  using: ResourceUsing;
  remaining: ResourceRemaining;
};

type ResourceAllocation = {
  keypair_limits: ResourceLimits;
  keypair_using: ResourceUsing;
  keypair_remaining: ResourceRemaining;
  scaling_group_remaining: ResourceRemaining;
  scaling_groups: {
    [key: string]: ScalingGroup;
  };
  presets: Preset[];
  group_limits: ResourceLimits;
  group_using: ResourceUsing;
  group_remaining: ResourceRemaining;
};

const MemoizedResourceAllocationFormItems = React.memo(
  ResourceAllocationFormItems,
);

export default MemoizedResourceAllocationFormItems;
