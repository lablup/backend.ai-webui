import AllocatedResourcesCard from '../components/AllocatedResourcesCard';
import { parseFilterValue } from '../components/BAIPropertyFilter';
import BAIStartSimpleCard from '../components/BAIStartSimpleCard';
import Flex from '../components/Flex';
import NeoSessionList from '../components/NeoSessionList';
import SessionsIcon from '../components/icons/SessionsIcon';
import { useWebUINavigate } from '../hooks';
import { Card, Typography, Button, Tabs, Badge, theme } from 'antd';
import { t } from 'i18next';
import _ from 'lodash';
import React, { Suspense, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const TAB_ITEMS_MAP = {
  all: t('general.All'),
  interactive: t('session.Interactive'),
  batch: t('session.Batch'),
  inference: t('session.Inference'),
  system: 'System',
};

type TypeKey = 'all' | 'interactive' | 'batch' | 'inference' | 'system';

const MOCK_TOTAL_DATA = {
  all: '83',
  interactive: '44/83',
  batch: '32/83',
  inference: '6/83',
  system: '1/83',
};

interface NeoSessionPageProps {}

const NeoSessionPage: React.FC<NeoSessionPageProps> = (props) => {
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [type, setType] = useState<TypeKey>(
    (searchParams.get('type') as TypeKey) || 'all',
  );

  return (
    <Flex direction="column" align="stretch" gap={16}>
      <Flex align="start" gap={16}>
        <BAIStartSimpleCard
          icon={<SessionsIcon />}
          title={'Create a Session'}
          footerButtonProps={{
            onClick: () => {
              webuiNavigate('/session/start');
            },
            children: 'Start Session',
          }}
          styles={{
            body: {
              height: 240,
            },
          }}
        />
        <AllocatedResourcesCard />
      </Flex>
      <Flex align="stretch" direction="column">
        <Card>
          <Flex justify="between" style={{ marginBottom: 22 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t('session.launcher.Sessions')}
            </Typography.Title>
            <Button
              type="primary"
              onClick={() => webuiNavigate('/session/start')}
            >
              Session Start
            </Button>
          </Flex>
          <Tabs
            type="card"
            items={_.map(TAB_ITEMS_MAP, (label, key) => ({
              key,
              label: (
                <Flex style={{ width: 124 }} justify="center" gap={10}>
                  {label}
                  <Badge
                    count={_.get(MOCK_TOTAL_DATA, key)}
                    color={token.colorPrimary}
                  />
                </Flex>
              ),
              children: (
                <Suspense>
                  <NeoSessionList
                    key={key}
                    filter={
                      ['interactive', 'batch', 'inference'].includes(type)
                        ? `type == "${_.toUpper(type)}"`
                        : null
                    }
                  />
                </Suspense>
              ),
            }))}
            onChange={(key) => {
              setSearchParams({ ...searchParams, type: key });
              setType(key as TypeKey);
            }}
            defaultActiveKey={type}
          />
        </Card>
      </Flex>
    </Flex>
  );
};

export default NeoSessionPage;
