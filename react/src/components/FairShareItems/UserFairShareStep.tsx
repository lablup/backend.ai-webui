/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  UserFairShareOrderBy,
  UserFairShareStepContentQuery,
} from '../../__generated__/UserFairShareStepContentQuery.graphql';
import { UserFairShareStepQuery } from '../../__generated__/UserFairShareStepQuery.graphql';
import { convertToOrderBy, handleRowSelectionChange } from '../../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../../hooks/reactPaginationQueryOptions';
import AutoUpdateFetchKeyButton, {
  LONG_AUTO_UPDATE_DELAY_OPTIONS,
} from '../AutoUpdateFetchKeyButton';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
import UsageBucketModal from './UsageBucketModal';
import UserFairShareTable, {
  availableUserFairShareSorterValues,
  UserFairShare,
} from './UserFairShareTable';
import UserResourceGroupAlert from './UserResourceGroupAlert';
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
import { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface UserFairShareStepProps {
  resourceGroupName: string;
  domainName: string;
  projectName: string;
  loading?: boolean;
}

const UserFairShareStep: React.FC<UserFairShareStepProps> = ({
  resourceGroupName,
  domainName,
  projectName,
  loading,
}) => {
  'use memo';

  const { projectFairShares } = useLazyLoadQuery<UserFairShareStepQuery>(
    graphql`
      query UserFairShareStepQuery(
        $resourceGroupName: String!
        $domainName: String!
        $projectName: String
      ) {
        projectFairShares: rgProjectFairShares(
          scope: {
            resourceGroupName: $resourceGroupName
            domainName: $domainName
          }
          filter: { project: { name: { equals: $projectName } } }
          limit: 1
        ) {
          edges {
            node {
              projectId
            }
          }
        }
      }
    `,
    { resourceGroupName, domainName, projectName },
  );

  const projectId = projectFairShares?.edges?.[0]?.node?.projectId;
  if (!projectId) {
    // The message must mention 'projectFairShares' so that SchedulerPage's
    // error fallback classifies it as an invalid URL parameter error.
    throw new Error(
      `projectFairShares: no project named "${projectName}" in resource group "${resourceGroupName}" and domain "${domainName}".`,
    );
  }

  return (
    <UserFairShareStepContent
      resourceGroupName={resourceGroupName}
      domainName={domainName}
      projectId={projectId}
      loading={loading}
    />
  );
};

interface UserFairShareStepContentProps {
  resourceGroupName: string;
  domainName: string;
  projectId: string;
  loading?: boolean;
}

const UserFairShareStepContent: React.FC<UserFairShareStepContentProps> = ({
  resourceGroupName,
  domainName,
  projectId,
  loading,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

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
    order: convertToOrderBy<UserFairShareOrderBy>(queryParams.order) || [
      { field: 'CREATED_AT', direction: 'DESC' },
    ],
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { resourceGroups, userFairShares } =
    useLazyLoadQuery<UserFairShareStepContentQuery>(
      graphql`
        query UserFairShareStepContentQuery(
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

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <Suspense fallback={null}>
        <UserResourceGroupAlert
          resourceGroupName={resourceGroupName}
          domainName={domainName}
          projectId={projectId}
        />
      </Suspense>
      <BAIFlex justify="between" align="center" wrap="wrap" gap="sm">
        <BAIGraphQLPropertyFilter
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
            loading={fetchKey !== deferredFetchKey}
            value=""
            onChange={() => {
              updateFetchKey();
            }}
          />
        </BAIFlex>
      </BAIFlex>
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
          userFairShareFrgmt={
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
          userFairShareFrgmt={selectedRows}
          onRequestClose={() => setOpenUsageModal(false)}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default UserFairShareStep;
