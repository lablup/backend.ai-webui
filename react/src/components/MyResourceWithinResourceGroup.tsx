import { useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  ResourceAllocation,
  useResourceLimitAndRemaining,
} from '../hooks/useResourceLimitAndRemaining';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import BaseResourceItem, {
  AcceleratorSlotDetail,
  ResourceValues,
} from './BaseResourceItem';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { useControllableValue } from 'ahooks';
import { Segmented, theme, Typography } from 'antd';
import { BAIFlex, BAIBoardItemTitle } from 'backend.ai-ui';
import _ from 'lodash';
import {
  ReactNode,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useFetchKey } from 'src/hooks';

interface MyResourceWithinResourceGroupProps {
  fetchKey?: string;
  refetching?: boolean;
  onResourceGroupChange?: (resourceGroup: string) => void;
  displayType?: 'using' | 'remaining';
  onDisplayTypeChange?: (type: 'using' | 'remaining') => void;
  extra?: ReactNode;
}

const getResourceValue = (
  type: MyResourceWithinResourceGroupProps['displayType'],
  resource: string,
  checkPresetInfo: ResourceAllocation | null,
  resourceGroup: string,
): ResourceValues => {
  const getCurrentValue = () => {
    if (type === 'using') {
      return _.get(
        checkPresetInfo?.scaling_groups?.[resourceGroup]?.using,
        resource,
      );
    }

    return _.get(
      checkPresetInfo?.scaling_groups?.[resourceGroup]?.remaining,
      resource,
    );
  };

  return {
    current: getCurrentValue() || 0,
  };
};

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
          deferredSelectedResourceGroup || 'default',
        ),
      }))
      .filter((item) => Boolean(item.resourceSlot))
      .value() as AcceleratorSlotDetail[];
  }, [
    resourceSlotsDetails,
    displayType,
    checkPresetInfo,
    deferredSelectedResourceGroup,
  ]);

  const getResourceValueForCard = useCallback(
    (resource: string) =>
      getResourceValue(
        displayType,
        resource,
        checkPresetInfo ?? null,
        deferredSelectedResourceGroup || 'default',
      ),
    [displayType, checkPresetInfo, deferredSelectedResourceGroup],
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

      <BaseResourceItem
        {...props}
        getResourceValue={getResourceValueForCard}
        acceleratorSlotsDetails={acceleratorSlotsDetails}
        resourceSlotsDetails={resourceSlotsDetails}
        progressProps={{
          showProgress: false,
        }}
      />
    </BAIFlex>
  );
};

export default MyResourceWithinResourceGroup;
