/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { type ErrorWithGraphQL } from '../components/BAIErrorBoundary';
import FairShareList from '../components/FairShareItems/FairShareList';
import { theme } from '../theme-shim';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { BAISkeleton, BAICard } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleHelp, TriangleAlertIcon } from 'lucide-react';
import {
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from 'nuqs';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';

interface SchedulerPageProps {}

const SchedulerPage: React.FC<SchedulerPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [currentTab] = useQueryState(
    'tab',
    parseAsStringLiteral(['fair-share']).withDefault('fair-share'),
  );

  return (
    <BAICard
      activeTabKey={currentTab}
      tabList={[
        {
          key: 'fair-share',
          // The tab's own text stays a plain STRING and the help affordance
          // moves to `endContent` (added to `BAICardTabItem` in this wave).
          // A JSX label was rendered twice — once flattened into Astryx `Tab`'s
          // required string `label`, once again as the trailing node.
          label: t('fairShare.FairShareSetting'),
          endContent: (
            // antd `Tooltip title=` -> Astryx `Tooltip content=`. The trigger
            // has to be an interactive element for the hint to be
            // keyboard-reachable, so the bare lucide glyph gets the same reset
            // `<button>` wrapper `BAIQuestionIconWithTooltipAstryx` uses.
            <Tooltip
              content={<Trans i18nKey={t('fairShare.SchedulerDescription')} />}
            >
              <button
                type="button"
                aria-label={t('fairShare.SchedulerDescription')}
                style={{
                  all: 'unset',
                  cursor: 'help',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <CircleHelp style={{ fontSize: token.fontSize }} size="1em" />
              </button>
            </Tooltip>
          ),
        },
      ]}
    >
      <Suspense fallback={<BAISkeleton />}>
        {currentTab === 'fair-share' && (
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => {
              const gqlError = error as ErrorWithGraphQL;
              // FIXME: @required(action: THROW) can detect invalid URL params, but cannot distinguish other errors that cause null. Needs a better approach later.
              // Check for invalid query parameters causing GraphQL errors
              const isWrongParameterError =
                _.includes(gqlError?.message, 'domainFairShares') ||
                _.includes(gqlError?.message, 'projectFairShares') ||
                _.includes(gqlError?.message, 'userFairShares');

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
    // antd `Result status="warning"` -> Astryx `EmptyState`, the same route
    // `BAIErrorBoundary` already took: `subTitle` -> `description`, `extra` ->
    // `actions`, and the status illustration becomes an explicit lucide icon.
    <EmptyState
      icon={<TriangleAlertIcon size={40} />}
      title={
        isInvalidURLParameterError
          ? t('fairShare.InvalidParameterTitle')
          : t('fairShare.UnknownErrorOccurred')
      }
      description={
        isInvalidURLParameterError
          ? t('fairShare.InvalidParameterDescription')
          : t('fairShare.UnknownErrorDescription')
      }
      actions={
        <Button
          variant="primary"
          label={t('fairShare.GoBackToFirstStep')}
          onClick={() => {
            setStepQueryParams({
              resourceGroup: null,
              domain: null,
              project: null,
              user: null,
            });
            onReset();
          }}
        />
      }
    />
  );
};
