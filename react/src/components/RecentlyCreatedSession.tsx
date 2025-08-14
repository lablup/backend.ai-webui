import { RecentlyCreatedSessionFragment$key } from '../__generated__/RecentlyCreatedSessionFragment.graphql';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import SessionDetailDrawer from './SessionDetailDrawer';
import SessionNodes from './SessionNodes';
import { theme } from 'antd';
import {
  filterOutNullAndUndefined,
  toLocalId,
  BAIFlex,
  BAIUnmountAfterClose,
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
        projectId: { type: "UUID!" }
      )
      @refetchable(queryName: "RecentlyCreatedSessionRefetchQuery") {
        compute_session_nodes(
          first: 5
          order: "-created_at"
          filter: "status == \"running\""
          project_id: $projectId
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
          paddingLeft: token.paddingXL,
          paddingRight: token.paddingXL,
          height: '100%',
        }}
      >
        <BAIBoardItemTitle
          title={t('session.RecentlyCreatedSessions')}
          tooltip={t('session.RecentlyCreatedSessionsTooltip')}
          extra={
            <BAIFetchKeyButton
              size="small"
              loading={isPendingRefetch || isRefetching}
              value=""
              onChange={(newFetchKey) => {
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
