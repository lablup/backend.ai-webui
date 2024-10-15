import { humanReadableBinarySize, iSizeToSize } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import {
  ResourceSlots,
  ResourceAllocation,
  limitParser,
} from '../hooks/useResourceLimitAndRemaining';
import BAILayoutCard from './BAILayoutCard';
import Flex from './Flex';
import ResourceGroupSelect from './ResourceGroupSelect';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import ResourceUnit, { ResourceUnitProps } from './ResourceUnit';
import { QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  CardProps,
  ConfigProvider,
  Divider,
  Switch,
  theme,
  Typography,
} from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AllocatedResourcesCardProps extends CardProps {
  usingSwitch?: boolean;
  width?: number;
}

const AllocatedResourcesCard: React.FC<AllocatedResourcesCardProps> = ({
  usingSwitch,
  width,
  ...cardProps
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const currentResourceGroup = useCurrentResourceGroupValue(); // use global state
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const { data: resourceAllocation, refetch } = useSuspenseTanQuery<
    ResourceAllocation | undefined
  >({
    queryKey: ['check-presets', currentProject.name, currentResourceGroup],
    queryFn: () => {
      if (currentResourceGroup) {
        return baiClient.resourcePreset
          .check({
            group: currentProject.name,
            scaling_group: currentResourceGroup,
          })
          .catch(() => {});
      } else {
        return;
      }
    },
    // onSuccess: (data) => {
    //   if (!data) {
    //     refetch();
    //   }
    // },
    // suspense: !_.isEmpty(currentResourceGroup), //prevent flicking
  });

  const mergeResources = (remaining: any, using: any) => {
    let merged: ResourceSlots = {
      cpu: '',
      mem: '',
    };

    [remaining, using].forEach((obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        const numValue = parseFloat(value as string) || 0;
        merged[key] = (parseFloat(merged[key] || '0') + numValue).toString();
      });
    });

    return merged;
  };

  const remaining =
    resourceAllocation?.scaling_groups[currentResourceGroup as string]
      ?.remaining || {};
  const using =
    resourceAllocation?.scaling_groups[currentResourceGroup as string]?.using ||
    {};
  const mergedResources: ResourceSlots = mergeResources(remaining, using);

  const accelerators = _.omit(mergedResources, ['cpu', 'mem']);
  const usingAccelerators: { [key: string]: string } = _.omit(using, [
    'cpu',
    'mem',
  ]);

  console.log(iSizeToSize(limitParser(using?.mem) + '', 'g', 0));

  const acceleratorData = _.map(accelerators, (value, key) => ({
    name: mergedResourceSlots[key]?.human_readable_name || key.toUpperCase(),
    displayUnit: mergedResourceSlots[key]?.display_unit || 'Unit',
    value: usingAccelerators[key],
    percentage:
      (parseInt(usingAccelerators[key]) / parseInt(mergedResources[key])) * 100,
  }));

  const resourceUnitData: Array<ResourceUnitProps> = [
    {
      name: 'CPU',
      displayUnit: 'Core',
      value: using?.cpu as string,
      percentage:
        (parseInt(using?.cpu as string) / parseInt(mergedResources.cpu)) * 100,
    },
    {
      name: 'RAM',
      displayUnit: 'GiB',
      value: iSizeToSize(limitParser(using?.mem) + '', 'g', 0)?.number?.toFixed(
        1,
      ) as string,
      percentage:
        (parseInt(
          iSizeToSize(limitParser(using?.mem) + '', 'g', 0)
            ?.numberFixed as string,
        ) /
          parseInt(
            iSizeToSize(limitParser(mergedResources.mem) + '', 'g', 0)
              ?.numberFixed as string,
          )) *
        100,
    },
    ...acceleratorData,
  ];
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            onlyIconSizeLG: 20,
          },
        },
      }}
    >
      <BAILayoutCard
        title={
          <Flex direction="row" align="center" justify="start" gap={'xs'}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {'Allocated Resources'}
            </Typography.Title>
            <Button type="text" icon={<QuestionCircleOutlined />} />
            {usingSwitch && <Switch defaultChecked />}
          </Flex>
        }
        extra={
          <>
            <ResourceGroupSelectForCurrentProject
              style={{ minWidth: 151, fontSize: token.fontSizeLG, padding: 0 }}
              variant="borderless"
              showSearch
            />
            <Button
              type="text"
              icon={<SyncOutlined />}
              style={{ color: 'inherit' }}
              onClick={() => {
                refetch();
              }}
            />
          </>
        }
        style={{ width: width ?? 678, height: 192 }}
      >
        <Flex justify="between" align="stretch" style={{ width: '100%' }}>
          {_.map(resourceUnitData, (resourceUnit: ResourceUnitProps, index) => (
            <Flex
              style={{ width: `${_.round(100 / resourceUnitData.length)}%` }}
            >
              <ResourceUnit
                key={index}
                name={resourceUnit.name}
                displayUnit={resourceUnit.displayUnit}
                value={resourceUnit.value}
                percentage={resourceUnit.percentage}
                color={'#00BD9B'}
              />
              {index < resourceUnitData.length - 1 && (
                <Divider
                  type="vertical"
                  style={{ height: 70, margin: '0 auto' }}
                />
              )}
            </Flex>
          ))}
        </Flex>
      </BAILayoutCard>
      {/* <Card
        {...cardProps}
        style={{
          // width: '100%',
          // height: 240,
          width: 936,
          height: 192,
        }}
      >
        <Flex justify="between" style={{ marginBottom: 26 }}>
          <Flex gap={10}>
            <Typography.Title
              level={4}
              style={{
                margin: 0,
              }}
            >
              Allocated Resources
            </Typography.Title>
            <Switch defaultChecked />
          </Flex>
          <Flex>
            <ResourceGroupSelect
              placeholder={t('session.ResourceGroup')}
              variant="borderless"
              style={{ minWidth: 151, fontSize: token.fontSizeLG, padding: 0 }}
              dropdownStyle={{ color: '#999999' }}
            />
            <Button
              type="link"
              size="large"
              icon={<SyncOutlined />}
              style={{ padding: 0, color: '#5DD2AD' }}
            />
          </Flex>
        </Flex>
      </Card> */}
    </ConfigProvider>
  );
};

export default AllocatedResourcesCard;
