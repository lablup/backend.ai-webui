/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceAllocationFormItemsQuery } from '../../__generated__/ResourceAllocationFormItemsQuery.graphql';
import { isUnifiedAcceleratorSlot } from '../../features/session-launcher/domain/accelerator';
import {
  clusterSizeIssues,
  computeClusterCapacity,
} from '../../features/session-launcher/domain/cluster';
import { getAllocatablePresetIds } from '../../features/session-launcher/domain/presets';
import { compose, type Loadable } from '../../features/session-launcher/model';
import { resourceSlice } from '../../features/session-launcher/slices/resource';
import { useFormBoundSlice } from '../../features/session-launcher/view/useFormBoundSlice';
import { Form } from '../../form-engine';
import { compareNumberWithUnits, convertToBinaryUnit } from '../../helper';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  useResourceSlots,
  useResourceSlotsDetails,
} from '../../hooks/backendai';
import { useCurrentKeyPairResourcePolicyLazyLoadQuery } from '../../hooks/hooksUsingRelay';
import { useResourceLimitAndRemaining } from '../../hooks/useResourceLimitAndRemaining';
import { ProjectContext } from '../../types/projectContext';
import AgentSelect from '../AgentSelect';
import { ImageEnvironmentFormInput } from '../ImageEnvironmentSelectFormItems';
import InputNumberWithSlider from '../InputNumberWithSlider';
import ResourcePresetSelect from '../ResourcePresetSelect';
import RemainingMark from './RemainingMark';
import SharedMemoryFormItems from './SharedMemoryFormItems';
// FRONTIER (ticket 17): the launcher's form-visual core. The Form ENGINE and
// `Form.Item` are self-hosted since ticket 34 (live again since ticket 35),
// and every control and every piece of chrome below is Astryx now.
import { Card } from '@lablup/ui-common/Card';
import { IconButton } from '@lablup/ui-common/IconButton';
import { SegmentedControl } from '@lablup/ui-common/SegmentedControl';
import { VStack } from '@lablup/ui-common/Stack';
import { useTheme } from '@lablup/ui-common/theme';
import { spacingVars } from '@lablup/ui-common/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import {
  BAIDynamicUnitInputNumberWithSlider,
  BAIFlex,
  BAIQuestionIconWithTooltip,
  BAIProjectResourceGroupSelect,
  BAISegmentedControlItem,
  BAISelect,
  useProjectResourceGroups,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { RotateCw } from 'lucide-react';
