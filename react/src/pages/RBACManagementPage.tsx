/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RBACManagementPageQuery } from '../__generated__/RBACManagementPageQuery.graphql';
import BAIRadioGroup from '../components/BAIRadioGroup';
import RoleDetailDrawer from '../components/RoleDetailDrawer';
import RoleFormModal from '../components/RoleFormModal';
import type { EditingRole } from '../components/RoleFormModal';
import RoleNodes from '../components/RoleNodes';
import type { RoleNodeInList } from '../components/RoleNodes';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIPropertyFilter,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
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
      filter: parseAsString.withDefault(''),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const sourceFilter =
    queryParams.source === 'all' ? null : [queryParams.source];

  const nameFilter = queryParams.filter
    ? { contains: queryParams.filter }
    : null;

  const queryVariables = {
    filter: {
      status: [queryParams.status],
      ...(sourceFilter ? { source: sourceFilter } : {}),
      ...(nameFilter ? { name: nameFilter } : {}),
    },
    first: baiPaginationOption.first,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<RBACManagementPageQuery>(
    graphql`
      query RBACManagementPageQuery(
        $filter: RoleFilter
        $first: Int
        $offset: Int
      ) {
        adminRoles(filter: $filter, first: $first, offset: $offset) {
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
  const [selectedRoleForDetail, setSelectedRoleForDetail] =
    useState<RoleNodeInList | null>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] =
    useState<EditingRole | null>(null);
  // State for modals (wired in later sub-tasks)
  const [, setSelectedRoleForDelete] = useState<RoleNodeInList | null>(null);
  const [, setSelectedRoleForPurge] = useState<RoleNodeInList | null>(null);

  const roleNodes = queryRef.adminRoles?.edges?.map((edge) => edge?.node) ?? [];

  return (
    <BAICard
      variant="borderless"
      title={t('webui.menu.RBACManagement')}
      extra={
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('rbac.CreateRole')}
          </Button>
        </BAIFlex>
      }
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
        <BAIFlex gap={'sm'} align="start" wrap="wrap">
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
          <BAIPropertyFilter
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('rbac.RoleName'),
                type: 'string',
              },
            ]}
            value={queryParams.filter || undefined}
            onChange={(value) => {
              setQueryParams({ filter: value || '' });
              setTablePaginationOption({ current: 1 });
            }}
          />
        </BAIFlex>
        <Suspense fallback={<Skeleton active />}>
          <RoleNodes
            rolesFrgmt={roleNodes}
            statusFilter={queryParams.status}
            loading={deferredQueryVariables !== queryVariables}
            onClickRoleName={(role) => setSelectedRoleForDetail(role)}
            onClickEdit={(role) =>
              setSelectedRoleForEdit({
                id: role.id,
                name: role.name,
                description: role.description,
              })
            }
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
        editingRole={selectedRoleForEdit}
        onRequestClose={(success) => {
          setSelectedRoleForEdit(null);
          if (success) {
            updateFetchKey();
          }
        }}
      />
      <RoleDetailDrawer
        open={!!selectedRoleForDetail}
        roleId={selectedRoleForDetail?.id}
        onClose={() => setSelectedRoleForDetail(null)}
        onClickEdit={() => {
          if (selectedRoleForDetail) {
            setSelectedRoleForEdit({
              id: selectedRoleForDetail.id,
              name: selectedRoleForDetail.name,
              description: selectedRoleForDetail.description,
            });
            setSelectedRoleForDetail(null);
          }
        }}
      />
    </BAICard>
  );
};

export default RBACManagementPage;
