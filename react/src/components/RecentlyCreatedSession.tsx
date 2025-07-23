import { RecentlyCreatedSessionFragment$key } from '../__generated__/RecentlyCreatedSessionFragment.graphql';
import { filterNonNullItems, toLocalId } from '../helper';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import Flex from './Flex';
import SessionDetailDrawer from './SessionDetailDrawer';
import SessionNodes from './SessionNodes';
import { theme, Typography } from 'antd';
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
      fragment RecentlyCreatedSessionFragment on Queries
      @argumentDefinitions(
        projectId: { type: "UUID!" }
      )
      @refetchable(queryName: "RecentlyCreatedSessionRefetchQuery") {
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
      <Flex
        direction="column"
        align="stretch"
        style={{
          paddingLeft: token.paddingXL,
          paddingRight: token.paddingXL,
          height: '100%',
        }}
      >
        {/* Fixed Title Section */}
        <Flex
          align="center"
          justify="between"
          style={{
            width: '100%',
            height: 56,
            paddingLeft: token.paddingMD,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            backgroundColor: token.colorBgContainer,
            zIndex: 1,
          }}
          gap="xs"
          wrap="wrap"
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            {t('session.RecentlyCreatedSessions')}
          </Typography.Title>
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
        </Flex>

        {/* Scrollable Content Section */}
        <Flex
          direction="column"
          align="stretch"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            marginTop: token.marginSM,
          }}
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
        </Flex>
      </Flex>
      <SessionDetailDrawer
        open={!!sessionDetailId}
        sessionId={sessionDetailId || undefined}
        onClose={() => {
          setSessionDetailId(undefined, 'pushIn');
        }}
      />
    </>
  );
};

export default RecentlyCreatedSession;
