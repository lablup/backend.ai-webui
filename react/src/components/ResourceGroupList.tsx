/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupListDeleteMutation } from '../__generated__/ResourceGroupListDeleteMutation.graphql';
import { ResourceGroupListInfoModalQuery } from '../__generated__/ResourceGroupListInfoModalQuery.graphql';
import {
  ResourceGroupFilter,
  ResourceGroupListQuery,
  ResourceGroupListQuery$data,
  ResourceGroupOrderBy,
} from '../__generated__/ResourceGroupListQuery.graphql';
import { ResourceGroupListSettingModalQuery } from '../__generated__/ResourceGroupListSettingModalQuery.graphql';
import { ResourceGroupListUpdateMutation } from '../__generated__/ResourceGroupListUpdateMutation.graphql';
import { App } from '../app-shim';
import { convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useSFTPProxyResourceGroupsQuery } from '../hooks/useSFTPResourceGroups';
import { theme } from '../theme-shim';
import BAIRadioGroup from './BAIRadioGroup';
import ResourceGroupInfoModal from './ResourceGroupInfoModal';
import ResourceGroupSettingModal from './ResourceGroupSettingModal';
import UpdateResourceGroupsModal from './UpdateResourceGroupsModal';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Token } from '@astryxdesign/core/Token';
import {
  BAIButton,
  BAIColumnsType,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAIQuestionIconWithTooltip,
  BAISelectionLabel,
  BAITable,
  BAIUnmountAfterClose,
  filterOutEmpty,
  filterOutNullAndUndefined,
  useToggle,
  useUpdatableState,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import {
  Check,
  X,
  Trash2,
  Info,
  BanIcon,
  PlusIcon,
  SquarePenIcon,
  UndoIcon,
} from 'lucide-react';
import React, {
  Suspense,
  useDeferredValue,
  useEffect,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { PayloadError } from 'relay-runtime';

export interface ScalingGroupOpts {
  allowed_session_types: ('interactive' | 'batch' | 'inference')[];
  pending_timeout: number;
  config: Record<string, any>;
  agent_selection_strategy: ('dispersed' | 'concentrated')[];
  agent_selector_config: Record<string, any>;
  enforce_spreading_endpoint_replica: boolean;
}

type ResourceGroupNode = NonNullable<
  NonNullable<
    NonNullable<
      ResourceGroupListQuery$data['adminResourceGroups']
    >['edges'][number]
  >['node']
>;

/**
 * The modals still read the graphene `ScalingGroup` (it carries `driver`,
 * `driver_opts`, `scheduler_opts` and `wsproxy_api_token`, none of which the
 * strawberry `ResourceGroup` exposes), so they load their own row by name.
 */
const ResourceGroupInfoModalWithQuery: React.FC<{
  resourceGroupName: string;
  open: boolean;
  onRequestClose: () => void;
}> = ({ resourceGroupName, onRequestClose, ...modalProps }) => {
  'use memo';
  const { scaling_group } = useLazyLoadQuery<ResourceGroupListInfoModalQuery>(
    graphql`
      query ResourceGroupListInfoModalQuery($name: String!) {
        scaling_group(name: $name) {
          ...ResourceGroupInfoModalFragment
        }
      }
    `,
    { name: resourceGroupName },
    { fetchPolicy: 'store-and-network' },
  );

  // A row deleted between the list query and this lookup comes back null;
  // rendering it would show an all-blank modal, so close instead.
  useEffect(() => {
    if (!scaling_group) {
      onRequestClose();
    }
  }, [scaling_group, onRequestClose]);

  return scaling_group ? (
    <ResourceGroupInfoModal
      resourceGroupFrgmt={scaling_group}
      onRequestClose={onRequestClose}
      {...modalProps}
    />
  ) : null;
};

const ResourceGroupSettingModalWithQuery: React.FC<{
  resourceGroupName: string;
  open: boolean;
  onRequestClose: (success: boolean) => void;
}> = ({ resourceGroupName, onRequestClose, ...modalProps }) => {
  'use memo';
  const { scaling_group } =
    useLazyLoadQuery<ResourceGroupListSettingModalQuery>(
      graphql`
        query ResourceGroupListSettingModalQuery($name: String!) {
          scaling_group(name: $name) {
            ...ResourceGroupSettingModalFragment
          }
        }
      `,
      { name: resourceGroupName },
      // `modify_scaling_group` returns only `ok`/`msg`, so the cached
      // `ScalingGroup` keeps its pre-edit values; the form reads
      // `initialValues` once at mount, so a cached first render would stick.
      { fetchPolicy: 'network-only' },
    );

  // `ResourceGroupSettingModal` reads a null fragment as "create mode", so a
  // row deleted between the list query and this lookup would turn Edit into a
  // blank Create form. Close instead.
  useEffect(() => {
    if (!scaling_group) {
      onRequestClose(false);
    }
  }, [scaling_group, onRequestClose]);

  return scaling_group ? (
    <ResourceGroupSettingModal
      resourceGroupFrgmt={scaling_group}
      onRequestClose={onRequestClose}
      {...modalProps}
    />
  ) : null;
};

const ResourceGroupList: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  // AND/OR/NOT sub-filters only exist on managers with the `sub-filter`
  // capability; older ones reject them, so restrict to a single condition.
  const supportsSubFilter = baiClient.supports('sub-filter');
  const [activeType, setActiveType] = useState<'active' | 'inactive'>('active');
  const [
    openCreateModal,
    { setRight: openSettingModal, setLeft: hideSettingModal },
  ] = useToggle(false);
  const [openInfoModal, { setRight: showInfoModal, setLeft: hideInfoModal }] =
    useToggle(false);
  const [openSFTPModal, setOpenSFTPModal] = useState(false);
  const [infoModalName, setInfoModalName] = useState<string>();
  const [settingModalName, setSettingModalName] = useState<string>();
  const [selectedResourceGroupName, setSelectedResourceGroupName] =
    useState<string>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ResourceGroupList',
  );
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  // Read the `proxy -> resource group names` map from etcd (superadmin-only),
  // non-blocking (the table renders without waiting on it) and invalidated on
  // every SFTP write so it stays fresh. Inverted to `group name -> proxies`
  // to show, per row, which storage proxies handle that group's SFTP.
  const { data: proxyResourceGroups } = useSFTPProxyResourceGroupsQuery({
    enabled: baiClient.is_superadmin,
  });
  const proxiesByGroupName = _.mapValues(
    _.groupBy(
      _.flatMap(_.entries(proxyResourceGroups ?? {}), ([proxy, groupNames]) =>
        _.map(groupNames, (groupName) => ({ proxy, groupName })),
      ),
      'groupName',
    ),
    (pairs) => _.map(pairs, 'proxy'),
  );
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });
  const [filter, setFilter] = useState<ResourceGroupFilter | undefined>(
    undefined,
  );
  const [order, setOrder] = useState<string | undefined>(undefined);

  const queryVariables = {
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    // The Active/Inactive radio owns `isActive`, so it always wins over the
    // property filter (which does not expose that key).
    filter: {
      ...filter,
      isActive: activeType === 'active',
    },
    orderBy: convertToOrderBy<ResourceGroupOrderBy>(order) ?? null,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const isRefetching = queryVariables !== deferredQueryVariables;

  // `driver` / `driver_opts` are deliberately absent from the strawberry
  // `ResourceGroup`, so the Driver column is gone (its value is always
  // "static"); the Info modal still shows both via its own graphene query.
  const { adminResourceGroups } = useLazyLoadQuery<ResourceGroupListQuery>(
    graphql`
      query ResourceGroupListQuery(
        $limit: Int
        $offset: Int
        $filter: ResourceGroupFilter
        $orderBy: [ResourceGroupOrderBy!]
      ) {
        adminResourceGroups(
          limit: $limit
          offset: $offset
          filter: $filter
          orderBy: $orderBy
        ) {
          count
          edges {
            node {
              id
              name
              status {
                isActive
                isPublic
                isDefault
              }
              metadata {
                description
                createdAt
              }
              network {
                wsproxyAddr
              }
              scheduler {
                type
              }
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy: 'store-and-network',
      fetchKey,
    },
  );

  const resourceGroups = filterOutNullAndUndefined(
    _.map(adminResourceGroups?.edges, 'node'),
  );

  const [commitUpdateResourceGroup] =
    useMutation<ResourceGroupListUpdateMutation>(graphql`
      mutation ResourceGroupListUpdateMutation(
        $name: String!
        $input: ModifyScalingGroupInput!
      ) {
        modify_scaling_group(name: $name, props: $input) {
          ok
          msg
        }
      }
    `);

  const [commitDeleteResourceGroup, isInflightCommitDeleteResourceGroup] =
    useMutation<ResourceGroupListDeleteMutation>(graphql`
      mutation ResourceGroupListDeleteMutation($name: String!) {
        delete_scaling_group(name: $name) {
          ok
          msg
        }
      }
    `);

  const renderBooleanCell = (value: boolean | null | undefined) =>
    value ? (
      <Check style={{ color: token.colorSuccess }} size="1em" />
    ) : (
      <X style={{ color: token.colorTextSecondary }} size="1em" />
    );

  const closeSettingModal = (success: boolean) => {
    hideSettingModal();
    setSettingModalName(undefined);
    if (success) {
      startRefetchTransition(() => {
        updateFetchKey();
      });
    }
  };

  const columns: BAIColumnsType<ResourceGroupNode> = filterOutEmpty([
    {
      key: 'name',
      title: t('resourceGroup.Name'),
      dataIndex: 'name',
      sorter: true,
      render: (name: string, record: ResourceGroupNode) => (
        <BAINameActionCell
          title={name}
          showActions="always"
          actions={[
            {
              key: 'info',
              title: t('button.Info'),
              icon: <Info size="1em" />,
              onClick: () => {
                setInfoModalName(record.name);
                showInfoModal();
              },
            },
            {
              key: 'edit',
              title: t('button.Edit'),
              icon: <SquarePenIcon />,
              onClick: () => {
                setSettingModalName(record.name);
                openSettingModal();
              },
            },
            {
              key: 'activate-deactivate',
              title: record.status.isActive
                ? t('resourceGroup.Deactivate')
                : t('resourceGroup.Activate'),
              icon: record.status.isActive ? <BanIcon /> : <UndoIcon />,
              type: record.status.isActive ? 'danger' : 'default',
              popConfirm: {
                title: record.status.isActive
                  ? t('resourceGroup.DeactivateResourceGroup')
                  : t('resourceGroup.ActivateResourceGroup'),
                description: record?.name,
                okButtonProps: {
                  danger: !!record.status.isActive,
                },
                okText: record.status.isActive
                  ? t('resourceGroup.Deactivate')
                  : t('resourceGroup.Activate'),
                cancelText: t('button.Cancel'),
                onConfirm: () => {
                  return new Promise<void>((resolve) => {
                    commitUpdateResourceGroup({
                      variables: {
                        name: record.name ?? '',
                        input: {
                          is_active: !record.status.isActive,
                        },
                      },
                      onCompleted: ({ modify_scaling_group: res }, errors) => {
                        if (!res?.ok) {
                          message.error(res?.msg);
                          resolve();
                          return;
                        }
                        if (errors && errors.length > 0) {
                          const errorMsgList = _.map(
                            errors,
                            (error: PayloadError) => error.message,
                          );
                          for (const error of errorMsgList) {
                            message.error(error);
                          }
                          resolve();
                          return;
                        }
                        message.success(
                          t('resourceGroup.ResourceGroupModified'),
                        );
                        startRefetchTransition(() => {
                          updateFetchKey();
                        });
                        resolve();
                      },
                      onError: (err) => {
                        message.error(err.message);
                        resolve();
                      },
                    });
                  });
                },
              },
            },
            // Deletion is only offered for deactivated groups (Inactive tab);
            // active groups are deactivated first.
            ...(activeType === 'inactive'
              ? [
                  {
                    key: 'delete',
                    title: t('button.Delete'),
                    icon: <Trash2 size="1em" />,
                    type: 'danger' as const,
                    onClick: () => {
                      setSelectedResourceGroupName(record?.name || '');
                    },
                  },
                ]
              : []),
          ]}
        />
      ),
    },
    {
      key: 'description',
      title: t('resourceGroup.Description'),
      dataIndex: ['metadata', 'description'],
      render: (value) => value || '-',
    },
    {
      key: 'is_public',
      title: t('resourceGroup.Public'),
      dataIndex: ['status', 'isPublic'],
      render: renderBooleanCell,
    },
    {
      key: 'is_default',
      title: t('resourceGroup.Default'),
      dataIndex: ['status', 'isDefault'],
      render: renderBooleanCell,
    },
    {
      key: 'sftp',
      title: (
        <BAIFlex gap="xxs">
          {t('storageProxy.SFTPStorageProxies')}
          <BAIQuestionIconWithTooltip
            title={t('storageProxy.SFTPStorageProxiesDescription')}
          />
        </BAIFlex>
      ),
      // Reading the assignment needs superadmin (raw etcd), so only they see it.
      hidden: !baiClient.is_superadmin,
      render: (_value, record) => {
        const proxies = record.name
          ? (proxiesByGroupName[record.name] ?? [])
          : [];
        return proxies.length > 0 ? (
          <BAIFlex gap="xxs" wrap="wrap">
            {_.map(proxies, (proxy) => (
              <Token key={proxy} color="blue" label={proxy} />
            ))}
          </BAIFlex>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'scheduler',
      title: t('resourceGroup.Scheduler'),
      dataIndex: ['scheduler', 'type'],
      render: (value) => _.toUpper(value),
    },
    {
      key: 'wsproxy_addr',
      title: t('resourceGroup.AppProxyAddress'),
      dataIndex: ['network', 'wsproxyAddr'],
      render: (value) => value || '-',
    },
    {
      key: 'created_at',
      title: t('general.CreatedAt'),
      dataIndex: ['metadata', 'createdAt'],
      sortKey: 'createdAt',
      sorter: true,
      render: (value: string | null | undefined) =>
        value ? dayjs(value).format('lll') : '-',
    },
  ]);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" gap="sm" align="start" wrap="wrap">
        <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIRadioGroup
            value={activeType}
            onChange={(value) => {
              setActiveType(value.target.value);
              setTablePaginationOption({ current: 1 });
              setSelectedRowKeys([]);
            }}
            optionType="button"
            options={[
              {
                label: t('general.Active'),
                value: 'active',
              },
              {
                label: t('general.Inactive'),
                value: 'inactive',
              },
            ]}
          />
          <BAIGraphQLPropertyFilter<ResourceGroupFilter>
            singleCondition={!supportsSubFilter}
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('resourceGroup.Name'),
                type: 'string',
              },
              {
                key: 'description',
                propertyLabel: t('resourceGroup.Description'),
                type: 'string',
              },
              {
                key: 'isPublic',
                propertyLabel: t('resourceGroup.Public'),
                type: 'boolean',
              },
              {
                key: 'isDefault',
                propertyLabel: t('resourceGroup.Default'),
                type: 'boolean',
              },
            ]}
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setTablePaginationOption({ current: 1 });
              setSelectedRowKeys([]);
            }}
          />
        </BAIFlex>
        <BAIFlex gap="xs">
          {baiClient.is_superadmin && selectedRowKeys.length > 0 && (
            <BAIFlex align="center" gap="xs">
              <BAISelectionLabel
                count={selectedRowKeys.length}
                onClearSelection={() => setSelectedRowKeys([])}
              />
              {/* antd Tooltip + icon-only BAIButton → IconButton with its own
                  `tooltip` (ticket 15/18 idiom: never-disabled icon trigger). */}
              <IconButton
                icon={<SquarePenIcon style={{ color: token.colorInfo }} />}
                label={t('general.BulkEdit')}
                tooltip={t('general.BulkEdit')}
                onClick={() => setOpenSFTPModal(true)}
              />
            </BAIFlex>
          )}
          <BAIFetchKeyButton
            loading={isPendingRefetch || isRefetching}
            value={fetchKey}
            onChange={() => {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            onClick={() => openSettingModal()}
          >
            {t('resourceGroup.CreateResourceGroup')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>

      <BAITable
        scroll={{ x: 'max-content' }}
        rowKey={'name'}
        resizable
        size="small"
        columns={columns}
        dataSource={resourceGroups}
        loading={isRefetching}
        order={order}
        onChangeOrder={(newOrder) => {
          setOrder(newOrder ?? undefined);
          setTablePaginationOption({ current: 1 });
          setSelectedRowKeys([]);
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: adminResourceGroups?.count ?? 0,
          onChange: (current, pageSize) => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({ current, pageSize });
              setSelectedRowKeys([]);
            }
          },
        }}
        rowSelection={
          baiClient.is_superadmin
            ? {
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }
            : undefined
        }
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
      />

      <BAIDeleteConfirmModal
        open={!!selectedResourceGroupName}
        title={t('resourceGroup.DeleteResourceGroup')}
        target={t('general.ResourceGroup')}
        items={
          selectedResourceGroupName
            ? [
                {
                  key: selectedResourceGroupName,
                  label: selectedResourceGroupName,
                },
              ]
            : []
        }
        requireConfirmInput
        onOk={() => {
          commitDeleteResourceGroup({
            variables: {
              name: selectedResourceGroupName ?? '',
            },
            onCompleted: ({ delete_scaling_group: res }, errors) => {
              if (!res?.ok) {
                message.error(res?.msg);
                return;
              }
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
                return;
              }
              message.success(t('resourceGroup.ResourceGroupDeleted'));
              setSelectedResourceGroupName(undefined);
              startRefetchTransition(() => {
                updateFetchKey();
              });
            },
            onError: (err) => {
              message.error(err.message);
            },
          });
        }}
        okButtonProps={{ loading: isInflightCommitDeleteResourceGroup }}
        onCancel={() => {
          setSelectedResourceGroupName(undefined);
        }}
      />
      {infoModalName ? (
        <Suspense fallback={null}>
          <ResourceGroupInfoModalWithQuery
            resourceGroupName={infoModalName}
            open={openInfoModal}
            onRequestClose={() => {
              hideInfoModal();
              setInfoModalName(undefined);
            }}
          />
        </Suspense>
      ) : null}
      {settingModalName ? (
        <Suspense fallback={null}>
          <ResourceGroupSettingModalWithQuery
            resourceGroupName={settingModalName}
            open={openCreateModal}
            onRequestClose={closeSettingModal}
          />
        </Suspense>
      ) : (
        <ResourceGroupSettingModal
          open={openCreateModal}
          onRequestClose={closeSettingModal}
        />
      )}
      <BAIUnmountAfterClose>
        <UpdateResourceGroupsModal
          open={openSFTPModal}
          resourceGroupNames={selectedRowKeys as string[]}
          onRequestClose={(success) => {
            setOpenSFTPModal(false);
            if (success) {
              setSelectedRowKeys([]);
            }
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default ResourceGroupList;
