/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  PendingSessionNodeListQuery,
  PendingSessionNodeListQuery$data,
  PendingSessionNodeListQuery$variables,
} from '../__generated__/PendingSessionNodeListQuery.graphql';
import { handleRowSelectionChange } from '../helper';
import { useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import ModifySessionModal from './ComputeSessionNodeItems/ModifySessionModal';
import TerminateSessionModal from './ComputeSessionNodeItems/TerminateSessionModal';
import SessionNodes from './SessionNodes';
import SharedResourceGroupSelectForCurrentProject from './SharedResourceGroupSelectForCurrentProject';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Form, theme, Tooltip } from 'antd';
import {
  BAIAlert,
  BAIFlex,
  BAISelectionLabel,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  BAIFetchKeyButton,
  useFetchKey,
  INITIAL_FETCH_KEY,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PowerOffIcon } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';

type SessionNode = NonNullableNodeOnEdges<
  NonNullable<PendingSessionNodeListQuery$data['session_pending_queue']>
>;

const PendingSessionNodeList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [fetchKey, updateFetchKey] = useFetchKey();
  // const [selectedResourceGroup, setSelectedResourceGroup] = useState<string>();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const deferredFetchKey = useDeferredValue(fetchKey);
  const deferredCurrentResourceGroup = useDeferredValue(currentResourceGroup);
  const [selectedSessionList, setSelectedSessionList] = useState<
    Array<SessionNode>
  >([]);
  const [isOpenModifyModal, setOpenModifyModal] = useState(false);
  const [isOpenTerminateModal, setOpenTerminateModal] = useState(false);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.PendingSessionNodeList',
  );

  const webUINavigate = useWebUINavigate();
  const location = useLocation();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 10,
  });

  const queryVariables: PendingSessionNodeListQuery$variables = useMemo(
    () => ({
      resource_group_id: deferredCurrentResourceGroup ?? '',
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
                id
                ...SessionDetailDrawerFragment
                ...SessionNodesFragment
                ...ModifySessionModalFragment
                ...TerminateSessionModalFragment
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
      <BAIAlert
        type="info"
        showIcon
        description={t('adminSession.PendingSessionsScopedToResourceGroup')}
      />
      <BAIFlex align="stretch" justify="between">
        <Form.Item
          label={t('session.ResourceGroup')}
          style={{ marginBottom: 0 }}
        >
          <SharedResourceGroupSelectForCurrentProject
            showSearch
            style={{ minWidth: 100 }}
            onChangeInTransition={() => {
              setTablePaginationOption({ current: 1 });
              setSelectedSessionList([]);
            }}
            loading={currentResourceGroup !== deferredCurrentResourceGroup}
            popupMatchSelectWidth={false}
            tooltip={t('general.ResourceGroup')}
          />
        </Form.Item>
        <BAIFlex gap={'xs'}>
          {selectedSessionList.length > 0 && (
            <>
              <BAISelectionLabel
                count={selectedSessionList.length}
                onClearSelection={() => setSelectedSessionList([])}
              />
              <Tooltip title={t('button.Edit')} placement="topLeft">
                <Button
                  icon={<SettingOutlined style={{ color: token.colorInfo }} />}
                  onClick={() => {
                    setOpenModifyModal(true);
                  }}
                />
              </Tooltip>
              <Tooltip
                title={t('session.TerminateSession')}
                placement="topLeft"
              >
                <Button
                  icon={<PowerOffIcon color={token.colorError} />}
                  onClick={() => {
                    setOpenTerminateModal(true);
                  }}
                />
              </Tooltip>
            </>
          )}
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
      </BAIFlex>

      <SessionNodes
        showEditAction
        disableSorter
        rowSelection={{
          type: 'checkbox',
          preserveSelectedRowKeys: true,
          onChange: (selectedRowKeys) => {
            handleRowSelectionChange(
              selectedRowKeys,
              filterOutNullAndUndefined(
                session_pending_queue?.edges.map((e) => e?.node),
              ),
              setSelectedSessionList,
            );
          },
          selectedRowKeys: _.map(selectedSessionList, (i) => i.id),
        }}
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
      <TerminateSessionModal
        open={isOpenTerminateModal}
        sessionFrgmts={selectedSessionList}
        onRequestClose={(success) => {
          setOpenTerminateModal(false);
          if (success) {
            setSelectedSessionList([]);
          }
        }}
      />
      <BAIUnmountAfterClose>
        <ModifySessionModal
          open={isOpenModifyModal}
          sessionFrgmts={selectedSessionList}
          onRequestClose={(success) => {
            setOpenModifyModal(false);
            if (success) {
              setSelectedSessionList([]);
            }
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default PendingSessionNodeList;
