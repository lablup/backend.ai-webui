import { filterNonNullItems, toLocalId } from '../helper';
import BAICard, { BAICardProps } from './BAICard';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import Flex from './Flex';
import SessionDetailDrawer from './SessionDetailDrawer';
import SessionNodes from './SessionNodes';
import { RecentlyCreatedSessionCardFragment$key } from './__generated__/RecentlyCreatedSessionCardFragment.graphql';
import graphql from 'babel-plugin-relay/macro';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useRefetchableFragment } from 'react-relay';
import { useQueryParam, StringParam } from 'use-query-params';

interface RecentlyCreatedSessionCardProps extends BAICardProps {
  queryRef: RecentlyCreatedSessionCardFragment$key;
  isRefetching?: boolean;
}

const RecentlyCreatedSessionCard: React.FC<RecentlyCreatedSessionCardProps> = ({
  queryRef,
  isRefetching,
  ...props
}) => {
  const { t } = useTranslation();
  const [sessionDetailId, setSessionDetailId] = useQueryParam(
    'sessionDetail',
    StringParam,
  );
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment RecentlyCreatedSessionCardFragment on Queries
      @argumentDefinitions(
        projectId: { type: "UUID!" }
      )
      @refetchable(queryName: "RecentlyCreatedSessionCardRefetchQuery") {
        compute_session_nodes(
          first: 3
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
      <BAICard
        title={t('session.RecentlyCreatedSessions')}
        extra={
          <Flex
            direction="row"
            gap="sm"
            style={{
              marginRight: -8,
            }}
          >
            <BAIFetchKeyButton
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
          </Flex>
        }
        {...props}
      >
        <SessionNodes
          sessionsFrgmt={filterNonNullItems(
            data.compute_session_nodes?.edges.map((e) => e?.node),
          )}
          onClickSessionName={(session) => {
            setSessionDetailId(toLocalId(session.id));
          }}
          pagination={false}
          disableSorter
        />
        <SessionDetailDrawer
          open={!!sessionDetailId}
          sessionId={sessionDetailId || undefined}
          onClose={() => {
            setSessionDetailId(undefined, 'pushIn');
          }}
        />
      </BAICard>
    </>
  );
};

export default RecentlyCreatedSessionCard;
