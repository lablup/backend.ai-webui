import { filterNonNullItems, toLocalId } from '../helper';
import { useUpdatableState } from '../hooks';
import BAICard, { BAICardProps } from './BAICard';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import SessionDetailDrawer from './SessionDetailDrawer';
import SessionNodes from './SessionNodes';
import { RecentlyCreatedSessionCardQuery } from './__generated__/RecentlyCreatedSessionCardQuery.graphql';
import graphql from 'babel-plugin-relay/macro';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { useQueryParam, StringParam } from 'use-query-params';

interface RecentlyCreatedSessionCardProps extends BAICardProps {}

const RecentlyCreatedSessionCard: React.FC<RecentlyCreatedSessionCardProps> = ({
  ...props
}) => {
  const { t } = useTranslation();
  const [sessionDetailId, setSessionDetailId] = useQueryParam(
    'sessionDetail',
    StringParam,
  );
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { compute_session_nodes } =
    useLazyLoadQuery<RecentlyCreatedSessionCardQuery>(
      graphql`
        query RecentlyCreatedSessionCardQuery(
          $first: Int = 3
          $order: String = "-created_at"
          $filter: String
        ) {
          compute_session_nodes(first: $first, order: $order, filter: $filter) {
            edges @required(action: THROW) {
              node @required(action: THROW) {
                id @required(action: THROW)
                ...SessionNodesFragment
              }
            }
          }
        }
      `,
      {
        first: 3,
        order: '-created_at',
        filter: 'status == "running"',
      },
      {
        fetchPolicy:
          deferredFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey:
          deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
      },
    );

  return (
    <>
      <BAICard
        title={t('session.RecentlyCreatedSessions')}
        extra={
          <BAIFetchKeyButton
            loading={deferredFetchKey !== fetchKey}
            autoUpdateDelay={15_000}
            value={fetchKey}
            onChange={(newFetchKey) => {
              updateFetchKey(newFetchKey);
            }}
            buttonProps={{
              type: 'text',
            }}
          />
        }
        {...props}
      >
        <SessionNodes
          sessionsFrgmt={filterNonNullItems(
            compute_session_nodes?.edges.map((e) => e?.node),
          )}
          onClickSessionName={(session) => {
            setSessionDetailId(toLocalId(session.id));
          }}
          pagination={false}
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
