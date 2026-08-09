/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceSlotName, useResourceSlotsDetails } from '../hooks/backendai';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import { theme } from '../theme-shim';
import SharedResourceGroupSelectForCurrentProject from './SharedResourceGroupSelectForCurrentProject';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Heading } from '@astryxdesign/core/Text';
import {
  BAIBoardItemTitle,
  BAIFetchKeyButton,
  BAIFlex,
  BAIFlexProps,
  ResourceStatistics,
  convertToNumber,
  processMemoryValue,
  useControllableValue,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ReactNode, useDeferredValue, useMemo, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface MyResourceWithinResourceGroupProps extends BAIFlexProps {
  fetchKey?: string;
  refetching?: boolean;
  displayType?: 'used' | 'free';
  onDisplayTypeChange?: (type: 'used' | 'free') => void;
  extra?: ReactNode;
}

const MyResourceWithinResourceGroup: React.FC<
  MyResourceWithinResourceGroupProps
> = ({ fetchKey, refetching, extra, ...props }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const currentProject = useCurrentProjectValue();
  if (!currentProject.name) {
    throw new Error(
      'Project name is required for MyResourceWithinResourceGroup',
    );
  }
  const currentResourceGroup = useCurrentResourceGroupValue();
  const deferredCurrentResourceGroup = useDeferredValue(
    currentResourceGroup || 'default',
  );
  const [internalFetchKey, updateInternalFetchKey] = useFetchKey();
  const [isPending, startTransition] = useTransition();

  const [{ checkPresetInfo }] = useResourceLimitAndRemaining({
    currentProjectName: currentProject.name,
    currentResourceGroup: deferredCurrentResourceGroup,
    fetchKey: `${fetchKey}${internalFetchKey}`,
  });

  const resourceSlotsDetails = useResourceSlotsDetails(
    deferredCurrentResourceGroup,
  );
  const [displayType, setDisplayType] = useControllableValue<
    Exclude<MyResourceWithinResourceGroupProps['displayType'], undefined>
  >(props, {
    defaultValue: 'free',
    trigger: 'onDisplayTypeChange',
    defaultValuePropName: 'defaultDisplayType',
  });

  const resourceData = useMemo(() => {
    const cpuSlot = resourceSlotsDetails?.resourceSlotsInRG?.['cpu'];
    const memSlot = resourceSlotsDetails?.resourceSlotsInRG?.['mem'];
    const cpuData =
      cpuSlot &&
      !_.isUndefined(
        checkPresetInfo?.scaling_groups?.[deferredCurrentResourceGroup]?.using
          ?.cpu,
      )
        ? {
            used: {
              current: convertToNumber(
                checkPresetInfo?.scaling_groups?.[deferredCurrentResourceGroup]
                  ?.using?.cpu,
              ),
              total: undefined, // No total for resource group view
            },
            free: {
              current: convertToNumber(
                checkPresetInfo?.scaling_groups?.[deferredCurrentResourceGroup]
                  ?.remaining?.cpu,
              ),
              total: undefined,
            },
            metadata: {
              title: cpuSlot.human_readable_name,
              displayUnit: cpuSlot.display_unit,
            },
          }
        : null;

    const memoryData =
      memSlot &&
      !_.isUndefined(
        checkPresetInfo?.scaling_groups?.[deferredCurrentResourceGroup]?.using
          ?.mem,
      )
        ? {
            used: {
              current: processMemoryValue(
                checkPresetInfo?.scaling_groups?.[deferredCurrentResourceGroup]
                  ?.using?.mem,
                memSlot.display_unit,
              ),
              total: undefined,
            },
            free: {
              current: processMemoryValue(
                checkPresetInfo?.scaling_groups?.[deferredCurrentResourceGroup]
                  ?.remaining?.mem,
                memSlot.display_unit,
              ),
              total: undefined,
            },
            metadata: {
              title: memSlot.human_readable_name,
              displayUnit: memSlot.display_unit,
            },
          }
        : null;

    const accelerators = _.compact(
      _.map(
        _.omit(resourceSlotsDetails?.resourceSlotsInRG, ['cpu', 'mem']),
        (resourceSlot, key) => {
          if (
            !resourceSlot ||
            _.isUndefined(
              checkPresetInfo?.scaling_groups?.[deferredCurrentResourceGroup]
                ?.using?.[key as ResourceSlotName],
            )
          )
            return null;

          // TODO: convertToNumber should not handle `undefined` as Infinity.
          const usingCurrent = convertToNumber(
            checkPresetInfo?.scaling_groups?.[deferredCurrentResourceGroup]
              ?.using?.[key as ResourceSlotName],
          );
          const remainingCurrent = convertToNumber(
            checkPresetInfo?.scaling_groups?.[deferredCurrentResourceGroup]
              ?.remaining?.[key as ResourceSlotName],
          );

          // Skip displaying if both used and free are not finite numbers
          if (!isFinite(usingCurrent) && !isFinite(remainingCurrent))
            return null;

          return {
            key,
            used: {
              current: usingCurrent,
              total: undefined,
            },
            free: {
              current: remainingCurrent,
              total: undefined,
            },
            metadata: {
              title: resourceSlot.human_readable_name,
              displayUnit: resourceSlot.display_unit,
            },
          };
        },
      ),
    );

    return { cpu: cpuData, memory: memoryData, accelerators };
  }, [checkPresetInfo, resourceSlotsDetails, deferredCurrentResourceGroup]);

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token.paddingXL,
        paddingBottom: token.padding,
        ...props.style,
      }}
      {..._.omit(props, ['style'])}
    >
      <BAIBoardItemTitle
        title={
          <>
            {/* PILOT-DECISION: antd Typography.Text (fontSizeHeading5 +
                fontWeightStrong) -> Astryx Heading level={3}; visual values
                follow Astryx defaults. */}
            <Heading level={3}>{t('webui.menu.MyResourcesIn')}</Heading>
            <SharedResourceGroupSelectForCurrentProject
              size="small"
              showSearch
              loading={currentResourceGroup !== deferredCurrentResourceGroup}
              popupMatchSelectWidth={false}
              tooltip={t('general.ResourceGroup')}
            />
          </>
        }
        tooltip={t('webui.menu.MyResourcesInResourceGroupDescription')}
        extra={
          <BAIFlex gap={'xs'}>
            {/* PILOT-DECISION: SegmentedControl.label is aria-only and required;
                composed from the two option labels to avoid new i18n keys. */}
            <SegmentedControl
              size="sm"
              label={`${t('dashboard.Used')}/${t('dashboard.Free')}`}
              value={displayType}
              onChange={(v) =>
                v &&
                setDisplayType(
                  v as Exclude<
                    MyResourceWithinResourceGroupProps['displayType'],
                    undefined
                  >,
                )
              }
            >
              <SegmentedControlItem value="used" label={t('dashboard.Used')} />
              <SegmentedControlItem value="free" label={t('dashboard.Free')} />
            </SegmentedControl>
            <BAIFetchKeyButton
              size="small"
              loading={isPending || refetching}
              value=""
              onChange={() => {
                startTransition(() => {
                  updateInternalFetchKey();
                });
              }}
              variant="link"
              color="default"
            />
            {extra}
          </BAIFlex>
        }
      />
      {resourceSlotsDetails.isLoading ? (
        // `data-testid` anchor for e2e (`dashboard.spec.ts`): Astryx
        // `Skeleton` renders `aria-hidden="true"` with no default class, so
        // there is no other stable "still loading" selector.
        <BAISkeletonAstryx data-testid="my-resource-skeleton" />
      ) : (
        <ResourceStatistics
          resourceData={resourceData}
          displayType={displayType}
          progressMode="ghost"
        />
      )}
    </BAIFlex>
  );
};

export default MyResourceWithinResourceGroup;
