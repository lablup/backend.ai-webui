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
import AutoUpdateFetchKeyButton, {
  LONG_AUTO_UPDATE_DELAY_OPTIONS,
} from '../AutoUpdateFetchKeyButton';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
import ProjectFairShareTable, {
  availableProjectFairShareSorterValues,
  ProjectFairShare,
} from './ProjectFairShareTable';
import UsageBucketModal from './UsageBucketModal';
import { theme, Tooltip } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAISelectionLabel,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ChartNoAxesCombined, SquarePenIcon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface ProjectFairShareStepProps {
  resourceGroupName: string;
  domainName: string;
  initialFetchKey: string;
  loading?: boolean;
  onClickProjectName?: (projectName: string) => void;
}

const ProjectFairShareStep: React.FC<ProjectFairShareStepProps> = ({
  resourceGroupName,
  domainName,
  initialFetchKey,
  loading,
  onClickProjectName,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

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
    order: convertToOrderBy<ProjectFairShareOrderBy>(queryParams.order) || [
      { field: 'CREATED_AT', direction: 'DESC' },
    ],
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const effectiveFetchKey =
    fetchKey === INITIAL_FETCH_KEY ? initialFetchKey : fetchKey;
  const deferredFetchKey = useDeferredValue(effectiveFetchKey);

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
          deferredFetchKey === initialFetchKey
            ? 'store-and-network'
            : 'network-only',
      },
    );

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <BAIFlex justify="between" align="center" wrap="wrap" gap="sm">
        <BAIGraphQLPropertyFilter
          filterProperties={[
            {
              key: 'project.name',
              propertyLabel: t('fairShare.Name'),
              type: 'string',
            },
          ]}
          value={queryParams.filter || {}}
          onChange={(filter) => {
            setQueryParams({
              filter: filter || null,
            });
            setTablePaginationOption({ current: 1 });
          }}
        />
        <BAIFlex gap="xs">
          {selectedRows.length > 0 && (
            <>
              <BAISelectionLabel
                count={selectedRows.length}
                onClearSelection={() => setSelectedRows([])}
              />
              <Tooltip title={t('general.ShowUsageGraph')} placement="topLeft">
                <BAIButton
                  icon={
                    <ChartNoAxesCombined style={{ color: token.colorInfo }} />
                  }
                  onClick={() => {
                    setOpenUsageModal(true);
                  }}
                />
              </Tooltip>
              <Tooltip title={t('general.BulkEdit')} placement="topLeft">
                <BAIButton
                  icon={<SquarePenIcon style={{ color: token.colorInfo }} />}
                  onClick={() => {
                    setOpenWeightSettingModal(true);
                  }}
                />
              </Tooltip>
            </>
          )}
          <AutoUpdateFetchKeyButton
            settingId="fair-share-list"
            autoUpdateDelayOptions={LONG_AUTO_UPDATE_DELAY_OPTIONS}
            loading={effectiveFetchKey !== deferredFetchKey}
            value=""
            onChange={() => {
              updateFetchKey();
            }}
          />
        </BAIFlex>
      </BAIFlex>
      <ProjectFairShareTable
        projectFairShareNodeFragment={
          projectFairShares?.edges?.map((edge) => edge?.node) || null
        }
        loading={
          loading ||
          queryVariables !== deferredQueryVariables ||
          effectiveFetchKey !== deferredFetchKey
        }
        selectedRows={selectedRows}
        onRowSelect={(selectedRowKeys, currentPageItems) => {
          handleRowSelectionChange(
            selectedRowKeys,
            currentPageItems,
            setSelectedRows,
            'id',
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
          style: {
            marginRight: token.marginXS,
          },
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
          resourceGroupFrgmt={resourceGroups?.edges?.[0]?.node}
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
