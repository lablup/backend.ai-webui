/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AppConfigFixtureDiagnosticsSectionAllowListMutation } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionAllowListMutation.graphql';
import type { AppConfigFixtureDiagnosticsSectionDefinitionMutation } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionDefinitionMutation.graphql';
import type { AppConfigFixtureDiagnosticsSectionPurgeMutation } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionPurgeMutation.graphql';
import type { AppConfigFixtureDiagnosticsSectionQuery } from '../../../__generated__/AppConfigFixtureDiagnosticsSectionQuery.graphql';
import { App } from '../../../app-shim';
import {
  APP_CONFIG_FIXTURE,
  analyzeAppConfigFixture,
  checkAppConfigFixture,
  planAppConfigFixtureRepair,
} from '../../../diagnostics/rules/appConfigRules';
import { DiagnosticResult } from '../../../types/diagnostics';
import DiagnosticResultList from './DiagnosticResultList';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFlex,
  useErrorMessageResolver,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { RotateCcw, Wrench } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// The literal the reset confirm asks for; the modal shows it in its input label.
const RESET_CONFIRM_TEXT = 'reset';

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
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const configNames = APP_CONFIG_FIXTURE.definitions;
  const { adminAppConfigDefinitions, adminAppConfigAllowLists } =
    useLazyLoadQuery<AppConfigFixtureDiagnosticsSectionQuery>(
      graphql`
        query AppConfigFixtureDiagnosticsSectionQuery(
          $definitionFilter: AppConfigDefinitionFilter
          $allowListFilter: AppConfigAllowListFilter
        ) {
          adminAppConfigDefinitions(
            filter: $definitionFilter
            limit: 100
            offset: 0
          ) {
            edges {
              node {
                id
                entityId
                configName
              }
            }
          }
          adminAppConfigAllowLists(
            filter: $allowListFilter
            limit: 100
            offset: 0
          ) {
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
      {
        definitionFilter: { configName: { in: configNames } },
        allowListFilter: { configName: { in: configNames } },
      },
      {
        fetchPolicy: 'network-only',
        fetchKey: `${fetchKey}-${localFetchKey}`,
      },
    );

  const definitions = _.map(adminAppConfigDefinitions?.edges, (e) => ({
    entityId: String(e.node.entityId),
    configName: e.node.configName,
  }));
  const allowList = _.map(adminAppConfigAllowLists?.edges, (e) => ({
    entityId: String(e.node.entityId),
    configName: e.node.configName,
    scopeType: e.node.scopeType,
    rank: e.node.rank,
  }));
  const analysis = analyzeAppConfigFixture(definitions, allowList);
  const results = checkAppConfigFixture(analysis);
  const plan = planAppConfigFixtureRepair(analysis, definitions, allowList);
  const hasIssues = results.some((r) => r.severity !== 'passed');

  useEffect(() => {
    onHasIssues?.(hasIssues);
  }, [hasIssues, onHasIssues]);

  useEffect(() => {
    onResultsChange?.(results);
  }, [results, onResultsChange]);

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
  const commitPurge =
    useMutationWithPromise<AppConfigFixtureDiagnosticsSectionPurgeMutation>(
      graphql`
        mutation AppConfigFixtureDiagnosticsSectionPurgeMutation(
          $allowListIds: [UUID!]!
          $definitionIds: [UUID!]!
        ) {
          partialBulkPurgeAppConfigAllowLists(input: { ids: $allowListIds }) {
            failed {
              id
              message
            }
          }
          partialBulkPurgeAppConfigDefinitions(input: { ids: $definitionIds }) {
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

  // Definitions first: an allow-list entry names a registered definition.
  const register = async () => {
    for (const configName of plan.createDefinitions) {
      await commitCreateDefinition({ input: { configName } });
    }
    for (const entry of plan.createAllowList) {
      await commitCreateAllowList({ input: entry });
    }
  };

  const registerMissing = async () => {
    try {
      await register();
      message.success(t('diagnostics.AppConfigFixtureRegistered'));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      refetch();
    }
  };

  const resetFixture = async () => {
    setIsResetting(true);
    try {
      const res = await commitPurge({
        allowListIds: plan.purgeAllowListIds,
        definitionIds: plan.purgeDefinitionIds,
      });
      const failed = [
        ...(res.partialBulkPurgeAppConfigAllowLists.failed ?? []),
        ...(res.partialBulkPurgeAppConfigDefinitions.failed ?? []),
      ];
      if (failed.length > 0) {
        throw new Error(failed.map((f) => f.message).join('\n'));
      }
      await register();
      message.success(t('diagnostics.AppConfigFixtureRegistered'));
      setIsResetModalOpen(false);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setIsResetting(false);
      refetch();
    }
  };

  const purgedNames = _.uniq(
    definitions
      .filter((d) => plan.purgeDefinitionIds.includes(d.entityId))
      .map((d) => d.configName),
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <DiagnosticResultList results={results} hidePassed={hidePassed} />
      {plan.mode !== 'none' && (
        <BAIFlex justify="end">
          {plan.mode === 'create' ? (
            <BAIButton
              type="primary"
              icon={<Wrench size="1em" />}
              loading={isRefetching}
              action={registerMissing}
            >
              {t('diagnostics.AppConfigFixtureRegisterMissing')}
            </BAIButton>
          ) : (
            <BAIButton
              danger
              icon={<RotateCcw size="1em" />}
              loading={isRefetching}
              onClick={() => setIsResetModalOpen(true)}
            >
              {t('diagnostics.AppConfigFixtureReset')}
            </BAIButton>
          )}
        </BAIFlex>
      )}
      <BAIDeleteConfirmModal
        open={isResetModalOpen}
        title={t('diagnostics.AppConfigFixtureReset')}
        description={t('diagnostics.AppConfigFixtureResetConfirmDesc')}
        items={(purgedNames.length > 0 ? purgedNames : configNames).map(
          (name) => ({ key: name, label: name }),
        )}
        confirmText={RESET_CONFIRM_TEXT}
        requireConfirmInput
        inputProps={{ placeholder: RESET_CONFIRM_TEXT }}
        okText={t('diagnostics.AppConfigFixtureReset')}
        confirmLoading={isResetting}
        onOk={() => {
          void resetFixture();
        }}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </BAIFlex>
  );
};

export default AppConfigFixtureDiagnosticsSection;
