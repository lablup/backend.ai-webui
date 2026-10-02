/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RecentlyCreatedSessionFragment$key } from '../__generated__/RecentlyCreatedSessionFragment.graphql';
import { useWebUINavigate } from '../hooks';
import { ProjectContextOrNull } from '../types/projectContext';
import SessionDetailDrawer from './SessionDetailDrawer';
import SessionNodes from './SessionNodes';
import { useTheme } from '@lablup/ui-common/theme';
import {
  filterOutNullAndUndefined,
  toLocalId,
  BAIFlex,
  BAIUnmountAfterClose,
  BAIFetchKeyButton,
  BAIBoardItemTitle,
} from 'backend.ai-ui';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

interface RecentlyCreatedSessionProps {
  queryRef: RecentlyCreatedSessionFragment$key;
  isRefetching?: boolean;
  /**
   * Explicit project prop contract (ADR-0001, FR-3413): pass-through to the
   * session-detail drawer. The mounting page decides the project context.
   */
  project: ProjectContextOrNull;
}

const RecentlyCreatedSession: React.FC<RecentlyCreatedSessionProps> = ({
  queryRef,
  isRefetching,
  project,
}) => {
  const { t } = useTranslation();
  const { token } = useTheme();
  // Read from the router, not nuqs: the board's session panels set the param
  // with a navigation, which nuqs applies in a transition that React holds
  // back while any async action is pending.
  const location = useLocation();
  const navigate = useWebUINavigate();
  const sessionDetailId = new URLSearchParams(location.search).get(
    'sessionDetail',
  );
  // Pushes on open and on close, so Back steps through both.
  const setSessionDetailId = (value: string | null) => {
    const searchParams = new URLSearchParams(location.search);
    if (value === null) searchParams.delete('sessionDetail');
    else searchParams.set('sessionDetail', value);
    navigate({ search: searchParams.toString(), hash: location.hash });
  };
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment RecentlyCreatedSessionFragment on Query
      @argumentDefinitions(
        scopeId: { type: "ScopeField" }
      )
      @refetchable(queryName: "RecentlyCreatedSessionRefetchQuery") {
        compute_session_nodes(
          first: 5
          order: "-created_at"
          filter: "status == \"running\""
          scope_id: $scopeId
        ) {
          edges {
            node {
              id
              ...SessionNodesFragment
            }
          }
        }
      }
    `,
    queryRef,
  );

  return (
    <>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          paddingInline: token('--spacing-8'),
          height: '100%',
        }}
      >
        <BAIBoardItemTitle
          title={t('session.RecentlyCreatedSessions')}
          tooltip={t('session.RecentlyCreatedSessionsTooltip', {
            count: 5,
          })}
          extra={
            <BAIFetchKeyButton
              size="small"
              loading={isPendingRefetch || isRefetching}
              value=""
              onChange={() => {
                startRefetchTransition(() => {
                  refetch(
                    {},
                    {
                      fetchPolicy: 'network-only',
                    },
                  );
                });
              }}
              type="text"
              style={{
                backgroundColor: 'transparent',
              }}
            />
          }
        />

        {/* Scrollable Content Section */}
        <BAIFlex
          direction="column"
          align="stretch"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            marginBottom: token('--spacing-4'),
          }}
        >
          <SessionNodes
            sessionsFrgmt={filterOutNullAndUndefined(
              data.compute_session_nodes?.edges.map((e) => e?.node),
            )}
            onClickSessionName={(session) => {
              setSessionDetailId(toLocalId(session.id));
            }}
            pagination={false}
            disableSorter
            style={{ overflowY: 'hidden' }}
          />
        </BAIFlex>
      </BAIFlex>
      <BAIUnmountAfterClose>
        <SessionDetailDrawer
          open={!!sessionDetailId}
          sessionId={sessionDetailId || undefined}
          project={project}
          onClose={() => {
            setSessionDetailId(null);
          }}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default RecentlyCreatedSession;
