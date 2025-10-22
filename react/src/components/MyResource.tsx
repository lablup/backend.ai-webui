import { ResourceSlotName, useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import { Segmented, theme } from 'antd';
import {
  BAIBoardItemTitle,
  BAIFlex,
  BAIFlexProps,
  ResourceStatistics,
  convertToNumber,
  processMemoryValue,
} from 'backend.ai-ui';
import _ from 'lodash';
import { ReactNode, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useFetchKey } from 'src/hooks';

interface MyResourceProps extends BAIFlexProps {
  fetchKey?: string;
  refetching?: boolean;
  extra?: ReactNode;
}

const MyResource: React.FC<MyResourceProps> = ({
  fetchKey,
  refetching,
  extra,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentProject = useCurrentProjectValue();

  const [internalFetchKey, updateInternalFetchKey] = useFetchKey();
  const [isPending, startTransition] = useTransition();
  const [
    {
      checkPresetInfo,
      resourceLimitsWithoutResourceGroup,
      remainingWithoutResourceGroup,
    },
  ] = useResourceLimitAndRemaining({
    currentProjectName: currentProject.name,
    ignorePerContainerConfig: true,
    fetchKey: `${fetchKey}${internalFetchKey}`,
  });

  const resourceSlotsDetails = useResourceSlotsDetails();

  const resourceData = (() => {
    const cpuSlot = resourceSlotsDetails?.resourceSlotsInRG?.['cpu'];
    const memSlot = resourceSlotsDetails?.resourceSlotsInRG?.['mem'];

    // Helper function to process memory values

    const cpuData = cpuSlot
      ? {
          used: {
            current: convertToNumber(checkPresetInfo?.keypair_using.cpu),
            total: convertToNumber(resourceLimitsWithoutResourceGroup.cpu?.max),
          },
          free: {
            current: convertToNumber(remainingWithoutResourceGroup.cpu),
            total: convertToNumber(resourceLimitsWithoutResourceGroup.cpu?.max),
          },
          metadata: {
            title: cpuSlot.human_readable_name,
            displayUnit: cpuSlot.display_unit,
          },
        }
      : null;

    const memoryData = memSlot
      ? {
          used: {
            current: processMemoryValue(
              checkPresetInfo?.keypair_using.mem,
              memSlot.display_unit,
            ),
            total: processMemoryValue(
              resourceLimitsWithoutResourceGroup.mem?.max,
              memSlot.display_unit,
            ),
          },
          free: {
            current: processMemoryValue(
              remainingWithoutResourceGroup.mem,
              memSlot.display_unit,
            ),
            total: processMemoryValue(
              resourceLimitsWithoutResourceGroup.mem?.max,
              memSlot.display_unit,
            ),
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

        return {
          key,
          used: {
            current: convertToNumber(
              checkPresetInfo?.keypair_using[key as ResourceSlotName],
            ),
            total: convertToNumber(
              resourceLimitsWithoutResourceGroup.accelerators[key]?.max,
            ),
          },
          free: {
            current: convertToNumber(
              remainingWithoutResourceGroup.accelerators[key],
            ),
            total: convertToNumber(
              resourceLimitsWithoutResourceGroup.accelerators[key]?.max,
            ),
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
  })();

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
        title={t('webui.menu.MyResources')}
        tooltip={<Trans i18nKey={'webui.menu.MyResourcesDescription'} />}
        extra={
          <BAIFlex gap={'xs'}>
            <Segmented
              size="small"
              options={[
                {
                  label: t('dashboard.Used'),
                  value: 'used',
                },
              ]}
              value={'used'}
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
        displayType="used"
        showProgress={true}
      />
    </BAIFlex>
  );
};

export default MyResource;
