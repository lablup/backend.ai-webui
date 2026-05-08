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
import RoleNodes, {
  type RoleNodeInList,
  availableRoleSorterValues,
} from '../components/RoleNodes';
import { convertToOrderBy } from '../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { DeleteFilled } from '@ant-design/icons';
import { App } from 'antd';
import {
  BAIButton,
  BAICard,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  filterOutEmpty,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  toLocalId,
  useBAILogger,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import { BanIcon, PlusIcon, UndoIcon } from 'lucide-react';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

const statusFilterValues = ['ACTIVE', 'DELETED'] as const;

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
      order: parseAsStringLiteral(availableRoleSorterValues),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables = {
    filter: {
      status: { in: [queryParams.status] },
      ...queryParams.filter,
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

  const { message } = App.useApp();
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

  const mutatePurgeRole =
    useMutationWithPromise<RBACManagementPagePurgeRoleMutation>(graphql`
      mutation RBACManagementPagePurgeRoleMutation($input: PurgeRoleInput!) {
        adminPurgeRole(input: $input) {
          id
        }
      }
    `);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [purgingRole, setPurgingRole] = useState<RoleNodeInList | null>(null);
  const [{ roleDetail: selectedRoleId }, setRoleDetailParam] = useQueryStates(
    {
      roleDetail: parseAsString,
    },
    {
      history: 'push',
    },
  );
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
    setPurgingRole(role);
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
                {
                  key: 'source',
                  propertyLabel: t('rbac.Source'),
                  type: 'enum',
                  fixedOperator: 'equals',
                  options: [
                    { label: t('rbac.System'), value: 'SYSTEM' },
                    { label: t('rbac.Custom'), value: 'CUSTOM' },
                  ],
                  strictSelection: true,
                },
              ]}
              value={queryParams.filter ?? undefined}
              onChange={(value) => {
                setQueryParams({ filter: value ?? null });
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
        <RoleNodes
          rolesFrgmt={roleNodes}
          loading={deferredQueryVariables !== queryVariables}
          order={queryParams.order}
          onChangeOrder={(order) => {
            setQueryParams({ order });
          }}
          customizeColumns={(columns) => {
            const isDeletedFilter =
              deferredQueryVariables.filter.status?.in?.[0] === 'DELETED';
            return columns.map((col) =>
              col.key === 'name'
                ? {
                    ...col,
                    render: (name: string, role: RoleNodeInList) => (
                      <BAINameActionCell
                        title={name}
                        showActions="always"
                        onTitleClick={() =>
                          setRoleDetailParam({ roleDetail: role.id })
                        }
                        actions={filterOutEmpty(
                          isDeletedFilter
                            ? [
                                {
                                  key: 'activate',
                                  title: t('rbac.Activate'),
                                  icon: <UndoIcon />,
                                  onClick: () => {
                                    return new Promise<void>((resolve) => {
                                      handleActivateRole(role);
                                      resolve();
                                    });
                                  },
                                },
                                {
                                  key: 'purge',
                                  title: t('rbac.PurgeRole'),
                                  icon: <DeleteFilled />,
                                  type: 'danger' as const,
                                  onClick: () => handlePurgeRole(role),
                                },
                              ]
                            : [
                                {
                                  key: 'deactivate',
                                  title: t('rbac.Deactivate'),
                                  icon: <BanIcon />,
                                  type: 'danger' as const,
                                  onClick: () => {
                                    return new Promise<void>((resolve) => {
                                      handleDeactivateRole(role);
                                      resolve();
                                    });
                                  },
                                },
                              ],
                        )}
                      />
                    ),
                  }
                : col,
            );
          }}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: queryRef.adminRoles?.count ?? 0,
            onChange: (current, pageSize) => {
              setTablePaginationOption({ current, pageSize });
            },
          }}
        />
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
      <RoleDetailDrawer
        open={!!selectedRoleId}
        roleId={selectedRoleId || undefined}
        onClose={() => setRoleDetailParam({ roleDetail: null })}
      />
      <BAIDeleteConfirmModal
        open={!!purgingRole}
        items={
          purgingRole
            ? [{ key: purgingRole.id, label: purgingRole.name ?? '' }]
            : []
        }
        title={t('rbac.PurgeRole')}
        description={t('rbac.ConfirmPurge')}
        onOk={() => {
          if (purgingRole) {
            return mutatePurgeRole({
              input: { id: toLocalId(purgingRole.id) },
            })
              .then(() => {
                message.success(t('rbac.RolePurged'));
                updateFetchKey();
                setPurgingRole(null);
              })
              .catch((error) => {
                logger.error('Failed to purge role', error);
                message.error(error?.message || t('general.ErrorOccurred'));
                setPurgingRole(null);
              });
          }
        }}
        onCancel={() => setPurgingRole(null)}
      />
    </BAICard>
  );
};

export default RBACManagementPage;
