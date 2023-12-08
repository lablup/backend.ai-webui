import {
  addNumberWithUnits,
  compareNumberWithUnits,
  iSizeToSize,
} from '../helper';
import { useCurrentProjectValue, useSuspendedBackendaiClient } from '../hooks';
import { useResourceSlots } from '../hooks/backendai';
import { useCurrentKeyPairResourcePolicyLazyLoadQuery } from '../hooks/hooksUsingRelay';
import { useTanQuery } from '../hooks/reactQueryAlias';
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
import React, { useEffect, useState, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const AUTOMATIC_DEFAULT_SHMEM = '64m';
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

interface ResourceAllocationFormItemsProps {
  enableNumOfSessions?: boolean;
}

const ResourceAllocationFormItems: React.FC<
  ResourceAllocationFormItemsProps
> = ({ enableNumOfSessions }) => {
  const form = Form.useFormInstance<MergedResourceAllocationFormValue>();
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const baiClient = useSuspendedBackendaiClient();
  const [resourceSlots] = useResourceSlots();
  const acceleratorSlots = _.omit(resourceSlots, ['cpu', 'mem', 'shmem']);

  const [{ keypair, keypairResourcePolicy }] =
    useCurrentKeyPairResourcePolicyLazyLoadQuery();

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
  const currentImageMinM =
    _.find(currentImage?.resource_limits, (i) => i?.key === 'mem')?.min || '0g';

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

  const sliderMinMaxLimit: any = {
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
            // M to max of [ image's mem min, AUTOMATIC_DEFAULT_SHMEM]
            // mem(M+S) should be larger than _.max([ image's mem min, AUTOMATIC_DEFAULT_SHMEM ]) + AUTOMATIC_DEFAULT_SHMEM (rule: S can not be larger than M)
            min:
              addNumberWithUnits(
                (_.max([
                  iSizeToSize(currentImageMinM, 'b')?.number,
                  iSizeToSize(AUTOMATIC_DEFAULT_SHMEM, 'b')?.number || 0,
                ]) || 0) + 'b',
                AUTOMATIC_DEFAULT_SHMEM,
              ) || '0b',
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
            min: _.max([
              _.find(currentImage?.resource_limits, (i) => i?.key === 'shmem')
                ?.min,
              '64m',
            ]),
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

    session: {
      min: 1,
      max: _.min([
        keypairResourcePolicy.max_concurrent_sessions,
        3, //BackendAiResourceBroker.DEFAULT_CONCURRENT_SESSION_COUNT
      ]),
      remaining:
        (keypairResourcePolicy.max_concurrent_sessions || 3) -
        (keypair.concurrency_used || 0),
    },
  };

  useEffect(() => {
    // when image changed, set value of resources to min value

    // const miniumShmem = '64m';
    form.setFieldsValue({
      resource: {
        cpu: sliderMinMaxLimit.cpu?.min,
        mem:
          iSizeToSize(
            (iSizeToSize(sliderMinMaxLimit.shmem?.min, 'm')?.number || 0) +
              (iSizeToSize(sliderMinMaxLimit.mem?.min, 'm')?.number || 0) +
              'm',
            'g',
          )?.number + 'g', //to prevent loosing precision
        shmem: sliderMinMaxLimit.shmem?.min,
        // shmem: sliderMinMax.shmem?.min,
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
          sliderMinMaxLimit[form.getFieldValue(['resource', 'acceleratorType'])]
            .min,
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
            sliderMinMaxLimit[nextImageSelectorType].min,
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
      >
        <ResourceGroupSelect
          autoSelectDefault
          showSearch
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
                        min: sliderMinMaxLimit.cpu?.min,
                        // TODO: set message
                      },
                      {
                        warningOnly:
                          baiClient._config?.always_enqueue_compute_session,
                        validator: async (rule, value: string) => {
                          if (
                            sliderMinMaxLimit.cpu &&
                            value > sliderMinMaxLimit.cpu.remaining
                          ) {
                            return Promise.reject(
                              baiClient._config?.always_enqueue_compute_session
                                ? t(
                                    'session.launcher.EnqueueComputeSessionWarning',
                                  )
                                : t(
                                    'session.launcher.ErrorCanNotExceedRemaining',
                                    {
                                      amount: sliderMinMaxLimit.cpu.remaining,
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
                          ...(sliderMinMaxLimit.cpu?.remaining
                            ? {
                                [sliderMinMaxLimit.cpu?.remaining]: {
                                  label: <RemainingMark />,
                                },
                              }
                            : {}),
                          [sliderMinMaxLimit.cpu?.min]:
                            sliderMinMaxLimit.cpu?.min,
                          ...(sliderMinMaxLimit.cpu?.max
                            ? {
                                [sliderMinMaxLimit.cpu?.max]: {
                                  style: {
                                    color: token.colorTextSecondary,
                                  },
                                  label: sliderMinMaxLimit.cpu?.max,
                                },
                              }
                            : {}),
                        },
                      }}
                      min={sliderMinMaxLimit.cpu?.min}
                      max={sliderMinMaxLimit.cpu?.max}
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
                                  //     sliderMinMaxLimit.mem?.min,
                                  //     form.getFieldValue(['resource', 'shmem']),
                                  //   ) || '0b';

                                  if (
                                    !_.isElement(value) &&
                                    sliderMinMaxLimit.mem?.min &&
                                    compareNumberWithUnits(
                                      value,
                                      sliderMinMaxLimit.mem?.min || '0g',
                                    ) < 0
                                  ) {
                                    return Promise.reject(
                                      t('session.launcher.MinMemory', {
                                        size: _.toUpper(
                                          sliderMinMaxLimit.mem?.min || '0g',
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
                                    sliderMinMaxLimit.mem &&
                                    compareNumberWithUnits(
                                      value,
                                      sliderMinMaxLimit.mem.remaining + 'b',
                                    ) > 0
                                  ) {
                                    return Promise.reject(
                                      baiClient._config
                                        ?.always_enqueue_compute_session
                                        ? t(
                                            'session.launcher.EnqueueComputeSessionWarning',
                                          )
                                        : t(
                                            'session.launcher.ErrorCanNotExceedRemaining',
                                            {
                                              amount:
                                                iSizeToSize(
                                                  sliderMinMaxLimit.mem
                                                    .remaining + 'b',
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
                              max={sliderMinMaxLimit.mem?.max}
                              // min="256m"
                              // min={'0g'}
                              // min={addNumberWithUnits(
                              //   sliderMinMaxLimit.mem?.min,
                              //   form.getFieldValue(['resource', 'shmem']) || '0g',
                              // )}
                              min={sliderMinMaxLimit.mem?.min}
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
                                ...(sliderMinMaxLimit.mem?.remaining
                                  ? {
                                      //@ts-ignore
                                      [iSizeToSize(
                                        sliderMinMaxLimit.mem?.remaining + 'b',
                                        'g',
                                        3,
                                      )?.numberFixed]: {
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
                              }}
                            />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>

                    <Flex direction="column" gap={'xxs'} align="start">
                      <Flex direction="row" gap={'xs'}>
                        {t('session.launcher.EnableAutomaticShmem')}{' '}
                        <Form.Item
                          noStyle
                          name={'enabledAutomaticShmem'}
                          valuePropName="checked"
                        >
                          <Switch
                            size="small"
                            onChange={(checked) => {
                              if (checked)
                                runShmemAutomationRule(
                                  form.getFieldValue(['resource', 'mem']) ||
                                    '0g',
                                );
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
                                // min={sliderMinMaxLimit.shmem?.min}
                                min={sliderMinMaxLimit.shmem?.min}
                                // max={sliderMinMaxLimit.mem?.max || '0g'}
                                addonBefore={'SHM'}
                                max={
                                  form.getFieldValue(['resource', 'mem']) ||
                                  '0g'
                                }
                                hideSlider
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
                        required
                        rules={[
                          {
                            required: true,
                          },
                          {
                            type: 'number',
                            min:
                              sliderMinMaxLimit[currentAcceleratorType]?.min ||
                              0,
                          },
                          {
                            warningOnly:
                              baiClient._config?.always_enqueue_compute_session,
                            validator: async (rule: any, value: number) => {
                              if (
                                sliderMinMaxLimit[currentAcceleratorType] &&
                                value >
                                  sliderMinMaxLimit[currentAcceleratorType]
                                    .remaining
                              ) {
                                return Promise.reject(
                                  baiClient._config
                                    ?.always_enqueue_compute_session
                                    ? t(
                                        'session.launcher.EnqueueComputeSessionWarning',
                                      )
                                    : t(
                                        'session.launcher.ErrorCanNotExceedRemaining',
                                        {
                                          amount:
                                            sliderMinMaxLimit[
                                              currentAcceleratorType
                                            ].remaining,
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
                              ...(sliderMinMaxLimit[currentAcceleratorType]
                                ?.remaining
                                ? {
                                    [sliderMinMaxLimit[currentAcceleratorType]
                                      .remaining]: {
                                      label: <RemainingMark />,
                                    },
                                  }
                                : {}),
                              [sliderMinMaxLimit[currentAcceleratorType]?.max]:
                                sliderMinMaxLimit[currentAcceleratorType]?.max,
                            },
                            tooltip: {
                              formatter: (value = 0) => {
                                return `${value} ${ACCELERATOR_UNIT_MAP[currentAcceleratorType]}`;
                              },
                            },
                          }}
                          min={0}
                          max={sliderMinMaxLimit[currentAcceleratorType]?.max}
                          step={
                            _.endsWith(currentAcceleratorType, 'shares') &&
                            form.getFieldValue('cluster_size') < 2
                              ? 0.1
                              : 1
                          }
                          inputNumberProps={{
                            addonAfter: (
                              <Form.Item
                                noStyle
                                name={['resource', 'acceleratorType']}
                                initialValue={_.keys(acceleratorSlots)[0]}
                              >
                                <Select
                                  tabIndex={-1}
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
                      warningOnly:
                        baiClient._config?.always_enqueue_compute_session,
                      validator: async (rule, value: number) => {
                        if (
                          sliderMinMaxLimit.session &&
                          value > sliderMinMaxLimit.session.remaining
                        ) {
                          return Promise.reject(
                            baiClient._config?.always_enqueue_compute_session
                              ? t(
                                  'session.launcher.EnqueueComputeSessionWarning',
                                )
                              : t(
                                  'session.launcher.ErrorCanNotExceedRemaining',
                                  {
                                    amount: sliderMinMaxLimit.session.remaining,
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
                      addonAfter: '#',
                    }}
                    disabled={form.getFieldValue('cluster_size') > 1}
                    sliderProps={{
                      marks: {
                        [sliderMinMaxLimit.session?.min]:
                          sliderMinMaxLimit.session?.min,
                        // remaining mark code should be located before max mark code to prevent overlapping when it is same value
                        ...(sliderMinMaxLimit.session?.remaining
                          ? {
                              [sliderMinMaxLimit.session?.remaining]: {
                                label: <RemainingMark />,
                              },
                            }
                          : {}),
                        [sliderMinMaxLimit.session?.max]:
                          sliderMinMaxLimit.session?.max,
                      },
                    }}
                    min={sliderMinMaxLimit.session?.min}
                    max={sliderMinMaxLimit.session?.max}
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
                      sliderMinMaxLimit.cpu?.max,
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
                              if (
                                value >
                                _.min([
                                  sliderMinMaxLimit.cpu?.remaining,
                                  keypairResourcePolicy.max_containers_per_session,
                                ])
                              ) {
                                return Promise.reject(
                                  t(
                                    'session.launcher.EnqueueComputeSessionWarning',
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
                          // TODO: max cluster size
                          max={derivedClusterSizeMaxLimit}
                          disabled={derivedClusterSizeMaxLimit === 1}
                          sliderProps={{
                            marks: {
                              1: '1',
                              // remaining mark code should be located before max mark code to prevent overlapping when it is same value
                              ...(derivedClusterSizeMaxLimit.cpu?.remaining
                                ? {
                                    [derivedClusterSizeMaxLimit.cpu?.remaining]:
                                      {
                                        label: <RemainingMark />,
                                      },
                                  }
                                : {}),
                              [derivedClusterSizeMaxLimit]:
                                derivedClusterSizeMaxLimit,
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
