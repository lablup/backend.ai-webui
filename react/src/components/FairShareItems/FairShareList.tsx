/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FairShareListProjectNameQuery } from '../../__generated__/FairShareListProjectNameQuery.graphql';
import DomainFairShareStep from './DomainFairShareStep';
import ProjectFairShareStep from './ProjectFairShareStep';
import ResourceGroupFairShareStep from './ResourceGroupFairShareStep';
import UserFairShareStep from './UserFairShareStep';
import { Alert, Skeleton, Steps, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { StepsProps } from 'antd/lib';
import {
  BAIQuestionIconWithTooltip,
  BAIBackButton,
  BAIFlex,
  BAIText,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Ban } from 'lucide-react';
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { Suspense, useDeferredValue, useEffect, useEffectEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const useStyles = createStyles(({ css, token }) => ({
  step: css`
    .ant-steps-item-finish,
    .ant-steps-item-finish .ant-steps-panel-arrow > path {
      background-color: ${token.colorBgContainerDisabled} !important;
      fill: ${token.colorBgContainerDisabled} !important;
    }
  `,
}));

type FairShareStepKey = 'resource-group' | 'domain' | 'project' | 'user';

type StepItem = NonNullable<StepsProps['items']>[number];

const FairShareList: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { styles } = useStyles();

  const [stepQueryParams, setStepQueryParams] = useQueryStates(
    {
      resourceGroup: parseAsString.withDefault(''),
      domain: parseAsString.withDefault(''),
      project: parseAsString.withDefault(''),
    },
    { history: 'push' },
  );
  const deferredStepQueryParams = useDeferredValue(stepQueryParams);
  const currentStep = !deferredStepQueryParams.resourceGroup
    ? 'resource-group'
    : !deferredStepQueryParams.domain
      ? 'domain'
      : !deferredStepQueryParams.project
        ? 'project'
        : 'user';

  // order/filter/current are owned by the step components but share the same
  // URL keys across steps, so they must be cleared on every step transition.
  const [, setPerStepQueryParams] = useQueryStates({
    order: parseAsString,
    filter: parseAsJson<any>((value) => value),
    current: parseAsInteger,
  });
  const resetPerStepQueryParams = () => {
    setPerStepQueryParams({
      order: null,
      filter: null,
      current: null,
    });
  };

  const isStepTransitionPending = stepQueryParams !== deferredStepQueryParams;

  const stepItems: Array<StepItem & { key: FairShareStepKey }> = [
    {
      key: 'resource-group',
      title: (
        <BAIFlex gap="xxs" align="end">
          <BAIText
            style={{
              fontSize: 'inherit',
              color: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('fairShare.ResourceGroup')}
          </BAIText>
          {deferredStepQueryParams.resourceGroup && (
            <BAIText
              type="secondary"
              ellipsis={{
                tooltip: {
                  title: deferredStepQueryParams.resourceGroup,
                },
              }}
              style={{
                maxWidth: '100%',
                minWidth: 0,
              }}
            >
              {`(${deferredStepQueryParams.resourceGroup})`}
            </BAIText>
          )}
        </BAIFlex>
      ),
      onClick: () => {
        setStepQueryParams({
          resourceGroup: null,
          domain: null,
          project: null,
        });
      },
    },
    {
      key: 'domain',
      title: (
        <BAIFlex gap="xxs" align="end">
          <BAIText
            style={{
              fontSize: 'inherit',
              color: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('fairShare.Domain')}
          </BAIText>
          <BAIText
            type="secondary"
            ellipsis={{
              tooltip: {
                title: deferredStepQueryParams.domain,
              },
            }}
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            {deferredStepQueryParams.domain &&
              `(${deferredStepQueryParams.domain})`}
          </BAIText>
        </BAIFlex>
      ),
      onClick: () => {
        setStepQueryParams({
          domain: null,
          project: null,
        });
      },
    },
    {
      key: 'project',
      title: (
        <BAIFlex gap="xxs" align="end">
          <BAIText
            style={{
              fontSize: 'inherit',
              color: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('fairShare.Project')}
          </BAIText>
          {deferredStepQueryParams.project && (
            <ProjectStepNameText projectId={deferredStepQueryParams.project} />
          )}
        </BAIFlex>
      ),

      onClick: () => {
        setStepQueryParams({
          project: null,
        });
      },
    },
    { key: 'user', title: t('fairShare.User') },
  ];

  const getNavigateTo = () => {
    switch (currentStep) {
      default:
        return '';
      case 'project':
        return `?${new URLSearchParams({
          resourceGroup: deferredStepQueryParams.resourceGroup || '',
        })}`;
      case 'user':
        return `?${new URLSearchParams({
          resourceGroup: deferredStepQueryParams.resourceGroup || '',
          domain: deferredStepQueryParams.domain || '',
        })}`;
    }
  };

  const urlInitialLoadEffect = useEffectEvent(() => {
    if (stepQueryParams.resourceGroup === '') {
      setStepQueryParams({
        resourceGroup: null,
        domain: null,
        project: null,
      });
    } else if (stepQueryParams.domain === '') {
      setStepQueryParams({
        domain: null,
        project: null,
      });
    } else if (stepQueryParams.project === '') {
      setStepQueryParams({
        project: null,
      });
    }
  });
  useEffect(() => {
    urlInitialLoadEffect();
  }, []);

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      <Alert type="info" title={t('fairShare.step.Description')} showIcon />
      <Steps
        className={styles.step}
        type="panel"
        current={stepItems.findIndex((item) => item.key === currentStep)}
        onChange={() => {
          resetPerStepQueryParams();
        }}
        items={_.map(stepItems, (item, idx) => ({
          ...item,
          disabled:
            idx > stepItems.findIndex((item) => item.key === currentStep),
          icon:
            idx > stepItems.findIndex((item) => item.key === currentStep) ? (
              <Ban />
            ) : undefined,
        }))}
        styles={{
          itemTitle: {
            overflow: 'hidden',
          },
        }}
      />

      <BAIFlex direction="column" align="stretch" gap="xs">
        <FairShareListTitle
          currentStep={currentStep}
          navigateTo={getNavigateTo()}
        />
        <Suspense fallback={<Skeleton active />}>
          {currentStep === 'resource-group' && (
            <ResourceGroupFairShareStep
              loading={isStepTransitionPending}
              onClickResourceGroupName={(resourceGroupName) => {
                setStepQueryParams({ resourceGroup: resourceGroupName });
                resetPerStepQueryParams();
              }}
            />
          )}
          {currentStep === 'domain' && (
            <DomainFairShareStep
              resourceGroupName={deferredStepQueryParams.resourceGroup}
              loading={isStepTransitionPending}
              onClickDomainName={(domainName) => {
                setStepQueryParams({ domain: domainName });
                resetPerStepQueryParams();
              }}
            />
          )}
          {currentStep === 'project' && (
            <ProjectFairShareStep
              resourceGroupName={deferredStepQueryParams.resourceGroup}
              domainName={deferredStepQueryParams.domain}
              loading={isStepTransitionPending}
              onClickProjectName={(projectId) => {
                setStepQueryParams({ project: projectId });
                resetPerStepQueryParams();
              }}
            />
          )}
          {currentStep === 'user' && (
            <UserFairShareStep
              resourceGroupName={deferredStepQueryParams.resourceGroup}
              domainName={deferredStepQueryParams.domain}
              projectId={deferredStepQueryParams.project}
              loading={isStepTransitionPending}
            />
          )}
        </Suspense>
      </BAIFlex>
    </BAIFlex>
  );
};

export default FairShareList;

const ProjectStepNameText: React.FC<{ projectId: string }> = ({
  projectId,
}) => {
  'use memo';

  const { project } = useLazyLoadQuery<FairShareListProjectNameQuery>(
    graphql`
      query FairShareListProjectNameQuery($projectId: UUID!) {
        project: projectV2(projectId: $projectId) {
          basicInfo {
            name
          }
        }
      }
    `,
    { projectId },
  );
  const projectName = project?.basicInfo?.name || '';

  return (
    <BAIText
      type="secondary"
      ellipsis={{
        tooltip: { title: projectName },
      }}
      style={{
        minWidth: 0,
        flex: 1,
      }}
    >
      {projectName && `(${projectName})`}
    </BAIText>
  );
};

const FairShareListTitle: React.FC<{
  currentStep: FairShareStepKey;
  navigateTo: string;
}> = ({ currentStep, navigateTo }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <BAIFlex gap={'xs'}>
      {currentStep !== 'resource-group' && <BAIBackButton to={navigateTo} />}
      <Typography.Title level={4} style={{ margin: 0 }}>
        {currentStep === 'resource-group'
          ? t('fairShare.ResourceGroup')
          : currentStep === 'domain'
            ? t('fairShare.Domain')
            : currentStep === 'project'
              ? t('fairShare.Project')
              : t('fairShare.User')}
      </Typography.Title>
      <BAIQuestionIconWithTooltip
        style={{
          fontSize: token.fontSizeHeading4,
        }}
        title={
          <Trans
            i18nKey={
              currentStep === 'resource-group'
                ? 'fairShare.ResourceGroupDescription'
                : currentStep === 'domain'
                  ? 'fairShare.DomainDescription'
                  : currentStep === 'project'
                    ? 'fairShare.ProjectDescription'
                    : 'fairShare.UserDescription'
            }
          />
        }
      />
    </BAIFlex>
  );
};
