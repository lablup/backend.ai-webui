import BAICard from '../components/BAICard';
import BAIFetchKeyButton from '../components/BAIFetchKeyButton';
import Flex from '../components/Flex';
import { filterEmptyItem } from '../helper';
import { useUpdatableState, useWebUINavigate } from '../hooks';
import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Skeleton, theme } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';


const EndpointList = React.lazy(() => import('../components/EndpointList'));

interface ServingPageProps {}


const ServingPage: React.FC<ServingPageProps> = ({ ...props }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  return (
    <Flex direction="column" align="stretch" gap={'md'}>
      <BAICard
        title={t('modelService.Services')}
        extra={
          <Flex direction="row" gap={'xs'}>
            <Flex gap={'xs'}>
              <BAIFetchKeyButton
                value={fetchKey}
                onChange={() => {
                  updateFetchKey();
                  // startRefetchTransition(() => updateServicesFetchKey());
                }}
                autoUpdateDelay={7000}
              />
              <Button
                type="primary"
                onClick={() => {
                  webuiNavigate('/service/start');
                }}
              >
                {t('modelService.StartService')}
              </Button>
            </Flex>
          </Flex>
        }
        styles={{
          body: {
            padding: 0,
            paddingTop: 1,
            overflow: 'hidden',
          },
        }}
      >
        <Suspense
          fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
        >
          <EndpointList
            style={{
              padding: token.paddingMD,
            }}
            onDeleted={() => {
              updateFetchKey();
            }}
          />
        </Suspense>
      </BAICard>
    </Flex>
  );
};

export default ServingPage;