import React, {
  Suspense,
  useDeferredValue,
  useMemo,
  useTransition,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export {
  AUTOMATIC_DEFAULT_SHMEM,
  getAutomaticShmem,
  pickChangedResourceValues,
} from '../../features/session-launcher/domain/shmem';
export {
  getUnifiedSlotNameFromTag,
  isUnifiedAcceleratorSlot,
  UNIFIED_SLOT_TAG_PREFIX,
} from '../../features/session-launcher/domain/accelerator';
export { getAllocatablePresetIds } from '../../features/session-launcher/domain/presets';

const resourceModel = compose([resourceSlice]);

const ready = <T,>(value: T): Loadable<T> => ({ status: 'ready', value });
const LOADING: Loadable<never> = { status: 'loading' };

export const RESOURCE_ALLOCATION_INITIAL_FORM_VALUES: DeepPartial<ResourceAllocationFormValue> =
  {
    resource: {
      cpu: 0,
      mem: '0g',
      shmem: '0g',
      accelerator: 0,
    },
    num_of_sessions: 1,
    cluster_mode: 'multi-node',
    cluster_size: 1,
    enabledAutomaticShmem: true,
    agent: ['auto'],
  };

export const isMinOversMaxValue = (min: number, max: number) => {
  return min >= max;
};

export interface ResourceAllocationFormValue {
  resource: {
    cpu: number;
    mem: string;
    shmem?: string;
    accelerator?: number;
    acceleratorType?: string;
  };
  resourceGroup: string;
  num_of_sessions?: number;
  cluster_mode: 'single-node' | 'multi-node';
  cluster_size: number;
  enabledAutomaticShmem: boolean;
  allocationPreset?: string;
  agent?: string[] | string;
}

export type MergedResourceAllocationFormValue = ResourceAllocationFormValue &
  ImageEnvironmentFormInput;

interface ResourceAllocationFormItemsProps {
  /**
   * The project that scopes every project-dependent piece of this form
   * fragment: the `accessible_scaling_groups(project_id:)` query, the
   * resource-group select, and the resource limit / remaining / preset
   * lookups. Required and non-null per ADR-0001 (form-fragment tier,
   * FR-3411): this fragment never reads the ambient current project and
   * never embeds a project selector — the parent owns any selector and
   * passes the chosen/derived project down.
   */
  project: ProjectContext;
  enableAgentSelect?: boolean;
  enableResourcePresets?: boolean;
  showRemainingWarning?: boolean;
  forceImageMinValues?: boolean;
  hideClusterFormItems?: boolean;
  /**
   * Opt-in: when the form field has no value, auto-select the project's
   * "default" resource group (or the first available one). Forwarded to
   * `BAIProjectResourceGroupSelect`'s `autoSelectDefault` prop. Off by
   * default to preserve existing behavior for shared callers like
   * `SessionLauncherPage` / `ServiceLauncherPageContent` that pre-fill
   * the form themselves.
   */
  autoSelectFirstResourceGroup?: boolean;
  /**
   * Hide the resource group selector while still mounting the underlying
   * `BAIProjectResourceGroupSelect` (so `autoSelectFirstResourceGroup` and
   * any external `form.setFieldValue('resourceGroup', ...)` still flow
   * through). Used by the deployment-revision flow where the resource
   * group is sourced from the parent deployment rather than chosen here.
   */
  hideResourceGroupFormItem?: boolean;
  /**
   * List the SFTP-designated resource groups in the selector. They are
   * reserved for SSH/SFTP system sessions, so only the launcher sets this,
   * for `sessionType === 'system'` (FR-3996).
   */
  includeSFTPResourceGroups?: boolean;
  extraAcceleratorRules?: Array<{
    warningOnly?: boolean;
    validator: (rule: unknown, value: number) => Promise<void>;
  }>;
}

// FR-3531: hug the content instead of stretching to the parent's width.
const clusterModeSegmentedStyles = stylex.create({
  control: { alignSelf: 'flex-start' },
  label: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
});

/**
 * Cluster-mode segmented control — the twin of the one in
 * `ClusterModeFormItems`, declared locally for the same reason: each option
 * carries a help tooltip that the shared `AstryxFormSegmented` option shape
 * does not model. The two `Form.Item` contracts are honoured inline.
 */
const ClusterModeSegmented: React.FC<{
  label: string;
  onValueChange: () => void;
  items: Array<{ value: string; label: string; tooltip: React.ReactNode }>;
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
}> = ({ label, onValueChange, items, value, onChange }) => {
  'use memo';
  return (
    <SegmentedControl
      label={label}
      value={value ?? items[0]?.value ?? ''}
      xstyle={clusterModeSegmentedStyles.control}
      onChange={(next) => {
        onChange?.(next);
        onValueChange();
      }}
    >
      {items.map((item) => (
        // FR-3531: the help affordance is a small view that trails the label,
        // not a leading `icon` — Astryx renders the `icon` slot first.
        <BAISegmentedControlItem
          key={item.value}
          value={item.value}
          label={
            <span {...stylex.props(clusterModeSegmentedStyles.label)}>
              {item.label}
              <BAIQuestionIconWithTooltip
                title={item.tooltip}
                focusable={false}
              />
            </span>
          }
        />
      ))}
    </SegmentedControl>
  );
};

const ResourceAllocationFormItems: React.FC<
  ResourceAllocationFormItemsProps
> = ({
  project,
  enableAgentSelect = false,
  enableResourcePresets,
  forceImageMinValues = false,
  showRemainingWarning = false,
  hideClusterFormItems = false,
  autoSelectFirstResourceGroup = false,
  hideResourceGroupFormItem = false,
  includeSFTPResourceGroups = false,
  extraAcceleratorRules,
}) => {
  const form = Form.useFormInstance<MergedResourceAllocationFormValue>();
  const { t } = useTranslation();
  const { token } = useTheme();

  const baiClient = useSuspendedBackendaiClient();

  const [{ keypairResourcePolicy }] =
    useCurrentKeyPairResourcePolicyLazyLoadQuery();

  const [agentFetchKey, updateAgentFetchKey] = useUpdatableState('first');
  const [isPendingAgentList, startAgentListTransition] = useTransition();

  const currentResourceGroupInForm =
    Form.useWatch(['resourceGroup'], {
      form,
      preserve: true,
    }) || form.getFieldValue('resourceGroup');

  const { accessible_scaling_groups, resource_presets } =
    useLazyLoadQuery<ResourceAllocationFormItemsQuery>(
      graphql`
        query ResourceAllocationFormItemsQuery($projectID: UUID!) {
          accessible_scaling_groups(project_id: $projectID) {
            accelerator_quantum_size
            name
            is_active
            ...useResourceLimitAndRemainingFragment
          }
          resource_presets {
            id
            name
            scaling_group_name
          }
        }
      `,
      {
        projectID: project.id,
      },
      {
        fetchPolicy: 'store-and-network',
      },
    );

  const currentResourceGroupInfo = _.find(
    accessible_scaling_groups,
    (group) => group?.name === currentResourceGroupInForm,
  );
  // The groups the resource-group select offers; presets of any other group are hidden.
  const { resourceGroups: selectableResourceGroups } = useProjectResourceGroups(
    project.name,
    { includeSFTPResourceGroups },
  );
  // Names of the resource groups accessible to the PASSED project. Handed to
  // `useResourceLimitAndRemaining` so its "is this resource group valid?"
  // guard is keyed off the `project` prop instead of the ambient current
  // project's derived resource-group atom (ADR-0001).
  const accessibleResourceGroupNames = _.compact(
    _.map(accessible_scaling_groups, (group) => group?.name),
  );
  const currentResourceValue = Form.useWatch(['resource']);
  const currentImage = Form.useWatch(['environments', 'image'], {
    form,
    preserve: true,
  });
  const currentAllocationPreset = Form.useWatch(['allocationPreset'], {
    form,
    preserve: true,
  });
  const currentEnvironmentManual = Form.useWatch(['environments', 'manual'], {
    form,
    preserve: true,
  });

  // The preset check suspends per resource group; deferring the group keeps the
  // launcher on screen while a group's first check loads, not a page fallback.
  const deferredResourceGroup = useDeferredValue(currentResourceGroupInForm);
  const [{ currentImageMinM, remaining, resourceLimits, checkPresetInfo }] =
    useResourceLimitAndRemaining({
      currentProjectName: project.name,
      currentResourceGroup: deferredResourceGroup || undefined, // global currentResourceGroup can be null
      currentResourceGroupFrgmtForLimit: currentResourceGroupInfo,
      currentImage: currentImage,
      accessibleResourceGroupNames,
    });

  const [resourceSlots] = useResourceSlots();

  const { mergedResourceSlots, resourceSlotsInRG } = useResourceSlotsDetails(
    currentResourceGroupInForm || undefined,
  );

  // When undefined, it means that the resourceSlots are not loaded yet.
  const acceleratorSlotsInRG = resourceSlotsInRG
    ? _.omitBy(resourceSlotsInRG, (_value, key) => {
        if (['cpu', 'mem', 'shmem'].includes(key)) return true;
        return false;
      })
    : undefined;

  // When undefined, it means that the image is not determined yet.
  const currentImageAcceleratorLimits = useMemo(
    () =>
      currentImage
        ? _.filter(currentImage?.resource_limits, (limit) =>
            limit ? !_.includes(['cpu', 'mem', 'shmem'], limit.key) : false,
          )
        : undefined,
    [currentImage],
  );

  // Get supported accelerator types in resource group by image
  const supportedAcceleratorTypesInRGByImage = useMemo(() => {
    if (
      _.isUndefined(acceleratorSlotsInRG) ||
      (_.isNil(currentImage) && _.isEmpty(currentEnvironmentManual))
    ) {
      return undefined;
    }
    return _.keys(acceleratorSlotsInRG).filter((acceleratorTypeName) => {
      // '*' means all types of accelerators are supported
      return (
        _.includes(currentImage?.supported_accelerators, '*') ||
        (currentImage?.supported_accelerators?.length === 1 &&
          currentImage.supported_accelerators[0] === '') || // Before BA-2358, manage can return '' instead of '*'
        _.some(
          currentImage?.supported_accelerators,
          (accPrefix) =>
            accPrefix &&
            acceleratorTypeName.split('.')[0].startsWith(accPrefix),
        ) ||
        !_.isEmpty(currentEnvironmentManual) // if manual image input is not empty, allow user to input any accelerator type
      );
    });
  }, [currentImage, acceleratorSlotsInRG, currentEnvironmentManual]);

  const allocatablePresetIdsKey = JSON.stringify(
    getAllocatablePresetIds(
      checkPresetInfo?.presets,
      resourceLimits,
      currentImage,
    ),
  );
  const allocatablePresetIds: string[] = JSON.parse(allocatablePresetIdsKey);

  // R-01..R-05 and the handlers' cascading writes live in `resourceSlice`
  // (ADR 0013); this component only dispatches.
  const { dispatch } = useFormBoundSlice(form, resourceModel, {
    resourceLimits: ready(resourceLimits),
    checkPresetInfo: ready(checkPresetInfo),
    allocatablePresetIds: ready(allocatablePresetIds),
    resourceSlotsInRG: _.isUndefined(resourceSlotsInRG)
      ? LOADING
      : ready(resourceSlotsInRG),
    acceleratorSlotsInRG: ready(acceleratorSlotsInRG),
    supportedAcceleratorTypesInRGByImage: ready(
      supportedAcceleratorTypesInRGByImage,
    ),
    currentImage: ready(currentImage),
    currentImageAcceleratorLimits: ready(currentImageAcceleratorLimits),
    currentImageMinM: ready(currentImageMinM),
    currentAllocationPreset: ready(currentAllocationPreset),
    currentResourceValue: ready(currentResourceValue),
    enableResourcePresets: ready(enableResourcePresets),
    allowCustomResourceAllocation: ready(
      baiClient._config.allowCustomResourceAllocation,
    ),
    forceImageMinValues: ready(forceImageMinValues),
  });

  return (
    <>
      <Form.Item
        name="resourceGroup"
        label={t('session.ResourceGroup')}
        hidden={hideResourceGroupFormItem}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <BAIProjectResourceGroupSelect
          projectName={project.name}
          autoSelectDefault={autoSelectFirstResourceGroup}
          includeSFTPResourceGroups={includeSFTPResourceGroups}
          showSearch
          // An auto-selected preset is untouched, so `dependencies` would not
          // re-check it; validate it here, after the store has the new group.
          onChange={() => {
            if (form.getFieldValue('allocationPreset')) {
              form.validateFields(['allocationPreset']).catch(() => {});
            }
          }}
        />
      </Form.Item>

      {enableResourcePresets ? (
        <Form.Item
          label={t('resourcePreset.ResourcePresets')}
          name="allocationPreset"
          style={{ marginBottom: token('--spacing-2') }}
          rules={[
            {
              required: true,
            },
            ({ getFieldValue }) => ({
              // Changing the resource group keeps the chosen preset; flag a
              // preset scoped to another group instead of swapping it. Re-run
              // from the resource-group select's `onChange`.
              validator: async (_rule, value: string) => {
                const preset = _.find(
                  resource_presets,
                  (preset) => preset?.id === value,
                );
                const presetGroup = preset?.scaling_group_name;
                const resourceGroup = getFieldValue('resourceGroup');
                if (
                  presetGroup &&
                  resourceGroup &&
                  presetGroup !== resourceGroup
                ) {
                  return Promise.reject(
                    t('resourcePreset.PresetOnlyAvailableInResourceGroup', {
                      preset: preset?.name,
                      name: presetGroup,
                    }),
                  );
                }
              },
            }),
          ]}
        >
          <ResourcePresetSelect
            showCustom={baiClient._config.allowCustomResourceAllocation}
            showMinimumRequired={
              baiClient._config.allowCustomResourceAllocation
            }
            onChange={(value) => {
              dispatch({ type: 'presetSelected', payload: value });
            }}
            allocatablePresetIds={allocatablePresetIds}
            selectableResourceGroupNames={_.map(
              selectableResourceGroups,
              'name',
            )}
            resourceGroup={currentResourceGroupInForm}
          />
        </Form.Item>
      ) : null}
      {/* MAPPING §5.1: antd `Card` -> Astryx `Card`, a bare container. This
          call site passes no `title`/`extra`/`tabList`, so nothing needs
          composing around it — only the bottom margin, which stays. */}
      <Card style={{ marginBottom: token('--spacing-4') }}>
        <Form.Item
          shouldUpdate={(prev, cur) =>
            prev.allocationPreset !== cur.allocationPreset
          }
          noStyle
        >
          {() => {
            return (
              // getFieldValue('allocationPreset') === 'custom' && (
              <>
                {resourceSlotsInRG?.cpu && (
                  <Form.Item
                    name={['resource', 'cpu']}
                    hidden={!baiClient._config.allowCustomResourceAllocation}
                    // initialValue={0}
                    label={
                      mergedResourceSlots?.cpu?.human_readable_name || 'CPU'
                    }
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
                        type: 'number',
                        max: resourceLimits.cpu?.max,
                      },
                      {
                        warningOnly: true,
                        validator: async (_rule, value: number) => {
                          if (
                            _.isNumber(resourceLimits.cpu?.min) &&
                            _.isNumber(resourceLimits.cpu?.max) &&
                            isMinOversMaxValue(
                              resourceLimits.cpu?.min,
                              resourceLimits.cpu?.max,
                            )
                          ) {
                            return Promise.reject(
                              t(
                                'session.launcher.InsufficientAllocationOfResourcesWarning',
                              ),
                            );
                          }
                          if (showRemainingWarning) {
                            if (
                              _.isNumber(remaining.cpu) &&
                              value > remaining.cpu
                            ) {
                              return Promise.reject(
                                t(
                                  'session.launcher.EnqueueComputeSessionWarning',
                                ),
                              );
                            }
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumberWithSlider
                      inputNumberProps={{
                        suffix:
                          mergedResourceSlots?.cpu?.display_unit ||
                          t('session.launcher.Core'),
                      }}
                      inputContainerMinWidth={190}
                      sliderProps={{
                        marks: {
                          // remaining mark code should be located before max mark code to prevent overlapping when it is same value
                          ...(remaining.cpu && showRemainingWarning
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
                                    color: token('--color-text-secondary'),
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
                        dispatch({ type: 'cpuEdited' });
                      }}
                    />
                  </Form.Item>
                )}
                {resourceSlotsInRG?.mem && (
                  <Form.Item
                    label={t('session.launcher.Memory')}
                    tooltip={{
                      placement: 'right',
                      props: {
                        onClick: (e: any) => e.preventDefault(),
                      },
                      title: (
                        <BAIFlex
                          direction="column"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Trans i18nKey={'session.launcher.DescMemory'} />
                        </BAIFlex>
                      ),
                    }}
                    required
                  >
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, next) =>
                        prev.resource?.shmem !== next.resource?.shmem
                      }
                      hidden={!baiClient._config.allowCustomResourceAllocation}
                    >
                      {() => {
                        return (
                          <Form.Item
                            name={['resource', 'mem']}
                            noStyle
                            rules={[
                              {
                                required: true,
                                message: t('general.ValueRequired', {
                                  name: t('session.launcher.Memory'),
                                }),
                              },
                              {
                                validator: async (_rule, value: string) => {
                                  if (
                                    _.isString(value) &&
                                    resourceLimits.mem?.max &&
                                    compareNumberWithUnits(
                                      value || '0g',
                                      resourceLimits.mem?.max,
                                    ) > 0
                                  ) {
                                    return Promise.reject(
                                      t('general.MaxValueNotification', {
                                        name: t('session.launcher.Memory'),
                                        max:
                                          _.toUpper(
                                            resourceLimits.mem?.max || '0g',
                                          ) + 'iB',
                                      }),
                                      // t('session.launcher.MinMemory', {
                                      //   size: _.toUpper(
                                      //     resourceLimits.mem?.min || '0g',
                                      //   ),
                                      // }),
                                    );
                                  } else {
                                    return Promise.resolve();
                                  }
                                },
                              },
                              {
                                // TODO: min of mem should be shmem + image's mem limit??
                                validator: async (_rule, value: string) => {
                                  // const memMinPlusShmem =
                                  //   addNumberWithUnits(
                                  //     resourceLimits.mem?.min,
                                  //     form.getFieldValue(['resource', 'shmem']),
                                  //   ) || '0b';

                                  if (
                                    !_.isEmpty(value) &&
                                    resourceLimits.mem?.min &&
                                    compareNumberWithUnits(
                                      value || '0g',
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
                                warningOnly: true,
                                validator: async (_rule, value: string) => {
                                  if (
                                    compareNumberWithUnits(
                                      resourceLimits.mem?.min as string,
                                      resourceLimits.mem?.max as string,
                                    ) > 0
                                  ) {
                                    return Promise.reject(
                                      t(
                                        'session.launcher.InsufficientAllocationOfResourcesWarning',
                                      ),
                                    );
                                  }
                                  // Show remaining warning only when remaining.mem is a valid number
                                  if (
                                    showRemainingWarning &&
                                    _.isNumber(remaining.mem) &&
                                    !_.isNaN(remaining.mem)
                                  ) {
                                    if (
                                      !_.isElement(value) &&
                                      resourceLimits.mem &&
                                      compareNumberWithUnits(
                                        value || '0g',
                                        remaining.mem,
                                      ) > 0
                                    ) {
                                      return Promise.reject(
                                        t(
                                          'session.launcher.EnqueueComputeSessionWarning',
                                        ),
                                      );
                                    }
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <BAIDynamicUnitInputNumberWithSlider
                              defaultUnit="g"
                              max={resourceLimits.mem?.max}
                              min={resourceLimits.mem?.min}
                              extraMarks={{
                                ...(remaining.mem && showRemainingWarning
                                  ? {
                                      //@ts-ignore
                                      [convertToBinaryUnit(
                                        remaining.mem,
                                        'g',
                                        3,
                                      )?.numberFixed]: {
                                        label: <RemainingMark />,
                                      },
                                    }
                                  : {}),
                              }}
                              onChange={(M_plus_S) => {
                                dispatch({
                                  type: 'memEdited',
                                  payload: M_plus_S,
                                });
                              }}
                            />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                    <SharedMemoryFormItems
                      min={resourceLimits.shmem?.min}
                      onChangeResourceShmem={() => {
                        dispatch({ type: 'shmemEdited' });
                      }}
                      onChangeAutomaticShmem={(checked) => {
                        dispatch({
                          type: 'autoShmemToggled',
                          payload: checked,
                        });
                      }}
                    />
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
                  hidden={!baiClient._config.allowCustomResourceAllocation}
                >
                  {({ getFieldValue }) => {
                    const currentAcceleratorType = getFieldValue([
                      'resource',
                      'acceleratorType',
                    ]);

                    // Determine the accelerator step size based on the type and cluster settings
                    const isSharesType = _.endsWith(
                      currentAcceleratorType,
                      'shares',
                    );

                    const isUniqueType =
                      resourceSlots[
                        currentAcceleratorType as keyof typeof resourceSlots
                      ] === 'unique';

                    const isUnifiedType = isUnifiedAcceleratorSlot(
                      currentAcceleratorType,
                    );

                    // For unified slots, surface the device's own description
                    // (from resource-slot metadata) instead of a generic note.
                    const unifiedAcceleratorDescription = isUnifiedType
                      ? mergedResourceSlots?.[currentAcceleratorType]
                          ?.description
                      : undefined;

                    const isSingleCluster =
                      form.getFieldValue('cluster_size') < 2;
                    const hasQuantumSize = _.isNumber(
                      currentResourceGroupInfo?.accelerator_quantum_size,
                    );

                    let currentAcceleratorStep;
                    if (isSharesType && isSingleCluster) {
                      // For single cluster with shares type, use quantum size if available
                      // otherwise, use default step of 0.1
                      if (hasQuantumSize) {
                        currentAcceleratorStep =
                          currentResourceGroupInfo.accelerator_quantum_size;
                      } else {
                        currentAcceleratorStep = 0.1;
                      }
                    } else {
                      // For non-shares accelerators, always use step of 1
                      currentAcceleratorStep = 1;
                    }

                    // Calculates the adjusted remaining value for a specific accelerator type,
                    // aligned to the accelerator's step size.
                    const adjustedRemainingMarkValue = _.isNumber(
                      remaining.accelerators[currentAcceleratorType],
                    )
                      ? Math.floor(
                          remaining.accelerators[currentAcceleratorType] /
                            currentAcceleratorStep,
                        ) * currentAcceleratorStep
                      : undefined;

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
                        extra={
                          unifiedAcceleratorDescription
                            ? t(
                                'session.launcher.UnifiedAcceleratorMemoryNote',
                                {
                                  description: unifiedAcceleratorDescription,
                                },
                              )
                            : undefined
                        }
                        dependencies={[
                          ['resource', 'acceleratorType'],
                          'cluster_size',
                          ['resource', 'mem'],
                        ]}
                        // Unified-memory slots clear the accelerator field
                        // (it stays empty, not mirrored) and disable direct
                        // edits, so none of the discrete accelerator
                        // constraints (required, min/max, step,
                        // remaining/unique warnings, caller-provided rules)
                        // apply. Skip all validation in that mode.
                        rules={
                          isUnifiedType
                            ? []
                            : [
                                {
                                  required:
                                    currentImageAcceleratorLimits &&
                                    currentImageAcceleratorLimits.length > 0,
                                },
                                {
                                  type: 'number',
                                  min:
                                    resourceLimits.accelerators[
                                      currentAcceleratorType
                                    ]?.min || 0,
                                  // Unique type should only allow 0 or 1
                                  max: isUniqueType
                                    ? 1
                                    : resourceLimits.accelerators[
                                        currentAcceleratorType
                                      ]?.max,
                                },
                                {
                                  validator: async (
                                    _rule: any,
                                    value: number,
                                  ) => {
                                    if (
                                      _.endsWith(
                                        currentAcceleratorType,
                                        'shares',
                                      ) &&
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
                                  validator: async (
                                    _rule: any,
                                    value: number,
                                  ) => {
                                    if (
                                      _.isNumber(currentAcceleratorStep) &&
                                      ![0, currentAcceleratorStep].includes(
                                        _.round(
                                          value % currentAcceleratorStep,
                                          5,
                                        ),
                                      )
                                    ) {
                                      return Promise.reject(
                                        t(
                                          'session.launcher.OnlyAllowsDiscreteNumberByQuantumSize',
                                          {
                                            stepSize: currentAcceleratorStep,
                                          },
                                        ),
                                      );
                                    } else {
                                      return Promise.resolve();
                                    }
                                  },
                                },
                                {
                                  warningOnly: true,
                                  validator: async (
                                    _rule: any,
                                    value: number,
                                  ) => {
                                    if (
                                      _.isNumber(
                                        resourceLimits.accelerators[
                                          currentAcceleratorType
                                        ]?.min,
                                      ) &&
                                      _.isNumber(
                                        resourceLimits.accelerators[
                                          currentAcceleratorType
                                        ]?.max,
                                      ) &&
                                      isMinOversMaxValue(
                                        resourceLimits.accelerators[
                                          currentAcceleratorType
                                        ]?.min,
                                        resourceLimits.accelerators[
                                          currentAcceleratorType
                                        ]?.max,
                                      )
                                    ) {
                                      return Promise.reject(
                                        t(
                                          'session.launcher.InsufficientAllocationOfResourcesWarning',
                                        ),
                                      );
                                    }
                                    if (showRemainingWarning) {
                                      if (
                                        _.isNumber(
                                          remaining.accelerators[
                                            currentAcceleratorType
                                          ],
                                        ) &&
                                        value >
                                          remaining.accelerators[
                                            currentAcceleratorType
                                          ]
                                      ) {
                                        return Promise.reject(
                                          t(
                                            'session.launcher.EnqueueComputeSessionWarning',
                                          ),
                                        );
                                      }
                                    }
                                    return Promise.resolve();
                                  },
                                },
                                {
                                  warningOnly: true,
                                  validator: async (_rule, _value) => {
                                    if (isUniqueType) {
                                      return Promise.reject(
                                        t(
                                          'session.launcher.CurrentAcceleratorTypeAllowsMaxOne',
                                          {
                                            accelerator: currentAcceleratorType,
                                          },
                                        ),
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                                ...(extraAcceleratorRules ?? []),
                              ]
                        }
                      >
                        <InputNumberWithSlider
                          inputContainerMinWidth={190}
                          sliderProps={{
                            marks: {
                              0: 0,
                              // remaining mark code should be located before max mark code to prevent overlapping when it is same value
                              ...(adjustedRemainingMarkValue &&
                              showRemainingWarning
                                ? {
                                    [adjustedRemainingMarkValue]: {
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
                              ...(isUniqueType ? { 1: 1 } : {}),
                            },
                            tooltip: {
                              formatter: (value = 0) => {
                                return `${value} ${mergedResourceSlots?.[currentAcceleratorType]?.display_unit || ''}`;
                              },
                              open:
                                supportedAcceleratorTypesInRGByImage?.length ===
                                0
                                  ? false
                                  : undefined,
                            },
                          }}
                          disabled={
                            supportedAcceleratorTypesInRGByImage?.length === 0
                          }
                          disableMode={isUnifiedType ? 'empty' : 'normal'}
                          min={0}
                          max={
                            // Unique type should only allow 0 or 1
                            isUniqueType
                              ? 1
                              : resourceLimits.accelerators[
                                  currentAcceleratorType
                                ]?.max
                          }
                          step={currentAcceleratorStep}
                          onChange={() => {
                            dispatch({ type: 'acceleratorEdited' });
                          }}
                          inputNumberProps={{
                            addonAfter:
                              (supportedAcceleratorTypesInRGByImage?.length ??
                                0) > 0 ? (
                                <Form.Item
                                  noStyle
                                  name={['resource', 'acceleratorType']}
                                  initialValue={_.first(
                                    _.keys(acceleratorSlotsInRG),
                                  )}
                                >
                                  <BAISelect
                                    // In an InputGroup the trigger resolves to
                                    // width:100%; size it to content, bounded,
                                    // so the number field keeps the row.
                                    style={{
                                      flex: '0 0 auto',
                                      width: 'auto',
                                      maxWidth: 100,
                                    }}
                                    autoSelectOption
                                    tabIndex={-1}
                                    suffixIcon={
                                      _.size(acceleratorSlotsInRG) > 1
                                        ? undefined
                                        : null
                                    }
                                    popupMatchSelectWidth={false}
                                    options={_.map(
                                      acceleratorSlotsInRG,
                                      (_value, name) => {
                                        return {
                                          value: name,
                                          label:
                                            mergedResourceSlots?.[name]
                                              ?.display_unit || 'UNIT',
                                          disabled: !_.includes(
                                            supportedAcceleratorTypesInRGByImage,
                                            name,
                                          ),
                                        };
                                      },
                                    )}
                                    onChange={(nextType: string) => {
                                      dispatch({
                                        type: 'acceleratorTypeSelected',
                                        payload: {
                                          nextType,
                                          currentAcceleratorType,
                                        },
                                      });
                                    }}
                                  />
                                </Form.Item>
                              ) : undefined,
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
      {/* TODO: Support cluster mode */}
      {enableAgentSelect && (
        <Form.Item
          label={t('session.launcher.SelectAgent')}
          required
          tooltip={<Trans i18nKey={'session.launcher.DescSelectAgent'} />}
        >
          <BAIFlex gap={'xs'}>
            <Suspense>
              <Form.Item required noStyle style={{ flex: 1 }} name="agent">
                <AgentSelect
                  resourceGroup={currentResourceGroupInForm}
                  fetchKey={agentFetchKey}
                  mode="multiple"
                  fallbackToAuto
                  labelRender={({ label, value }) => {
                    return value === 'auto' ? label : value;
                  }}
                ></AgentSelect>
              </Form.Item>
            </Suspense>
            <Form.Item noStyle>
              {/* MAPPING §3.3: icon-only, no children -> `IconButton`, whose
                  required `label` finally names this refresh control. */}
              <IconButton
                isLoading={isPendingAgentList}
                onClick={() => {
                  startAgentListTransition(() => updateAgentFetchKey());
                }}
                icon={<RotateCw size="1em" />}
                label={t('button.Refresh')}
                tooltip={t('button.Refresh')}
              />
            </Form.Item>
          </BAIFlex>
        </Form.Item>
      )}
      {!hideClusterFormItems && (
        <Form.Item label={t('session.launcher.ClusterMode')} required>
          <VStack gap={5} align="stretch">
            <Form.Item name={'cluster_mode'} required noStyle>
              <ClusterModeSegmented
                label={t('session.launcher.ClusterMode')}
                onValueChange={() => {
                  form.validateFields().catch(() => {});
                }}
                items={[
                  {
                    value: 'multi-node',
                    label: t('session.launcher.MultiNode'),
                    tooltip: (
                      <Trans i18nKey={'session.launcher.DescMultiNode'} />
                    ),
                  },
                  {
                    value: 'single-node',
                    label: t('session.launcher.SingleNode'),
                    tooltip: (
                      <Trans i18nKey={'session.launcher.DescSingleNode'} />
                    ),
                  },
                ]}
              />
            </Form.Item>
            <>
              <Form.Item
                noStyle
                shouldUpdate={(prev, next) =>
                  prev.cluster_mode !== next.cluster_mode ||
                  prev.cluster_size !== next.cluster_size ||
                  prev.resource?.cpu !== next.resource?.cpu ||
                  prev.resource?.mem !== next.resource?.mem ||
                  prev.resource?.accelerator !== next.resource?.accelerator ||
                  prev.resource?.acceleratorType !==
                    next.resource?.acceleratorType
                }
              >
                {() => {
                  const derivedClusterSizeMaxLimit =
                    keypairResourcePolicy.max_containers_per_session;

                  const clusterUnit =
                    form.getFieldValue('cluster_mode') === 'single-node'
                      ? t('session.launcher.Container')
                      : t('session.launcher.Node');

                  // Calculate max cluster size that can start immediately
                  // based on current resource allocation and remaining resources
                  const { maxImmediateClusterSize, remainingMarkValue } =
                    computeClusterCapacity({
                      remaining,
                      resource: form.getFieldValue('resource'),
                      maxContainersPerSession: derivedClusterSizeMaxLimit,
                    });

                  return (
                    <Form.Item
                      name={'cluster_size'}
                      noStyle
                      required
                      dependencies={[
                        ['resource', 'cpu'],
                        ['resource', 'mem'],
                        ['resource', 'accelerator'],
                        ['resource', 'acceleratorType'],
                      ]}
                      rules={[
                        {
                          warningOnly: true,
                          validator: async (_rule, value: number) => {
                            if (
                              clusterSizeIssues({
                                clusterMode: form.getFieldValue('cluster_mode'),
                                clusterSize: value,
                                maxImmediateClusterSize,
                                showRemainingWarning,
                              }).multiNodeSizeOne
                            ) {
                              return Promise.reject(
                                t(
                                  'session.launcher.ClusterSizeOneMultiNodeConvertInfo',
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                        {
                          warningOnly: true,
                          validator: async (_rule, value: number) => {
                            if (
                              clusterSizeIssues({
                                clusterMode: form.getFieldValue('cluster_mode'),
                                clusterSize: value,
                                maxImmediateClusterSize,
                                showRemainingWarning,
                              }).exceedsImmediateCapacity
                            ) {
                              return Promise.reject(
                                t(
                                  'session.launcher.ClusterSizeExceedsImmediateCapacity',
                                  {
                                    maxClusterSize: maxImmediateClusterSize,
                                    unit: clusterUnit,
                                  },
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumberWithSlider
                        inputContainerMinWidth={190}
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
                            ...(remainingMarkValue && showRemainingWarning
                              ? {
                                  [remainingMarkValue]: {
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
                          suffix: clusterUnit,
                        }}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </>
          </VStack>
        </Form.Item>
      )}
    </>
  );
};

const MemoizedResourceAllocationFormItems = React.memo(
  ResourceAllocationFormItems,
);

export default MemoizedResourceAllocationFormItems;
