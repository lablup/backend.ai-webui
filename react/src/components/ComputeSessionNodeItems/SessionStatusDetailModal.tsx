/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionStatusDetailModalFragment$key } from '../../__generated__/SessionStatusDetailModalFragment.graphql';
import {
  hasRenderableScheduler,
  hasRenderableSessionStatusData,
  parseSessionStatusData,
} from '../../helper/sessionStatusData';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import SessionStatusTag from './SessionStatusTag';
import { Badge } from '@astryxdesign/core/Badge';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import * as stylex from '@stylexjs/stylex';
import {
  BAIFlex,
  BAIMetadataList,
  BAIModal,
  type BAIModalProps,
  BAIText,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { CircleCheck, CircleX } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

const styles = stylex.create({
  predicateMsg: {
    maxWidth: 350,
  },
});

// antd `ModalProps` -> BUI `BAIModalProps` (§6: a type-only antd import is
// still an antd import). The render was already `BAIModal`.
interface SessionStatusDetailModalProps extends BAIModalProps {
  sessionFrgmt: SessionStatusDetailModalFragment$key;
}

const SessionStatusDetailModal: React.FC<SessionStatusDetailModalProps> = ({
  sessionFrgmt,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();

  const session = useFragment(
    graphql`
      fragment SessionStatusDetailModalFragment on ComputeSessionNode {
        id
        name
        status
        status_info
        status_data
        starts_at
        ...SessionStatusTagFragment
      }
    `,
    sessionFrgmt,
  );
  // FR-1137: a payload that parses but renders no section (e.g.
  // `{"error":{"collection":[]}}`) is dropped so the body shows an explicit
  // empty state rather than the session name alone.
  const statusData = hasRenderableSessionStatusData(session.status_data)
    ? parseSessionStatusData(session.status_data)
    : null;

  return (
    <BAIModal
      title={
        <>
          {t('session.StatusInfo')}
          <span style={{ fontWeight: 'normal' }}>
            <SessionStatusTag
              sessionFrgmt={session}
              showInfo
              showQueuePosition={false}
            />
          </span>
        </>
      }
      footer={null}
      width={450}
      {...modalProps}
    >
      {/* antd `Descriptions size="small" column={1}` -> Astryx MetadataList.
          PILOT-DECISION: `size="small"` and `Descriptions.Item span` have no
          MetadataList equivalent (MAPPING.md §4) and are dropped; the nested
          "Predicate checks" Descriptions collapses into a labeled item. */}
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIMetadataList columns="single">
          <MetadataListItem label={t('session.SessionName')}>
            <BAIText copyable ellipsis={{ tooltip: true }}>
              {session.name ?? ''}
            </BAIText>
          </MetadataListItem>
          {statusData?.kernel ? (
            <MetadataListItem label={t('session.KernelExitCode')}>
              {statusData.kernel.exit_code}
            </MetadataListItem>
          ) : null}
          {statusData?.session ? (
            <MetadataListItem label={t('session.SessionStatus')}>
              {statusData.session?.status}
            </MetadataListItem>
          ) : null}
          {hasRenderableScheduler(statusData?.scheduler) ? (
            <>
              <MetadataListItem label={t('session.LastTry')}>
                {dayjs(statusData?.scheduler?.last_try).format('lll')}
              </MetadataListItem>
              <MetadataListItem label={t('session.TotalRetries')}>
                {statusData?.scheduler?.retries}
              </MetadataListItem>
              {statusData?.scheduler?.msg && (
                <MetadataListItem label={t('session.Message')}>
                  {statusData?.scheduler?.msg}
                </MetadataListItem>
              )}
              <MetadataListItem label={t('session.PredicateChecks')}>
                <BAIFlex direction="column" gap="md" align="stretch">
                  {_.map(statusData?.scheduler?.failed_predicates, (p) => {
                    return (
                      <BAIFlex gap="xs" align="start" key={p.name}>
                        <CircleX
                          style={{
                            color: 'var(--color-error)',
                            marginTop: 4,
                            flexShrink: 0,
                          }}
                          size={16}
                        />
                        <BAIFlex direction="column" align="stretch">
                          <Text>{p.name}</Text>
                          <Text color="secondary" xstyle={styles.predicateMsg}>
                            {p.msg}
                          </Text>
                        </BAIFlex>
                      </BAIFlex>
                    );
                  })}
                  {_.map(statusData?.scheduler?.passed_predicates, (p) => {
                    return (
                      <BAIFlex gap="xs" align="start" key={p.name}>
                        <CircleCheck
                          style={{
                            color: 'var(--color-success)',
                            marginTop: 4,
                            flexShrink: 0,
                          }}
                          size={16}
                        />
                        <BAIFlex direction="column" align="stretch">
                          <Text>{p.name}</Text>
                          <Text color="secondary" xstyle={styles.predicateMsg}>
                            {p.msg}
                          </Text>
                        </BAIFlex>
                      </BAIFlex>
                    );
                  })}
                </BAIFlex>
              </MetadataListItem>
            </>
          ) : null}
          {statusData?.error
            ? _.map(
                statusData?.error?.collection ?? statusData,
                (collection) => {
                  return (
                    <Fragment key={collection.name}>
                      {(userRole === 'superadmin' ||
                        !baiClient._config.hideAgents) &&
                        collection?.agent_id && (
                          <MetadataListItem label={t('session.AgentId')}>
                            {collection?.agent_id}
                          </MetadataListItem>
                        )}
                      <MetadataListItem label={t('dialog.error.Error')}>
                        <Badge variant="error" label={collection.name} />
                      </MetadataListItem>
                      <MetadataListItem label={t('session.Message')}>
                        {collection.repr}
                      </MetadataListItem>
                      {collection?.traceback && (
                        <MetadataListItem label={t('session.Traceback')}>
                          <pre>{collection?.traceback}</pre>
                        </MetadataListItem>
                      )}
                    </Fragment>
                  );
                },
              )
            : null}
        </BAIMetadataList>
        {!statusData ? (
          <EmptyState
            isCompact
            title={t('session.NoStatusDetail')}
            description={t('session.NoStatusDetailDescription')}
          />
        ) : null}
      </BAIFlex>
    </BAIModal>
  );
};

export default SessionStatusDetailModal;
