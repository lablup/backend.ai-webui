/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DomainFairShareOrderBy,
  DomainFairShareStepQuery,
} from '../../__generated__/DomainFairShareStepQuery.graphql';
import { convertToOrderBy, handleRowSelectionChange } from '../../helper';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../../hooks/reactPaginationQueryOptions';
import DomainFairShareTable, {
  availableDomainFairShareSorterValues,
  domainFairShareOrderFieldMap,
  DomainFairShare,
} from './DomainFairShareTable';
import FairShareStepToolbar, {
  flattenUnsupportedSubFilter,
} from './FairShareStepToolbar';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
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

interface DomainFairShareStepProps {
  resourceGroupName: string;
  loading?: boolean;
  onClickDomainName?: (domainName: string) => void;
}

const DomainFairShareStep: React.FC<DomainFairShareStepProps> = ({
  resourceGroupName,
  loading,
  onClickDomainName,
}) => {
  'use memo';

  const { t } = useTranslation();

  // Two conditions serialize as `{ AND: [...] }` (manager 26.7.0+); older
  // managers get only the pre-FR-3920 property, capped at one condition.
  // TODO(FR-3920): once #9638's `maxConditions` lands, show them with
  // `maxConditions={1}` instead of hiding them.
  const supportsSubFilter =
    useSuspendedBackendaiClient().isManagerVersionCompatibleWith('26.7.0');

  const [selectedRows, setSelectedRows] = useState<Array<DomainFairShare>>([]);
  const [selectedSingleRow, setSelectedSingleRow] =
    useState<DomainFairShare | null>(null);
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
      order: parseAsStringLiteral(availableDomainFairShareSorterValues),
      filter: parseAsJson<any>((value) => value),
    },
    {
      history: 'replace',
    },
  );

  // A URL written before this gate (or on a newer manager) can still carry
  // an AND/OR/NOT combinator the filter control can no longer produce here.
  const effectiveFilter = supportsSubFilter
    ? queryParams.filter
    : flattenUnsupportedSubFilter(queryParams.filter);

  const queryVariables = {
    resourceGroupName,
    filter: {
      ...(effectiveFilter || {}),
    },
    order: convertToOrderBy<DomainFairShareOrderBy>(
      queryParams.order,
      domainFairShareOrderFieldMap,
    ) || [{ field: 'DOMAIN_NAME', direction: 'ASC' }],
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { resourceGroups, domainFairShares } =
    useLazyLoadQuery<DomainFairShareStepQuery>(
      graphql`
        query DomainFairShareStepQuery(
          $resourceGroupName: String!
          $filter: RGDomainFairShareFilter
          $order: [DomainFairShareOrderBy!]
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
          domainFairShares: rgDomainFairShares(
            scope: { resourceGroupName: $resourceGroupName }
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
                ...DomainFairShareTableFragment
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
        singleCondition={!supportsSubFilter}
        filterProperties={[
          {
            key: 'domainName',
            propertyLabel: t('fairShare.Name'),
            type: 'string',
          },
          ...(supportsSubFilter
            ? ([
                {
                  key: 'domain.isActive',
                  propertyLabel: t('fairShare.ActiveStatus'),
                  type: 'boolean',
                },
              ] as const)
            : []),
        ]}
        filterValue={effectiveFilter || {}}
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
      <DomainFairShareTable
        domainFairShareNodeFragment={
          domainFairShares?.edges?.map((edge) => edge?.node) || null
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
            'domainName',
          );
        }}
        onOpenWeightSetting={(row) => {
          setSelectedSingleRow(row);
        }}
        onClickDomainName={onClickDomainName}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: domainFairShares?.count || 0,
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
          domainFairShareFrgmt={
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
          domainFairShareFrgmt={selectedRows}
          onRequestClose={() => setOpenUsageModal(false)}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default DomainFairShareStep;
