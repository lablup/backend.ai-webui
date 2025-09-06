import { ResourceSlotName, useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { useControllableValue } from 'ahooks';
import { Segmented, theme, Typography } from 'antd';
import {
  BAIFlex,
  BAIBoardItemTitle,
  ResourceStatistics,
  convertToBinaryUnit,
  getDisplayUnitToInputSizeUnit,
} from 'backend.ai-ui';
import _ from 'lodash';
import {
  ReactNode,
  useDeferredValue,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useFetchKey } from 'src/hooks';

const convertToNumber = (value: any): number => {
  if (value === null || value === undefined || value === 'Infinity') {
    return Number.POSITIVE_INFINITY;
  }
  return Number(value) || 0;
};

interface MyResourceWithinResourceGroupProps {
  fetchKey?: string;
  refetching?: boolean;
  onResourceGroupChange?: (resourceGroup: string) => void;
  displayType?: 'using' | 'remaining';
  onDisplayTypeChange?: (type: 'using' | 'remaining') => void;
  extra?: ReactNode;
}

const MyResourceWithinResourceGroup: React.FC<
  MyResourceWithinResourceGroupProps
> = ({ fetchKey, refetching, onResourceGroupChange, extra, ...props }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const currentProject = useCurrentProjectValue();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<string>();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);
  const [internalFetchKey, updateInternalFetchKey] = useFetchKey();
  const [isPending, startTransition] = useTransition();

  const [{ checkPresetInfo }] = useResourceLimitAndRemaining({
    currentProjectName: currentProject.name,
    currentResourceGroup: deferredSelectedResourceGroup || 'default',
    fetchKey: `${fetchKey}${internalFetchKey}`,
  });

  const resourceSlotsDetails = useResourceSlotsDetails(
    deferredSelectedResourceGroup || 'default',
  );
  const [displayType, setDisplayType] = useControllableValue<
    Exclude<MyResourceWithinResourceGroupProps['displayType'], undefined>
  >(props, {
    defaultValue: 'remaining',
    trigger: 'onDisplayTypeChange',
    defaultValuePropName: 'defaultDisplayType',
  });

  const resourceData = useMemo(() => {
    const cpuSlot = resourceSlotsDetails?.resourceSlotsInRG?.['cpu'];
    const memSlot = resourceSlotsDetails?.resourceSlotsInRG?.['mem'];
    const resourceGroup = deferredSelectedResourceGroup || 'default';

    // Helper function to process memory values
    const processMemoryValue = (value: any, displayUnit: string): number => {
      const numValue = convertToNumber(value);
      if (isFinite(numValue) && displayUnit) {
        const converted = convertToBinaryUnit(
          value,
          getDisplayUnitToInputSizeUnit(displayUnit),
        );
        return converted?.number || numValue;
      }
      return numValue;
    };

    const cpuData = cpuSlot
      ? {
          using: {
            current: convertToNumber(
              checkPresetInfo?.scaling_groups?.[resourceGroup]?.using?.cpu,
            ),
            total: undefined, // No total for resource group view
          },
          remaining: {
            current: convertToNumber(
              checkPresetInfo?.scaling_groups?.[resourceGroup]?.remaining?.cpu,
            ),
            total: undefined,
          },
          metadata: {
            title: cpuSlot.human_readable_name,
            displayUnit: cpuSlot.display_unit,
          },
        }
      : null;

    const memoryData = memSlot
      ? {
          using: {
            current: processMemoryValue(
              checkPresetInfo?.scaling_groups?.[resourceGroup]?.using?.mem,
              memSlot.display_unit,
            ),
            total: undefined,
          },
          remaining: {
            current: processMemoryValue(
              checkPresetInfo?.scaling_groups?.[resourceGroup]?.remaining?.mem,
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
        if (!resourceSlot) return null;

        const usingCurrent = convertToNumber(
          checkPresetInfo?.scaling_groups?.[resourceGroup]?.using?.[
            key as ResourceSlotName
          ],
        );
        const remainingCurrent = convertToNumber(
          checkPresetInfo?.scaling_groups?.[resourceGroup]?.remaining?.[
            key as ResourceSlotName
          ],
        );

        // Filter out if both using and remaining have no values
        if (
          (usingCurrent === 0 || !isFinite(usingCurrent)) &&
          (remainingCurrent === 0 || !isFinite(remainingCurrent))
        )
          return null;

        return {
          key,
          using: {
            current: usingCurrent,
            total: undefined,
          },
          remaining: {
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
  }, [checkPresetInfo, resourceSlotsDetails, deferredSelectedResourceGroup]);

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token.paddingXL,
        paddingBottom: token.padding,
      }}
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
            <ResourceGroupSelectForCurrentProject
              size="small"
              showSearch
              onChange={(v) => {
                setSelectedResourceGroup(v);
                onResourceGroupChange?.(v);
              }}
              loading={selectedResourceGroup !== deferredSelectedResourceGroup}
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
                  label: t('resourcePanel.UsingNumber'),
                  value: 'using',
                },
                {
                  label: t('resourcePanel.RemainingNumber'),
                  value: 'remaining',
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

      <ResourceStatistics
        resourceData={resourceData}
        displayType={displayType}
        showProgress={false}
      />
    </BAIFlex>
  );
};

export default MyResourceWithinResourceGroup;
