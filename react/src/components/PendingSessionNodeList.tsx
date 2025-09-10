import BAIFetchKeyButton from './BAIFetchKeyButton';
import SessionNodes from './SessionNodes';
import SharedResourceGroupSelectForCurrentProject from './SharedResourceGroupSelectForCurrentProject';
import { Form } from 'antd';
import { BAIFlex, filterOutNullAndUndefined } from 'backend.ai-ui';
import _ from 'lodash';
import { useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';
import {
  PendingSessionNodeListQuery,
  PendingSessionNodeListQuery$variables,
} from 'src/__generated__/PendingSessionNodeListQuery.graphql';
import { INITIAL_FETCH_KEY, useFetchKey, useWebUINavigate } from 'src/hooks';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';
import { useCurrentResourceGroupValue } from 'src/hooks/useCurrentProject';

const PendingSessionNodeList: React.FC = () => {
  const { t } = useTranslation();
  const [fetchKey, updateFetchKey] = useFetchKey();
  // const [selectedResourceGroup, setSelectedResourceGroup] = useState<string>();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const deferredFetchKey = useDeferredValue(fetchKey);
  const deferredCurrentResourceGroup = useDeferredValue(currentResourceGroup);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.PendingSessionNodeList',
  );

  const webUINavigate = useWebUINavigate();
  const location = useLocation();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const queryVariables: PendingSessionNodeListQuery$variables = useMemo(
    () => ({
      resource_group_id: deferredCurrentResourceGroup || 'default',
      first: baiPaginationOption.first,
      offset: baiPaginationOption.offset,
    }),
    [deferredCurrentResourceGroup, baiPaginationOption],
  );
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { session_pending_queue } =
    useLazyLoadQuery<PendingSessionNodeListQuery>(
      graphql`
        query PendingSessionNodeListQuery(
          $resource_group_id: String!
          $first: Int = 20
          $offset: Int = 0
        ) {
          session_pending_queue(
            resource_group_id: $resource_group_id
            first: $first
            offset: $offset
          ) {
            edges @required(action: THROW) {
              node {
                ...SessionDetailDrawerFragment
                ...SessionNodesFragment
              }
            }
            count
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchKey: deferredFetchKey,
        fetchPolicy:
          deferredFetchKey === INITIAL_FETCH_KEY
            ? 'store-and-network'
            : 'network-only',
      },
    );

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex align="stretch" justify="between">
        <Form.Item
          label={t('session.ResourceGroup')}
          style={{ marginBottom: 0 }}
        >
          <SharedResourceGroupSelectForCurrentProject
            showSearch
            style={{ minWidth: 100 }}
            onChangeInTransition={(v) => {
              setTablePaginationOption({ current: 1 });
            }}
            loading={currentResourceGroup !== deferredCurrentResourceGroup}
            popupMatchSelectWidth={false}
            tooltip={t('general.ResourceGroup')}
          />
        </Form.Item>
        <BAIFetchKeyButton
          loading={
            deferredQueryVariables !== queryVariables ||
            deferredFetchKey !== fetchKey
          }
          autoUpdateDelay={7_000}
          value={fetchKey}
          onChange={(newFetchKey) => {
            updateFetchKey(newFetchKey);
          }}
        />
      </BAIFlex>

      <SessionNodes
        disableSorter
        onClickSessionName={(session) => {
          // Set sessionDetailDrawerFrgmt in location state via webUINavigate
          // instead of directly setting sessionDetailId query param
          // to avoid additional fetch in SessionDetailDrawer
          const newSearchParams = new URLSearchParams(location.search);
          newSearchParams.set('sessionDetail', session.row_id);
          webUINavigate(
            {
              pathname: location.pathname,
              hash: location.hash,
              search: newSearchParams.toString(),
            },
            {
              state: {
                sessionDetailDrawerFrgmt: session,
                createdAt: new Date().toISOString(),
              },
            },
          );
        }}
        loading={deferredQueryVariables !== queryVariables}
        sessionsFrgmt={filterOutNullAndUndefined(
          session_pending_queue?.edges.map((e) => e?.node),
        )}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: session_pending_queue?.count ?? 0,
          onChange: (current, pageSize) => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({ current, pageSize });
            }
          },
        }}
        tableSettings={{
          columnOverrides: columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
      />
    </BAIFlex>
  );
};

export default PendingSessionNodeList;
