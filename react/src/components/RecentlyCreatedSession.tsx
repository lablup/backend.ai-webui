import { RecentlyCreatedSessionFragment$key } from '../__generated__/RecentlyCreatedSessionFragment.graphql';
import SessionDetailDrawer from './SessionDetailDrawer';
import SessionNodes from './SessionNodes';
import { theme } from 'antd';
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
import { useQueryParam, StringParam } from 'use-query-params';

interface RecentlyCreatedSessionProps {
  queryRef: RecentlyCreatedSessionFragment$key;
  isRefetching?: boolean;
}

const RecentlyCreatedSession: React.FC<RecentlyCreatedSessionProps> = ({
  queryRef,
  isRefetching,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [sessionDetailId, setSessionDetailId] = useQueryParam(
    'sessionDetail',
    StringParam,
  );
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
          paddingInline: token.paddingXL,
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
          />
        </BAIFlex>
      </BAIFlex>
      <BAIUnmountAfterClose>
        <SessionDetailDrawer
          open={!!sessionDetailId}
          sessionId={sessionDetailId || undefined}
          onClose={() => {
            setSessionDetailId(undefined, 'pushIn');
          }}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default RecentlyCreatedSession;
