import { useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  MergedResourceLimits,
  RemainingSlots,
  ResourceAllocation,
  useResourceLimitAndRemaining,
} from '../hooks/useResourceLimitAndRemaining';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import BaseResourceItem, {
  AcceleratorSlotDetail,
  ResourceValues,
} from './BaseResourceItem';
import { useControllableValue } from 'ahooks';
import { Segmented, theme, Typography } from 'antd';
import { BAIBoardItemTitle, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { ReactNode, useCallback, useMemo, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useFetchKey } from 'src/hooks';

interface MyResourceProps {
  fetchKey?: string;
  refetching?: boolean;
  displayType?: 'using' | 'remaining';
  onDisplayTypeChange?: (type: 'using' | 'remaining') => void;
  extra?: ReactNode;
}

const getResourceValue = (
  type: MyResourceProps['displayType'],
  resource: string,
  checkPresetInfo: ResourceAllocation | null,
  remainingWithoutResourceGroup: RemainingSlots,
  resourceLimitsWithoutResourceGroup: MergedResourceLimits,
): ResourceValues => {
  const getTotalValue = () => {
    let maxValue;
    maxValue = _.get(
      resourceLimitsWithoutResourceGroup,
      _.includes(['cpu', 'mem'], resource)
        ? [resource, 'max']
        : ['accelerators', resource, 'max'],
    );
    return maxValue;
  };
  const totalValue = getTotalValue();

  const getCurrentValue = () => {
    if (type === 'using') {
      return _.get(checkPresetInfo?.keypair_using, resource);
    }
    return _.get(
      remainingWithoutResourceGroup,
      _.includes(['cpu', 'mem'], resource)
        ? resource
        : ['accelerators', resource],
    );
  };
  const currentValue = getCurrentValue();

  return {
    current: currentValue || 0,
    total: totalValue,
  };
};

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
  const [displayType, setDisplayType] = useControllableValue<
    Exclude<MyResourceProps['displayType'], undefined>
  >(props, {
    defaultValue: 'using',
    trigger: 'onDisplayTypeChange',
    defaultValuePropName: 'defaultDisplayType',
  });

  const acceleratorSlotsDetails = useMemo(() => {
    return _.chain(resourceSlotsDetails?.resourceSlotsInRG)
      .omit(['cpu', 'mem'])
      .map((resourceSlot, key) => ({
        key,
        resourceSlot,
        values: getResourceValue(
          displayType,
          key,
          checkPresetInfo ?? null,
          remainingWithoutResourceGroup,
          resourceLimitsWithoutResourceGroup,
        ),
      }))
      .filter((item) => Boolean(item.resourceSlot))
      .value() as AcceleratorSlotDetail[];
  }, [
    resourceSlotsDetails,
    displayType,
    checkPresetInfo,
    remainingWithoutResourceGroup,
    resourceLimitsWithoutResourceGroup,
  ]);

  const getResourceValueForCard = useCallback(
    (resource: string) =>
      getResourceValue(
        displayType,
        resource,
        checkPresetInfo ?? null,
        remainingWithoutResourceGroup,
        resourceLimitsWithoutResourceGroup,
      ),
    [
      displayType,
      checkPresetInfo,
      remainingWithoutResourceGroup,
      resourceLimitsWithoutResourceGroup,
    ],
  );

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
          <Typography.Text
            style={{
              fontSize: token.fontSizeHeading5,
              fontWeight: token.fontWeightStrong,
            }}
          >
            {t('webui.menu.MyResources')}
          </Typography.Text>
        }
        tooltip={<Trans i18nKey={'webui.menu.MyResourcesDescription'} />}
        extra={
          <BAIFlex gap={'xs'}>
            <Segmented<Exclude<MyResourceProps['displayType'], undefined>>
              size="small"
              options={[
                {
                  label: t('resourcePanel.UsingNumber'),
                  value: 'using',
                },
                {
                  value: 'remaining',
                  label: t('resourcePanel.Limit'),
                },
              ]}
              value={displayType}
              onChange={(v) => setDisplayType(v)}
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
      <BaseResourceItem
        {...props}
        getResourceValue={getResourceValueForCard}
        acceleratorSlotsDetails={acceleratorSlotsDetails}
        resourceSlotsDetails={resourceSlotsDetails}
        progressProps={{
          showProgress: true,
          steps: 12,
        }}
      />
    </BAIFlex>
  );
};

export default MyResource;
