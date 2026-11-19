/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AppConfigFixtureDiagnosticsSectionAllowListMutation } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionAllowListMutation.graphql';
import type { AppConfigFixtureDiagnosticsSectionDefinitionMutation } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionDefinitionMutation.graphql';
import type { AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation.graphql';
import type { AppConfigFixtureDiagnosticsSectionPurgeImpactQuery } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionPurgeImpactQuery.graphql';
import type { AppConfigFixtureDiagnosticsSectionPurgeMutation } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionPurgeMutation.graphql';
import type { AppConfigFixtureDiagnosticsSectionQuery } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionQuery.graphql';
import type { AppConfigFixtureDiagnosticsSectionRankMutation } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionRankMutation.graphql';
import { App } from '../../../app-shim';
import {
  analyzeAppConfigFixture,
  checkAppConfigFixture,
  formatAppConfigAllowListEntry,
  hasAppConfigFixturePurge,
  hasAppConfigFixtureRepair,
  planAppConfigFixtureRepair,
  type AppConfigFixtureRepairPlan,
  type AppConfigScopeType,
} from '../../../diagnostics/rules/appConfigRules';
import { DiagnosticResult } from '../../../types/diagnostics';
import DiagnosticResultList from './DiagnosticResultList';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFlex,
  BAIText,
  useErrorMessageResolver,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Wrench } from 'lucide-react';
