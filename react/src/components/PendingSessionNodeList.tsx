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
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import AutoUpdateFetchKeyButton from './AutoUpdateFetchKeyButton';
import EditSessionPriorityModal from './ComputeSessionNodeItems/EditSessionPriorityModal';
import SessionNodes from './SessionNodes';
import SharedResourceGroupSelectForCurrentProject from './SharedResourceGroupSelectForCurrentProject';
import { Button, Form, Tooltip } from 'antd';
import {
  BAIAlert,
  BAIFlex,
  BAISelectionLabel,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  useFetchKey,
  INITIAL_FETCH_KEY,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SettingsIcon } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';

type PendingSessionNode = NonNullableNodeOnEdges<
  PendingSessionNodeListQuery$data['session_pending_queue']
>;

const PendingSessionNodeList: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  // Editing priority is only safe on managers that sequence all pending
  // workloads in a single scheduling tick (BA-6788, backend.ai#12668,
  // shipped in 26.4). On older managers, lowering a priority could hide
  // the session from scheduling passes, so hide the priority UI entirely.
  const enablePriorityEditing =
    baiClient.isManagerVersionCompatibleWith('26.4.0');
  const [fetchKey, updateFetchKey] = useFetchKey();
  // const [selectedResourceGroup, setSelectedResourceGroup] = useState<string>();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const deferredFetchKey = useDeferredValue(fetchKey);
  const deferredCurrentResourceGroup = useDeferredValue(currentResourceGroup);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.PendingSessionNodeList',
  );

  const [selectedSessionList, setSelectedSessionList] = useState<
    PendingSessionNode[]
  >([]);
  const [openBulkEditPriorityModal, setOpenBulkEditPriorityModal] =
    useState(false);

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
                ...EditSessionPriorityModalFragment
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
        <BAIFlex gap="xs">
          {enablePriorityEditing && selectedSessionList.length > 0 && (
            <>
              <BAISelectionLabel
                count={selectedSessionList.length}
                onClearSelection={() => setSelectedSessionList([])}
              />
              <Tooltip title={t('button.Settings')} placement="topLeft">
                <Button
                  icon={<SettingsIcon />}
                  onClick={() => {
                    setOpenBulkEditPriorityModal(true);
                  }}
                />
              </Tooltip>
            </>
          )}
          <AutoUpdateFetchKeyButton
            settingId="pending-session-list"
            defaultAutoUpdateDelay={10_000}
            loading={
              deferredQueryVariables !== queryVariables ||
              deferredFetchKey !== fetchKey
            }
            value={fetchKey}
            onChange={(newFetchKey) => {
              updateFetchKey(newFetchKey);
            }}
          />
        </BAIFlex>
      </BAIFlex>

      <SessionNodes
        disableSorter
        enablePriorityColumn={enablePriorityEditing}
        rowSelection={
          enablePriorityEditing
            ? {
                type: 'checkbox',
                preserveSelectedRowKeys: true,
                getCheckboxProps(record) {
                  // Priority is only editable while the session is PENDING.
                  return {
                    disabled: record.status !== 'PENDING',
                  };
                },
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
              }
            : undefined
        }
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
      <BAIUnmountAfterClose>
        <EditSessionPriorityModal
          sessionFrgmts={selectedSessionList}
          open={openBulkEditPriorityModal}
          onRequestClose={(success) => {
            setOpenBulkEditPriorityModal(false);
            if (success) {
              setSelectedSessionList([]);
              updateFetchKey();
            }
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default PendingSessionNodeList;
