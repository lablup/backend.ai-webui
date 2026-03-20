/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RBACManagementPageQuery,
  RoleOrderBy,
} from '../__generated__/RBACManagementPageQuery.graphql';
import BAIRadioGroup from '../components/BAIRadioGroup';
import RoleDetailDrawer from '../components/RoleDetailDrawer';
import RoleFormModal from '../components/RoleFormModal';
import RoleNodes from '../components/RoleNodes';
import type { RoleNodeInList } from '../components/RoleNodes';
import { convertToOrderBy } from '../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { Skeleton } from 'antd';
import {
  BAIButton,
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const statusFilterValues = ['ACTIVE', 'INACTIVE', 'DELETED'] as const;
const sourceFilterValues = ['all', 'SYSTEM', 'CUSTOM'] as const;

const RBACManagementPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 20,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      status: parseAsStringLiteral(statusFilterValues).withDefault('ACTIVE'),
      source: parseAsStringLiteral(sourceFilterValues).withDefault('all'),
      order: parseAsString,
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();
  const [filter, setFilter] = useState<GraphQLFilter>();

  const sourceFilter =
    queryParams.source === 'all' ? null : [queryParams.source];

  const queryVariables = {
    filter: {
      status: [queryParams.status],
      ...(sourceFilter ? { source: sourceFilter } : {}),
      ...filter,
    },
    orderBy: convertToOrderBy<RoleOrderBy>(queryParams.order),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<RBACManagementPageQuery>(
    graphql`
      query RBACManagementPageQuery(
        $filter: RoleFilter
        $orderBy: [RoleOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        adminRoles(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              ...RoleNodesFragment
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [{ roleDetail: selectedRoleId }, setRoleDetailParam] = useQueryStates(
    {
      roleDetail: parseAsString,
    },
    {
      history: 'push',
    },
  );
  const [selectedRoleForEdit, setSelectedRoleForEdit] =
    useState<RoleNodeInList | null>(null);
  // State for modals (wired in later sub-tasks)
  const [, setSelectedRoleForDelete] = useState<RoleNodeInList | null>(null);
  const [, setSelectedRoleForPurge] = useState<RoleNodeInList | null>(null);

  const roleNodes = queryRef.adminRoles?.edges?.map((edge) => edge?.node) ?? [];

  return (
    <BAICard
      variant="borderless"
      title={t('webui.menu.RBACManagement')}
      styles={{
        header: {
          borderBottom: 'none',
        },
        body: {
          paddingTop: 0,
        },
      }}
    >
      <BAIFlex direction="column" align="stretch" gap={'sm'}>
        <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
          <BAIFlex
            gap={'sm'}
            align="start"
            wrap="wrap"
            style={{ flexShrink: 1 }}
          >
            <BAIRadioGroup
              optionType="button"
              value={queryParams.status}
              onChange={(e) => {
                setQueryParams({ status: e.target.value });
                setTablePaginationOption({ current: 1 });
              }}
              options={[
                { label: t('rbac.Active'), value: 'ACTIVE' },
                { label: t('rbac.Inactive'), value: 'INACTIVE' },
                { label: t('rbac.Deleted'), value: 'DELETED' },
              ]}
            />
            <BAIGraphQLPropertyFilter
              filterProperties={[
                {
                  key: 'name',
                  propertyLabel: t('rbac.RoleName'),
                  type: 'string',
                },
              ]}
              value={filter}
              onChange={(value) => {
                setFilter(value);
                setTablePaginationOption({ current: 1 });
              }}
            />
          </BAIFlex>
          <BAIFlex gap={'xs'}>
            <BAIFetchKeyButton
              loading={
                deferredQueryVariables !== queryVariables ||
                deferredFetchKey !== fetchKey
              }
              value={fetchKey}
              onChange={(newFetchKey) => {
                updateFetchKey(newFetchKey);
              }}
            />
            <BAIButton
              type="primary"
              icon={<PlusIcon />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t('rbac.CreateRole')}
            </BAIButton>
          </BAIFlex>
        </BAIFlex>
        <Suspense fallback={<Skeleton active />}>
          <RoleNodes
            rolesFrgmt={roleNodes}
            statusFilter={deferredQueryVariables.filter.status?.[0]}
            loading={deferredQueryVariables !== queryVariables}
            order={queryParams.order}
            onChangeOrder={(newOrder) =>
              setQueryParams({ order: newOrder })
            }
            onClickRoleName={(role) =>
              setRoleDetailParam({ roleDetail: role.id })
            }
            onClickEdit={(role) => setSelectedRoleForEdit(role)}
            onClickDelete={(role) => setSelectedRoleForDelete(role)}
            onClickPurge={(role) => setSelectedRoleForPurge(role)}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: queryRef.adminRoles?.count ?? 0,
              onChange: (current, pageSize) => {
                setTablePaginationOption({ current, pageSize });
              },
            }}
          />
        </Suspense>
      </BAIFlex>
      <RoleFormModal
        open={isCreateModalOpen}
        onRequestClose={(success) => {
          setIsCreateModalOpen(false);
          if (success) {
            updateFetchKey();
          }
        }}
      />
      <RoleFormModal
        open={!!selectedRoleForEdit}
        editingRoleFrgmt={selectedRoleForEdit}
        onRequestClose={(success) => {
          setSelectedRoleForEdit(null);
          if (success) {
            updateFetchKey();
          }
        }}
      />
      <RoleDetailDrawer
        open={!!selectedRoleId}
        roleId={selectedRoleId || undefined}
        onClose={() => setRoleDetailParam({ roleDetail: null })}
        onClickEdit={() => {
          if (selectedRoleId) {
            setSelectedRoleForEdit(
              (roleNodes.find((r) => r?.id === selectedRoleId) as
                | RoleNodeInList
                | undefined) ?? null,
            );
            setRoleDetailParam({ roleDetail: null });
          }
        }}
      />
    </BAICard>
  );
};

export default RBACManagementPage;
