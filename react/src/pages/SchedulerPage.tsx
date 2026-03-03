/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Result, Skeleton, theme, Tooltip } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { parseAsString, useQueryStates } from 'nuqs';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';
import { type ErrorWithGraphQL } from 'src/components/BAIErrorBoundary';
import FairShareList from 'src/components/FairShareItems/FairShareList';
import { useWebUINavigate } from 'src/hooks';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const tabParam = withDefault(StringParam, 'fair-share');

interface SchedulerPageProps {}

const SchedulerPage: React.FC<SchedulerPageProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [curTabKey] = useQueryParam('tab', tabParam);
  const webUINavigate = useWebUINavigate();

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => {
        webUINavigate(
          {
            pathname: '/fair-share',
            search: new URLSearchParams({
              tab: key,
            }).toString(),
          },
          {
            params: {
              tab: key,
            },
          },
        );
      }}
      tabList={[
        {
          key: 'fair-share',
          tab: (
            <BAIFlex gap="xxs">
              {t('fairShare.FairShareSetting')}
              <Tooltip
                title={<Trans i18nKey={t('fairShare.SchedulerDescription')} />}
              >
                <QuestionCircleOutlined style={{ fontSize: token.fontSize }} />
              </Tooltip>
            </BAIFlex>
          ),
        },
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'fair-share' && (
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => {
              const gqlError = error as ErrorWithGraphQL;
              // Check for invalid query parameters causing GraphQL errors
              const isWrongParameterError = _.some(
                gqlError?.source?.errors,
                (err) =>
                  _.some(
                    [
                      'Cannot return null for non-nullable field Query',
                      'No such domain',
                      'No such scaling group',
                      'No such project',
                      'No such user',
                    ],
                    (msg) => _.includes(err?.message, msg),
                  ),
              );

              return (
                <FairShareErrorFallback
                  isInvalidURLParameterError={isWrongParameterError}
                  onReset={resetErrorBoundary}
                />
              );
            }}
          >
            <FairShareList />
          </ErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default SchedulerPage;

const FairShareErrorFallback: React.FC<{
  isInvalidURLParameterError: boolean;
  onReset: () => void;
}> = ({ isInvalidURLParameterError, onReset }) => {
  const { t } = useTranslation();
  const [, setStepQueryParams] = useQueryStates(
    {
      resourceGroup: parseAsString,
      domain: parseAsString,
      project: parseAsString,
      user: parseAsString,
    },
    { history: 'push' },
  );

  return (
    <Result
      status="warning"
      title={
        isInvalidURLParameterError
          ? t('fairShare.InvalidParameterTitle')
          : t('fairShare.UnknownErrorOccurred')
      }
      subTitle={
        isInvalidURLParameterError
          ? t('fairShare.InvalidParameterDescription')
          : t('fairShare.UnknownErrorDescription')
      }
      extra={
        <Button
          type="primary"
          onClick={() => {
            setStepQueryParams({
              resourceGroup: null,
              domain: null,
              project: null,
              user: null,
            });
            onReset();
          }}
        >
          {t('fairShare.GoBackToFirstStep')}
        </Button>
      }
    />
  );
};
