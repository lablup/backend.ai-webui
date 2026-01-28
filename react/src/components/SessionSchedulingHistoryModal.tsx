import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAISchedulingHistoryNodes,
  useFetchKey,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useDeferredValue } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { SessionSchedulingHistoryModalQuery } from 'src/__generated__/SessionSchedulingHistoryModalQuery.graphql';

interface SessionSchedulingHistoryModalProps extends Omit<
  BAIModalProps,
  'children' | 'title'
> {
  sessionId: string;
}

const SessionSchedulingHistoryModal = ({
  open,
  loading,
  sessionId,
  ...modalProps
}: SessionSchedulingHistoryModalProps) => {
  const [fetchKey, updateFetchKey] = useFetchKey();

  const deferredOpenValue = useDeferredValue(open);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const queryRef = useLazyLoadQuery<SessionSchedulingHistoryModalQuery>(
    graphql`
      query SessionSchedulingHistoryModalQuery(
        $scope: SessionScope!
        $filter: SessionSchedulingHistoryFilter
        $orderBy: [SessionSchedulingHistoryOrderBy!]
      ) {
        sessionScopedSchedulingHistories(
          scope: $scope
          filter: $filter
          orderBy: $orderBy
        ) {
          edges {
            node {
              ...BAISchedulingHistoryNodesFragment
            }
          }
        }
      }
    `,
    {
      scope: {
        sessionId: sessionId,
      },
      orderBy: [
        {
          field: 'CREATED_AT',
          direction: 'ASC',
        },
      ],
      // filter: {
      //   sessionId: {
      //     equals: sessionId,
      //   },
      // },
      // orderBy: [
      //   {
      //     field: 'CREATED_AT',
      //     direction: 'ASC',
      //   },
      // ],
    },
    {
      fetchKey: deferredFetchKey,
      fetchPolicy: deferredOpenValue ? 'network-only' : 'store-only',
    },
  );
  return (
    <BAIModal
      title="Session Scheduling History"
      loading={loading || deferredOpenValue !== open}
      open={open}
      width={1200}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="between" wrap="wrap" gap="sm">
          <div>filter</div>
          <BAIFlex>
            <BAIFetchKeyButton
              value={fetchKey}
              onChange={updateFetchKey}
              loading={deferredFetchKey !== fetchKey}
              autoUpdateDelay={null}
            />
          </BAIFlex>
        </BAIFlex>
        <BAISchedulingHistoryNodes
          resizable
          loading={deferredFetchKey !== fetchKey}
          schedulingHistoryFrgmt={_.map(
            queryRef.sessionScopedSchedulingHistories?.edges,
            'node',
          )}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default SessionSchedulingHistoryModal;
