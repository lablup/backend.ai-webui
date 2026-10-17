/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionMonitorScopeTotalsDomainQuery } from '../../__generated__/SessionMonitorScopeTotalsDomainQuery.graphql';
import type { SessionMonitorScopeTotalsProjectQuery } from '../../__generated__/SessionMonitorScopeTotalsProjectQuery.graphql';
import {
  sessionMonitorFetchKeyAtom,
  type SessionMonitorScope,
} from '../../hooks/useSessionMonitor';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAIResourceNumberWithIcon } from 'backend.ai-ui';
import { useAtomValue } from 'jotai';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type Overview = {
  readonly sessionCount: number;
  readonly slots: {
    readonly entries: ReadonlyArray<{
      readonly resourceType: string;
      readonly quantity: string;
    }>;
  };
} | null;

/**
 * Admin views: what the manager reports as occupied across the scope's
 * active sessions (`activeResourceOverview`, manager 26.4+), "GPU 4 · CPU 12
 * · RAM 64G". Suspends; mount under a null-fallback boundary.
 */
const SessionMonitorScopeTotals: React.FC<{ scope: SessionMonitorScope }> = ({
  scope,
}) => {
  'use memo';
  const id = scope.scopeId.slice(scope.scopeId.indexOf(':') + 1);
  return scope.mode === 'domain' ? (
    <DomainTotals domainName={id} />
  ) : (
    <ProjectTotals projectId={id} />
  );
};

const DomainTotals: React.FC<{ domainName: string }> = ({ domainName }) => {
  'use memo';
  const fetchKey = useAtomValue(sessionMonitorFetchKeyAtom);
  const data = useLazyLoadQuery<SessionMonitorScopeTotalsDomainQuery>(
    graphql`
      query SessionMonitorScopeTotalsDomainQuery($domainName: String!) {
        domainV2(domainName: $domainName) {
          activeResourceOverview {
            sessionCount
            slots {
              entries {
                resourceType
                quantity
              }
            }
          }
        }
      }
    `,
    { domainName },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return <OverviewLine overview={data.domainV2?.activeResourceOverview} />;
};

const ProjectTotals: React.FC<{ projectId: string }> = ({ projectId }) => {
  'use memo';
  const fetchKey = useAtomValue(sessionMonitorFetchKeyAtom);
  const data = useLazyLoadQuery<SessionMonitorScopeTotalsProjectQuery>(
    graphql`
      query SessionMonitorScopeTotalsProjectQuery($projectId: UUID!) {
        projectV2(projectId: $projectId) {
          activeResourceOverview {
            sessionCount
            slots {
              entries {
                resourceType
                quantity
              }
            }
          }
        }
      }
    `,
    { projectId },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return <OverviewLine overview={data.projectV2?.activeResourceOverview} />;
};

const OverviewLine: React.FC<{ overview: Overview | undefined }> = ({
  overview,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  if (!overview || overview.sessionCount === 0) return null;

  const order = (key: string) => (key === 'cpu' ? 1 : key === 'mem' ? 2 : 0);
  const entries = _.sortBy(overview.slots.entries, (e) =>
    order(e.resourceType),
  ).filter((e) => parseFloat(e.quantity) > 0);

  return (
    <BAIFlex
      data-testid="session-monitor-scope-totals"
      direction="column"
      align="stretch"
      gap="xxs"
      style={{
        padding: `${token('--spacing-1-5')} ${token('--spacing-3')}`,
        borderTop: `1px solid ${token('--color-border')}`,
      }}
    >
      <Text type="supporting">
        {t('sessionMonitor.InUseAcross', { count: overview.sessionCount })}
      </Text>
      <BAIFlex direction="row" align="center" gap="sm" wrap="wrap">
        {entries.map((e) => (
          <BAIResourceNumberWithIcon
            key={e.resourceType}
            type={e.resourceType}
            value={_.toString(parseFloat(e.quantity))}
          />
        ))}
      </BAIFlex>
    </BAIFlex>
  );
};

export default SessionMonitorScopeTotals;