import {
  Suspense,
  useEffect,
  useEffectEvent,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// The literal the purge confirm asks for; the modal shows it in its input label.
const PURGE_CONFIRM_TEXT = 'purge';

interface AppConfigFixtureDiagnosticsSectionProps {
  hidePassed?: boolean;
  fetchKey?: string;
  onHasIssues?: (hasIssues: boolean) => void;
  onResultsChange?: (results: DiagnosticResult[]) => void;
}

const AppConfigFixtureDiagnosticsSection: React.FC<
  AppConfigFixtureDiagnosticsSectionProps
> = ({ hidePassed = false, fetchKey, onHasIssues, onResultsChange }) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [localFetchKey, updateLocalFetchKey] = useFetchKey();
  const [isRefetching, startRefetchTransition] = useTransition();
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  const { adminAppConfigDefinitions, adminAppConfigAllowLists } =
    useLazyLoadQuery<AppConfigFixtureDiagnosticsSectionQuery>(
      graphql`
        query AppConfigFixtureDiagnosticsSectionQuery {
          adminAppConfigDefinitions(limit: 100, offset: 0) {
            count
            edges {
              node {
                id
                entityId
                configName
              }
            }
          }
          adminAppConfigAllowLists(limit: 100, offset: 0) {
            count
            edges {
              node {
                id
                entityId
                configName
                scopeType
                rank
              }
            }
          }
        }
      `,
      {},
      {
        fetchPolicy: 'network-only',
        fetchKey: `${fetchKey}-${localFetchKey}`,
      },
    );

  // A field that errored resolves to null; analysing it as empty would report everything missing.
  if (!adminAppConfigDefinitions || !adminAppConfigAllowLists) {
    throw new Error('Failed to load the app config definitions or allow list.');
  }
  // A truncated page would make the check and the repair miss rows.
  if (
    adminAppConfigDefinitions.count > adminAppConfigDefinitions.edges.length ||
    adminAppConfigAllowLists.count > adminAppConfigAllowLists.edges.length
  ) {
    throw new Error('Too many app config entries to check on one page.');
  }
  const definitions = _.map(adminAppConfigDefinitions.edges, (e) => ({
    entityId: String(e.node.entityId),
    configName: e.node.configName,
  }));
  const allowList = _.map(adminAppConfigAllowLists.edges, (e) => ({
    entityId: String(e.node.entityId),
    configName: e.node.configName,
    scopeType: e.node.scopeType,
    rank: e.node.rank,
  }));
  const analysis = analyzeAppConfigFixture(definitions, allowList);
  const results = checkAppConfigFixture(analysis);
  const plan = planAppConfigFixtureRepair(analysis);
  const hasIssues = results.some((r) => r.severity !== 'passed');

  const reportHasIssues = useEffectEvent(() => onHasIssues?.(hasIssues));
  const reportResults = useEffectEvent(() => onResultsChange?.(results));

  useEffect(() => {
    reportHasIssues();
  }, [hasIssues]);

  useEffect(() => {
    reportResults();
  }, [results]);

  const commitCreateDefinition =
    useMutationWithPromise<AppConfigFixtureDiagnosticsSectionDefinitionMutation>(
      graphql`
        mutation AppConfigFixtureDiagnosticsSectionDefinitionMutation(
          $input: CreateAppConfigDefinitionInput!
        ) {
          adminCreateAppConfigDefinition(input: $input) {
            appConfigDefinition {
              id
            }
          }
        }
      `,
    );
  const commitCreateAllowList =
    useMutationWithPromise<AppConfigFixtureDiagnosticsSectionAllowListMutation>(
      graphql`
        mutation AppConfigFixtureDiagnosticsSectionAllowListMutation(
          $input: CreateAppConfigAllowListInput!
        ) {
          adminCreateAppConfigAllowList(input: $input) {
            appConfigAllowList {
              id
            }
          }
        }
      `,
    );
  const commitUpdateRanks =
    useMutationWithPromise<AppConfigFixtureDiagnosticsSectionRankMutation>(
      graphql`
        mutation AppConfigFixtureDiagnosticsSectionRankMutation(
          $items: [UpdateAppConfigAllowListInput!]!
        ) {
          partialBulkUpdateAppConfigAllowLists(input: { items: $items }) {
            failed {
              id
              message
            }
          }
        }
      `,
    );
  const commitPurgeDefinitions =
    useMutationWithPromise<AppConfigFixtureDiagnosticsSectionPurgeMutation>(
      graphql`
        mutation AppConfigFixtureDiagnosticsSectionPurgeMutation(
          $definitionIds: [UUID!]!
        ) {
          partialBulkPurgeAppConfigDefinitions(input: { ids: $definitionIds }) {
            failed {
              id
              message
            }
          }
        }
      `,
    );
  const commitPurgeAllowList =
    useMutationWithPromise<AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation>(
      graphql`
        mutation AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation(
          $allowListIds: [UUID!]!
        ) {
          partialBulkPurgeAppConfigAllowLists(input: { ids: $allowListIds }) {
            failed {
              id
              message
            }
          }
        }
      `,
    );

  const refetch = () => {
    startRefetchTransition(() => {
      updateLocalFetchKey();
    });
  };

  // Every step runs even when an earlier one fails; the failures are reported together.
  const repair = async () => {
    setIsRepairing(true);
    const errors: string[] = [];
    const runStep = async (step: () => Promise<string[] | void>) => {
      try {
        errors.push(...((await step()) ?? []));
      } catch (error) {
        errors.push(getErrorMessage(error));
      }
    };
    try {
      if (plan.purgeAllowList.length > 0) {
        await runStep(async () => {
          const res = await commitPurgeAllowList({
            allowListIds: plan.purgeAllowList.map((e) => e.entityId),
          });
          return res.partialBulkPurgeAppConfigAllowLists.failed.map(
            (f) => f.message,
          );
        });
      }
      if (plan.purgeDefinitions.length > 0) {
        await runStep(async () => {
          const res = await commitPurgeDefinitions({
            definitionIds: plan.purgeDefinitions.map((d) => d.entityId),
          });
          return res.partialBulkPurgeAppConfigDefinitions.failed.map(
            (f) => f.message,
          );
        });
      }
      // Definitions first: an allow-list entry names a registered definition.
      for (const configName of plan.createDefinitions) {
        await runStep(async () => {
          await commitCreateDefinition({ input: { configName } });
        });
      }
      for (const entry of plan.createAllowList) {
        await runStep(async () => {
          await commitCreateAllowList({ input: entry });
        });
      }
      if (plan.updateRanks.length > 0) {
        await runStep(async () => {
          const res = await commitUpdateRanks({ items: plan.updateRanks });
          return res.partialBulkUpdateAppConfigAllowLists.failed.map(
            (f) => f.message,
          );
        });
      }
      if (errors.length > 0) {
        message.error(errors.join('\n'));
      } else {
        message.success(t('diagnostics.AppConfigFixtureRepaired'));
      }
    } finally {
      // Close even on failure: the refetched plan may no longer purge anything.
      setIsPurgeModalOpen(false);
      setIsRepairing(false);
      refetch();
    }
  };

  const hasPurge = hasAppConfigFixturePurge(plan);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <DiagnosticResultList results={results} hidePassed={hidePassed} />
      {hasAppConfigFixtureRepair(plan) && (
        <BAIFlex justify="end">
          {hasPurge ? (
            <BAIButton
              danger
              icon={<Wrench size="1em" />}
              loading={isRefetching || isRepairing}
              onClick={() => setIsPurgeModalOpen(true)}
            >
              {t('diagnostics.AppConfigFixtureRepair')}
            </BAIButton>
          ) : (
            <BAIButton
              type="primary"
              icon={<Wrench size="1em" />}
              loading={isRefetching}
              action={repair}
            >
              {t('diagnostics.AppConfigFixtureRepair')}
            </BAIButton>
          )}
        </BAIFlex>
      )}
      <BAIDeleteConfirmModal
        open={isPurgeModalOpen}
        title={t('diagnostics.AppConfigFixtureRepair')}
        description={
          <BAIFlex direction="column" align="stretch" gap="xs">
            <BAIText>
              {t('diagnostics.AppConfigFixturePurgeConfirmDesc')}
            </BAIText>
            {isPurgeModalOpen && (
              <Suspense fallback={null}>
                <AppConfigFixturePurgeImpact plan={plan} />
              </Suspense>
            )}
          </BAIFlex>
        }
        items={[
          ...plan.purgeDefinitions.map((d) => ({
            key: d.entityId,
            label: d.configName,
          })),
          ...plan.purgeAllowList.map((e) => ({
            key: e.entityId,
            label: formatAppConfigAllowListEntry(e),
          })),
        ]}
        confirmText={PURGE_CONFIRM_TEXT}
        requireConfirmInput
        inputProps={{ placeholder: PURGE_CONFIRM_TEXT }}
        okText={t('diagnostics.AppConfigFixtureRepair')}
        confirmLoading={isRepairing}
        onOk={() => {
          void repair();
        }}
        onCancel={() => {
          // The purge cannot be cancelled once it started; keep the dialog until it settles.
          if (!isRepairing) setIsPurgeModalOpen(false);
        }}
      />
    </BAIFlex>
  );
};

