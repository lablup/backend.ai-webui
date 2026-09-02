/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  UserFairShareOrderBy,
  UserFairShareStepQuery,
} from '../../__generated__/UserFairShareStepQuery.graphql';
import { convertToOrderBy, handleRowSelectionChange } from '../../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../../hooks/reactPaginationQueryOptions';
import FairShareStepToolbar from './FairShareStepToolbar';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
import ResourceGroupSchedulerTypeAlert from './ResourceGroupSchedulerTypeAlert';
import UsageBucketModal from './UsageBucketModal';
import UserFairShareTable, {
  availableUserFairShareSorterValues,
  userFairShareOrderFieldMap,
  UserFairShare,
} from './UserFairShareTable';
import UserResourceGroupAlert from './UserResourceGroupAlert';
import {
  BAIFlex,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface UserFairShareStepProps {
  resourceGroupName: string;
  domainName: string;
  projectId: string;
  loading?: boolean;
}

const UserFairShareStep: React.FC<UserFairShareStepProps> = ({
  resourceGroupName,
  domainName,
  projectId,
  loading,
}) => {
  'use memo';

  const { t } = useTranslation();

  const [selectedRows, setSelectedRows] = useState<Array<UserFairShare>>([]);
  const [selectedSingleRow, setSelectedSingleRow] =
    useState<UserFairShare | null>(null);
  const [openWeightSettingModal, setOpenWeightSettingModal] = useState(false);
  const [openUsageModal, setOpenUsageModal] = useState(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableUserFairShareSorterValues),
      filter: parseAsJson<any>((value) => value),
    },
    {
      history: 'replace',
    },
  );

  const queryVariables = {
    resourceGroupName,
    domainName,
    projectId,
    filter: {
      ...(queryParams.filter || {}),
    },
    order: convertToOrderBy<UserFairShareOrderBy>(
      queryParams.order,
      userFairShareOrderFieldMap,
    ) || [{ field: 'CREATED_AT', direction: 'DESC' }],
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { resourceGroups, userFairShares } =
    useLazyLoadQuery<UserFairShareStepQuery>(
      graphql`
        query UserFairShareStepQuery(
          $resourceGroupName: String!
          $domainName: String!
          $projectId: String!
          $filter: RGUserFairShareFilter
          $order: [UserFairShareOrderBy!]
          $limit: Int
          $offset: Int
        ) {
          resourceGroups: adminResourceGroups(
            filter: { name: { equals: $resourceGroupName } }
            limit: 1
          ) {
            edges {
              node {
                ...ResourceGroupSchedulerTypeAlertFragment
                ...FairShareWeightSettingModal_ResourceGroupFragment
              }
            }
          }
          userFairShares: rgUserFairShares(
            scope: {
              resourceGroupName: $resourceGroupName
              domainName: $domainName
              projectId: $projectId
            }
            filter: $filter
            orderBy: $order
            limit: $limit
            offset: $offset
          )
            # FIXME: @required(action: THROW) can detect invalid URL params, but cannot distinguish other errors that cause null.
            @required(action: THROW) {
            count
            edges {
              node {
                ...UserFairShareTableFragment
              }
            }
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

  const resourceGroupNode = resourceGroups?.edges?.[0]?.node;

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <ResourceGroupSchedulerTypeAlert resourceGroupFrgmt={resourceGroupNode} />
      <Suspense fallback={null}>
        <UserResourceGroupAlert
          resourceGroupName={resourceGroupName}
          domainName={domainName}
          projectId={projectId}
        />
      </Suspense>
      <FairShareStepToolbar
        filterProperties={[
          {
            key: 'user.email',
            propertyLabel: t('fairShare.Email'),
            type: 'string',
          },
          {
            key: 'user.username',
            propertyLabel: t('fairShare.Name'),
            type: 'string',
          },
          {
            key: 'user.isActive',
            propertyLabel: t('fairShare.ActiveStatus'),
            type: 'boolean',
          },
        ]}
        filterValue={queryParams.filter || {}}
        onChangeFilter={(filter) => {
          setQueryParams({
            filter: filter || null,
          });
          setTablePaginationOption({ current: 1 });
        }}
        fetchKeyLoading={fetchKey !== deferredFetchKey}
        onRefresh={() => {
          updateFetchKey();
        }}
        selection={{
          selectedCount: selectedRows.length,
          onClearSelection: () => setSelectedRows([]),
          onShowUsage: () => setOpenUsageModal(true),
          onBulkEdit: () => setOpenWeightSettingModal(true),
        }}
      />
      <UserFairShareTable
        userFairShareNodeFragment={
          userFairShares?.edges?.map((edge) => edge?.node) || null
        }
        loading={
          loading ||
          queryVariables !== deferredQueryVariables ||
          fetchKey !== deferredFetchKey
        }
        selectedRows={selectedRows}
        onRowSelect={(selectedRowKeys, currentPageItems) => {
          handleRowSelectionChange(
            selectedRowKeys,
            currentPageItems,
            setSelectedRows,
            'userUuid',
          );
        }}
        onOpenWeightSetting={(row) => {
          setSelectedSingleRow(row);
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: userFairShares?.count || 0,
          current: tablePaginationOption.current,
          onChange: (current, pageSize) => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
          },
        }}
      />

      <BAIUnmountAfterClose>
        <FairShareWeightSettingModal
          open={!!selectedSingleRow || openWeightSettingModal}
          userFairShareFrgmt={
            selectedSingleRow ? [selectedSingleRow] : selectedRows
          }
          resourceGroupFrgmt={resourceGroupNode}
          onRequestClose={(success) => {
            if (success) {
              updateFetchKey();
              setSelectedRows([]);
            }
            setSelectedSingleRow(null);
            setOpenWeightSettingModal(false);
          }}
        />
      </BAIUnmountAfterClose>

      <BAIUnmountAfterClose>
        <UsageBucketModal
          open={openUsageModal}
          userFairShareFrgmt={selectedRows}
          onRequestClose={() => setOpenUsageModal(false)}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default UserFairShareStep;
