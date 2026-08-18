/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FairShareListProjectNameQuery } from '../../__generated__/FairShareListProjectNameQuery.graphql';
import { theme } from '../../theme-shim';
import DomainFairShareStep from './DomainFairShareStep';
import ProjectFairShareStep from './ProjectFairShareStep';
import ResourceGroupFairShareStep from './ResourceGroupFairShareStep';
import UserFairShareStep from './UserFairShareStep';
import { Banner } from '@astryxdesign/core/Banner';
import { Heading } from '@astryxdesign/core/Heading';
import { Step, Stepper } from '@astryxdesign/lab';
import {
  BAISkeleton,
  BAIQuestionIconWithTooltip,
  BAIBackButton,
  BAIFlex,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { Suspense, useDeferredValue, useEffect, useEffectEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type FairShareStepKey = 'resource-group' | 'domain' | 'project' | 'user';

/**
 * PILOT-DECISION: antd `Steps` -> lab `Stepper` + `Step` (MAPPING §2, verdict
 * LAB). `Step.label` and `Step.description` are required STRINGS (P2), so each
 * antd `title` — a `BAIFlex` of "<section name>" plus a truncated
 * "(<selected value>)" — splits into exactly those two slots, and the selected
 * project's display name is resolved by this component's own `@skip`ped
 * `projectV2` query instead of a JSX child. That is the split the mapping
 * prescribes for ReactNode labels, and it drops the hand-built
 * ellipsis/tooltip because `Step` truncates its own description.
 *
 * Also dropped with the antd component: `type="panel"` (the arrow-chevron
 * panel skin, which has no Astryx counterpart — `Stepper` draws a progress
 * track), the per-item `icon={<Ban />}` on unreachable steps (`isDisabled`
 * already communicates it, and `Step` owns its indicator), and
 * `styles.itemTitle`. The `createStyles` block existed ONLY to repaint
 * `.ant-steps-item-finish`, so it dies with the component (P6).
 */
type StepItem = {
  key: FairShareStepKey;
  label: string;
  description?: string;
  onClick?: () => void;
};

const FairShareList: React.FC = () => {
  'use memo';

  const { t } = useTranslation();

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

  const { project } = useLazyLoadQuery<FairShareListProjectNameQuery>(
    graphql`
      query FairShareListProjectNameQuery(
        $projectId: UUID!
        $skipProject: Boolean!
      ) {
        project: projectV2(projectId: $projectId) @skip(if: $skipProject) {
          basicInfo {
            name
          }
        }
      }
    `,
    {
      projectId: deferredStepQueryParams.project,
      skipProject: !deferredStepQueryParams.project,
    },
  );
  const selectedProjectName = project?.basicInfo?.name || '';

  const stepItems: Array<StepItem> = [
    {
      key: 'resource-group',
      label: t('fairShare.ResourceGroup'),
      description: deferredStepQueryParams.resourceGroup
        ? `(${deferredStepQueryParams.resourceGroup})`
        : undefined,
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
      label: t('fairShare.Domain'),
      description: deferredStepQueryParams.domain
        ? `(${deferredStepQueryParams.domain})`
        : undefined,
      onClick: () => {
        setStepQueryParams({
          domain: null,
          project: null,
        });
      },
    },
    {
      key: 'project',
      label: t('fairShare.Project'),
      description: deferredStepQueryParams.project
        ? `(${selectedProjectName})`
        : undefined,
      onClick: () => {
        setStepQueryParams({
          project: null,
        });
      },
    },
    { key: 'user', label: t('fairShare.User') },
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
      <Banner status="info" title={t('fairShare.step.Description')} />
      <Stepper
        label={t('fairShare.step.Description')}
        activeStep={stepItems.findIndex((item) => item.key === currentStep)}
        onStepClick={(index) => {
          // antd fired `onChange` (reset the shared per-step URL state) AND
          // the per-item `onClick` (clear that level's query params);
          // `Stepper` has one callback, so both run here.
          resetPerStepQueryParams();
          stepItems[index]?.onClick?.();
        }}
      >
        {_.map(stepItems, (item, idx) => (
          <Step
            key={item.key}
            step={idx}
            label={item.label}
            description={item.description}
            isDisabled={
              idx > stepItems.findIndex((step) => step.key === currentStep)
            }
          />
        ))}
      </Stepper>

      <BAIFlex direction="column" align="stretch" gap="xs">
        <FairShareListTitle
          currentStep={currentStep}
          navigateTo={getNavigateTo()}
        />
        <Suspense fallback={<BAISkeleton />}>
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

const FairShareListTitle: React.FC<{
  currentStep: FairShareStepKey;
  navigateTo: string;
}> = ({ currentStep, navigateTo }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <BAIFlex gap={'xs'}>
      {currentStep !== 'resource-group' && <BAIBackButton to={navigateTo} />}
      {/* antd `Typography.Title level={4}` (20px) -> Astryx `Heading`
          (MAPPING §4: every `level` is a visual decision, not a rename).
          `level={2}` was the 20px rung of Astryx's own ramp; on the restored
          antd ramp (`ANTD_ALIGN_TOKENS`, 38/30/24/20/16) 20px is heading-4,
          and heading-2 is 30px. */}
      <Heading level={4} style={{ margin: 0 }}>
        {currentStep === 'resource-group'
          ? t('fairShare.ResourceGroup')
          : currentStep === 'domain'
            ? t('fairShare.Domain')
            : currentStep === 'project'
              ? t('fairShare.Project')
              : t('fairShare.User')}
      </Heading>
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
