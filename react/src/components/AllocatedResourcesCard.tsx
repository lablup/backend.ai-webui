import Flex from './Flex';
import ResourceGroupSelect from './ResourceGroupSelect';
import ResourceUnit, { ResourceUnitProps } from './ResourceUnit';
import { SyncOutlined } from '@ant-design/icons';
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

interface AllocatedResourcesCardProps extends CardProps {}

const AllocatedResourcesCard: React.FC<AllocatedResourcesCardProps> = ({
  ...cardProps
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const resourceUnitMockData: Array<ResourceUnitProps> = [
    {
      name: 'CPU',
      displayUnit: 'Core',
      value: 12,
      percentage: (4 / 12) * 100,
    },
    {
      name: 'RAM',
      displayUnit: 'GiB',
      value: 256,
      percentage: (8 / 12) * 100,
    },
    {
      name: 'FGPU',
      displayUnit: 'GiB',
      value: 3.5,
      percentage: (4 / 12) * 100,
    },
    {
      name: 'ATOM',
      displayUnit: 'Unit',
      value: 2,
      percentage: (2 / 12) * 100,
    },
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
      <Card
        {...cardProps}
        style={{
          width: '100%',
          height: 240,
          // width: 936,
          // height: 192,
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
        <Flex justify="between" style={{ maxWidth: 630 }}>
          {_.map(
            resourceUnitMockData,
            (resourceUnit: ResourceUnitProps, index) => (
              <>
                <ResourceUnit
                  key={index}
                  name={resourceUnit.name}
                  displayUnit={resourceUnit.displayUnit}
                  value={resourceUnit.value}
                  percentage={resourceUnit.percentage}
                />
                {index < resourceUnitMockData.length - 1 && (
                  <Divider type="vertical" style={{ height: 70 }} />
                )}
              </>
            ),
          )}
        </Flex>
      </Card>
    </ConfigProvider>
  );
};

export default AllocatedResourcesCard;