/** How many stored settings (fragments) the purge deletes with the entries it removes. */
const AppConfigFixturePurgeImpact: React.FC<{
  plan: AppConfigFixtureRepairPlan;
}> = ({ plan }) => {
  'use memo';
  const { t } = useTranslation();
  const { adminAppConfigFragments } =
    useLazyLoadQuery<AppConfigFixtureDiagnosticsSectionPurgeImpactQuery>(
      graphql`
        query AppConfigFixtureDiagnosticsSectionPurgeImpactQuery(
          $filter: AppConfigFragmentFilter!
        ) {
          adminAppConfigFragments(filter: $filter, limit: 1, offset: 0) {
            count
          }
        }
      `,
      {
        filter: {
          OR: [
            ...plan.purgeDefinitions.map((d) => ({
              configName: { equals: d.configName },
            })),
            ...plan.purgeAllowList.map((e) => ({
              configName: { equals: e.configName },
              scopeType: {
                equals: e.scopeType.toUpperCase() as AppConfigScopeType,
              },
            })),
          ],
        },
      },
      { fetchPolicy: 'network-only' },
    );
  if (!adminAppConfigFragments) return null;
  return (
    <BAIText type="danger">
      {t('diagnostics.AppConfigFixturePurgeFragmentCount', {
        count: adminAppConfigFragments.count,
      })}
    </BAIText>
  );
};

export default AppConfigFixtureDiagnosticsSection;
