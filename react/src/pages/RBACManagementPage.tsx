/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RBACManagementPageActivateRoleMutation } from '../__generated__/RBACManagementPageActivateRoleMutation.graphql';
import { RBACManagementPageDeactivateRoleMutation } from '../__generated__/RBACManagementPageDeactivateRoleMutation.graphql';
import { RBACManagementPagePurgeRoleMutation } from '../__generated__/RBACManagementPagePurgeRoleMutation.graphql';
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
import { App, Skeleton } from 'antd';
import {
  BAIButton,
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  toLocalId,
  useBAILogger,
  useFetchKey,
} from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

const statusFilterValues = ['ACTIVE', 'DELETED'] as const;
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
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      status: parseAsStringLiteral(statusFilterValues).withDefault('ACTIVE'),
      source: parseAsStringLiteral(sourceFilterValues).withDefault('all'),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();
  const [filter, setFilter] = useState<GraphQLFilter>();
  const [order, setOrder] = useState<string | null>(null);

  const sourceFilter =
    queryParams.source === 'all' ? null : [queryParams.source];

  const queryVariables = {
    filter: {
      status: [queryParams.status],
      ...(sourceFilter ? { source: sourceFilter } : {}),
      ...filter,
    },
    orderBy: convertToOrderBy<RoleOrderBy>(order),
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
              ...RoleFormModalFragment
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

  const { modal, message } = App.useApp();
  const { logger } = useBAILogger();

  const [commitDeactivateRole] =
    useMutation<RBACManagementPageDeactivateRoleMutation>(graphql`
      mutation RBACManagementPageDeactivateRoleMutation(
        $input: DeleteRoleInput!
      ) {
        adminDeleteRole(input: $input) {
          id
        }
      }
    `);

  const [commitActivateRole] =
    useMutation<RBACManagementPageActivateRoleMutation>(graphql`
      mutation RBACManagementPageActivateRoleMutation(
        $input: UpdateRoleInput!
      ) {
        adminUpdateRole(input: $input) {
          id
          status
        }
      }
    `);

  const [commitPurgeRole] = useMutation<RBACManagementPagePurgeRoleMutation>(
    graphql`
      mutation RBACManagementPagePurgeRoleMutation($input: PurgeRoleInput!) {
        adminPurgeRole(input: $input) {
          id
        }
      }
    `,
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

  const handleDeactivateRole = (role: RoleNodeInList) => {
    commitDeactivateRole({
      variables: { input: { id: toLocalId(role.id) } },
      onCompleted: (_data, errors) => {
        if (errors && errors.length > 0) {
          logger.error(errors[0]);
          message.error(errors[0]?.message || t('general.ErrorOccurred'));
          return;
        }
        message.success(t('rbac.RoleDeactivated'));
        updateFetchKey();
      },
      onError: (error) => {
        logger.error(error);
        message.error(error?.message || t('general.ErrorOccurred'));
      },
    });
  };

  const handleActivateRole = (role: RoleNodeInList) => {
    commitActivateRole({
      variables: {
        input: { id: toLocalId(role.id), status: 'ACTIVE' },
      },
      onCompleted: (_data, errors) => {
        if (errors && errors.length > 0) {
          logger.error(errors[0]);
          message.error(errors[0]?.message || t('general.ErrorOccurred'));
          return;
        }
        message.success(t('rbac.RoleActivated'));
        updateFetchKey();
      },
      onError: (error) => {
        logger.error(error);
        message.error(error?.message || t('general.ErrorOccurred'));
      },
    });
  };

  const handlePurgeRole = (role: RoleNodeInList) => {
    modal.confirm({
      title: t('rbac.PurgeRole'),
      content: t('rbac.ConfirmPurge', { name: role.name }),
      okText: t('button.Delete'),
      okButtonProps: { danger: true, type: 'primary' },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          commitPurgeRole({
            variables: { input: { id: toLocalId(role.id) } },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                reject();
                return;
              }
              message.success(t('rbac.RolePurged'));
              updateFetchKey();
              resolve();
            },
            onError: (error) => {
              logger.error(error);
              message.error(error?.message || t('general.ErrorOccurred'));
              reject();
            },
          });
        }),
    });
  };

  const roleNodes = queryRef.adminRoles?.edges?.map((edge) => edge?.node) ?? [];

  return (
    <BAICard
      activeTabKey="roles"
      tabList={[
        {
          key: 'roles',
          label: t('webui.menu.RBACManagement'),
        },
      ]}
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
                { label: t('rbac.Inactive'), value: 'DELETED' },
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
            order={order}
            onChangeOrder={setOrder}
            onClickRoleName={(role) =>
              setRoleDetailParam({ roleDetail: role.id })
            }
            onClickEdit={(role) => setSelectedRoleForEdit(role)}
            onClickDeactivate={handleDeactivateRole}
            onClickActivate={handleActivateRole}
            onClickPurge={handlePurgeRole}
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
          }
        }}
      />
    </BAICard>
  );
};

export default RBACManagementPage;
