/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ProjectFairShareOrderBy,
  ProjectFairShareStepQuery,
} from '../../__generated__/ProjectFairShareStepQuery.graphql';
import { convertToOrderBy, handleRowSelectionChange } from '../../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../../hooks/reactPaginationQueryOptions';
import FairShareStepToolbar from './FairShareStepToolbar';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
import ProjectFairShareTable, {
  availableProjectFairShareSorterValues,
  projectFairShareOrderFieldMap,
  ProjectFairShare,
} from './ProjectFairShareTable';
import ResourceGroupSchedulerTypeAlert from './ResourceGroupSchedulerTypeAlert';
import UsageBucketModal from './UsageBucketModal';
import {
  BAIFlex,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface ProjectFairShareStepProps {
  resourceGroupName: string;
  domainName: string;
  loading?: boolean;
  onClickProjectName?: (projectId: string) => void;
}

const ProjectFairShareStep: React.FC<ProjectFairShareStepProps> = ({
  resourceGroupName,
  domainName,
  loading,
  onClickProjectName,
}) => {
  'use memo';

  const { t } = useTranslation();

  const [selectedRows, setSelectedRows] = useState<Array<ProjectFairShare>>([]);
  const [selectedSingleRow, setSelectedSingleRow] =
    useState<ProjectFairShare | null>(null);
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
      order: parseAsStringLiteral(availableProjectFairShareSorterValues),
      filter: parseAsJson<any>((value) => value),
    },
    {
      history: 'replace',
    },
  );

  const queryVariables = {
    resourceGroupName,
    domainName,
    filter: {
      ...(queryParams.filter || {}),
    },
    order: convertToOrderBy<ProjectFairShareOrderBy>(
      queryParams.order,
      projectFairShareOrderFieldMap,
    ) || [{ field: 'CREATED_AT', direction: 'DESC' }],
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { resourceGroups, projectFairShares } =
    useLazyLoadQuery<ProjectFairShareStepQuery>(
      graphql`
        query ProjectFairShareStepQuery(
          $resourceGroupName: String!
          $domainName: String!
          $filter: RGProjectFairShareFilter
          $order: [ProjectFairShareOrderBy!]
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
          projectFairShares: rgProjectFairShares(
            scope: {
              resourceGroupName: $resourceGroupName
              domainName: $domainName
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
                ...ProjectFairShareTableFragment
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
      <FairShareStepToolbar
        filterProperties={[
          {
            key: 'project.name',
            propertyLabel: t('fairShare.Name'),
            type: 'string',
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
      <ProjectFairShareTable
        projectFairShareNodeFragment={
          projectFairShares?.edges?.map((edge) => edge?.node) || null
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
          );
        }}
        onOpenWeightSetting={(row) => {
          setSelectedSingleRow(row);
        }}
        onClickProjectName={onClickProjectName}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: projectFairShares?.count || 0,
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
          projectFairShareFrgmt={
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
          projectFairShareFrgmt={selectedRows}
          onRequestClose={() => setOpenUsageModal(false)}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default ProjectFairShareStep;
