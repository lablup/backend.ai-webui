/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceSlotName } from '../hooks/backendai';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import SharedResourceGroupSelectForCurrentProject from './SharedResourceGroupSelectForCurrentProject';
import { useControllableValue } from 'ahooks';
import { Segmented, Skeleton, theme, Typography } from 'antd';
import {
  BAIFlex,
  BAIBoardItemTitle,
  ResourceStatistics,
  convertToNumber,
  processMemoryValue,
  BAIFetchKeyButton,
  BAIFlexProps,
  useResourceSlotsDetails,
  useFetchKey,
} from 'backend.ai-ui';
import _ from 'lodash';
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

    const accelerators = _.chain(resourceSlotsDetails?.resourceSlotsInRG)
      .omit(['cpu', 'mem'])
      .map((resourceSlot, key) => {
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
        if (!isFinite(usingCurrent) && !isFinite(remainingCurrent)) return null;

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
      })
      .compact()
      .value();

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
            <Typography.Text
              style={{
                fontSize: token.fontSizeHeading5,
                fontWeight: token.fontWeightStrong,
              }}
            >
              {t('webui.menu.MyResourcesIn')}
            </Typography.Text>
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
            <Segmented<
              Exclude<
                MyResourceWithinResourceGroupProps['displayType'],
                undefined
              >
            >
              size="small"
              options={[
                {
                  label: t('dashboard.Used'),
                  value: 'used',
                },
                {
                  label: t('dashboard.Free'),
                  value: 'free',
                },
              ]}
              value={displayType}
              onChange={(v) => v && setDisplayType(v)}
            />
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
        <Skeleton active />
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
