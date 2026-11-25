/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ContainerRegistryListCreateDomainRegistryRelationMutation } from '../../../__generated__/ContainerRegistryListCreateDomainRegistryRelationMutation.graphql';
import { ContainerRegistryListEditingRegistryQuery } from '../../../__generated__/ContainerRegistryListEditingRegistryQuery.graphql';
import { ContainerRegistryListPurgeDomainRegistryRelationMutation } from '../../../__generated__/ContainerRegistryListPurgeDomainRegistryRelationMutation.graphql';
import { ContainerRegistryListPurgeMutation } from '../../../__generated__/ContainerRegistryListPurgeMutation.graphql';
import {
  ContainerRegistryListQuery,
  ContainerRegistryListQuery$data,
  ContainerRegistryV2Filter,
  ContainerRegistryV2OrderBy,
} from '../../../__generated__/ContainerRegistryListQuery.graphql';
import { App } from '../../../app-shim';
import ContainerRegistryEditorModal, {
  toLegacyRegistryType,
} from '../../../components/ContainerRegistryEditorModal';
import TableColumnsSettingModal from '../../../components/TableColumnsSettingModal';
import { convertToOrderBy } from '../../../helper';
import { useSuspendedBackendaiClient } from '../../../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../../../hooks/reactPaginationQueryOptions';
import { useSetBAINotification } from '../../../hooks/useBAINotification';
import { useHiddenColumnKeysSetting } from '../../../hooks/useHiddenColumnKeysSetting';
import { usePainKiller } from '../../../hooks/usePainKiller';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Token } from '@lablup/ui-common/Token';
import {
  BAITokenRow,
  BAIDeleteConfirmModal,
  BAIFlex,
  BAINameActionCell,
  BAIGraphQLPropertyFilter,
  BAITable,
  BAIBooleanToken,
  INITIAL_FETCH_KEY,
  filterOutNullAndUndefined,
  toGlobalId,
  type BAIColumnType,
  type BAIColumnsType,
  useBAILogger,
  useFetchKey,
  useToggle,
  BAISwitch,
  useErrorMessageResolver,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  Trash2,
  RotateCw,
  Settings,
  RefreshCw,
  PlusIcon,
  SquarePenIcon,
} from 'lucide-react';
import { parseAsJson, parseAsString, useQueryStates } from 'nuqs';
import React, { Suspense, useState, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

/** How many allowed projects a row shows before the "and N more" indicator; also the `first:` on `projects`. */
const ALLOWED_PROJECT_PREVIEW_COUNT = 3;

/** Columns that restate what another column already says: off until asked for. */
const DEFAULT_HIDDEN_REGISTRY_COLUMN_KEYS = ['is_global'];

export type ContainerRegistry = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<ContainerRegistryListQuery$data>['adminContainerRegistriesV2']
    >['edges'][number]
  >['node']
>;

type EditorModalProps = Omit<
  React.ComponentProps<typeof ContainerRegistryEditorModal>,
  'containerRegistryFrgmt'
>;

/** The editor still saves through the legacy node, so it loads that node for the V2 row being edited. */
const EditingRegistryModal: React.FC<
  EditorModalProps & { entityId: string }
> = ({ entityId, ...modalProps }) => {
  'use memo';
  const { container_registry_node } =
    useLazyLoadQuery<ContainerRegistryListEditingRegistryQuery>(
      graphql`
        query ContainerRegistryListEditingRegistryQuery($id: String!) {
          container_registry_node(id: $id) {
            ...ContainerRegistryEditorModalFragment
          }
        }
      `,
      { id: toGlobalId('ContainerRegistryNode', entityId) },
      { fetchPolicy: 'network-only' },
    );
  return (
    <ContainerRegistryEditorModal
      containerRegistryFrgmt={container_registry_node}
      {...modalProps}
    />
  );
};

const ContainerRegistryList: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  'use memo';
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const painKiller = usePainKiller();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const { upsertNotification } = useSetBAINotification();
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      filter: parseAsJson<ContainerRegistryV2Filter>(
        (value) => value as ContainerRegistryV2Filter,
      ),
      order: parseAsString,
    },
    { history: 'replace' },
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 20,
  });

  const queryVariables = {
    domain: baiClient._config.domainName,
    filter: queryParams.filter,
    orderBy:
      convertToOrderBy<ContainerRegistryV2OrderBy>(queryParams.order) ?? null,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    allowedProjectPreviewCount: ALLOWED_PROJECT_PREVIEW_COUNT,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { adminContainerRegistriesV2 } =
    useLazyLoadQuery<ContainerRegistryListQuery>(
      graphql`
        query ContainerRegistryListQuery(
          $domain: String!
          $filter: ContainerRegistryV2Filter
          $orderBy: [ContainerRegistryV2OrderBy!]
          $limit: Int
          $offset: Int
          $allowedProjectPreviewCount: Int
        ) {
          adminContainerRegistriesV2(
            filter: $filter
            orderBy: $orderBy
            limit: $limit
            offset: $offset
          ) {
            count
            edges {
              node {
                id
                entityId
                registryName
                url
                type
                project
                username
                password
                isGlobal
                # Enabled = related to the current domain.
                currentDomain: domains(filter: { name: { equals: $domain } }) {
                  count
                }
                projects(first: $allowedProjectPreviewCount) {
                  count
                  edges {
                    node {
                      id
                      basicInfo {
                        name
                      }
                    }
                  }
                }
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
  const containerRegistries = _.map(adminContainerRegistriesV2?.edges, 'node');

  const [commitPurgeMutation, isInFlightPurgeMutation] =
    useMutation<ContainerRegistryListPurgeMutation>(graphql`
      mutation ContainerRegistryListPurgeMutation($id: UUID!) {
        adminPurgeContainerRegistryV2(id: $id) {
          purgedId
        }
      }
    `);

  const [commitCreateRelationMutation, isInFlightCreateRelationMutation] =
    useMutation<ContainerRegistryListCreateDomainRegistryRelationMutation>(
      graphql`
        mutation ContainerRegistryListCreateDomainRegistryRelationMutation(
          $domainId: UUID!
          $containerRegistryId: UUID!
        ) {
          createDomainContainerRegistryRelations(
            input: {
              items: [
                {
                  domainId: $domainId
                  containerRegistryId: $containerRegistryId
                }
              ]
            }
          ) {
            items {
              domainId
              containerRegistryId
            }
          }
        }
      `,
    );

  const [commitPurgeRelationMutation, isInFlightPurgeRelationMutation] =
    useMutation<ContainerRegistryListPurgeDomainRegistryRelationMutation>(
      graphql`
        mutation ContainerRegistryListPurgeDomainRegistryRelationMutation(
          $domainId: UUID!
          $containerRegistryId: UUID!
        ) {
          purgeDomainContainerRegistryRelations(
            input: {
              items: [
                {
                  domainId: $domainId
                  containerRegistryId: $containerRegistryId
                }
              ]
            }
          ) {
            items {
              domainId
              containerRegistryId
            }
          }
        }
      `,
    );

  const { t } = useTranslation();
  const [editingRegistry, setEditingRegistry] =
    useState<ContainerRegistry | null>();
  const [deletingRegistry, setDeletingRegistry] =
    useState<ContainerRegistry | null>();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [inFlightRowKey, setInFlightRowKey] = useState<string>();

  const editorModalProps: EditorModalProps = {
    open: !!editingRegistry || isNewModalOpen,
    // The table reads V2 records, which the legacy save does not patch.
    onOk: (type) => {
      message.success({
        key: type === 'create' ? 'registry-added' : 'registry-modified',
        content:
          type === 'create'
            ? t('registry.RegistrySuccessfullyAdded')
            : t('registry.RegistrySuccessfullyModified'),
      });
      updateFetchKey();
      setEditingRegistry(null);
      setIsNewModalOpen(false);
    },
    onCancel: () => {
      setEditingRegistry(null);
      setIsNewModalOpen(false);
    },
    centered: false,
  };

  const rescanImage = async (
    registry_name: string,
    project: string | undefined | null,
  ) => {
    const notiKey = upsertNotification({
      message: `${t('maintenance.RescanImages')}: ${registry_name}${project ? `/${project}` : ''}`,
      description: t('registry.UpdatingRegistryInfo'),
      open: true,
      backgroundTask: {
        status: 'pending',
      },
      duration: 0,
    });
    const handleReScanError = (err: any) => {
      logger.error(err);
      upsertNotification({
        key: notiKey,
        backgroundTask: {
          status: 'rejected',
        },
        duration: 1,
      });
      if (err && err.message) {
        document.dispatchEvent(
          new CustomEvent('add-bai-notification', {
            detail: {
              open: true,
              type: 'error',
              message: painKiller.relieve(err.title),
              description: err.message,
            },
          }),
        );
      }
    };
    baiClient.maintenance
      .rescan_images(registry_name, project ?? undefined)
      .then(({ rescan_images }: any) => {
        if (rescan_images.ok) {
          upsertNotification({
            key: notiKey,
            backgroundTask: {
              status: 'pending',
              percent: 0,
              taskId: rescan_images.task_id,
              onChange: {
                pending: t('registry.RescanImages'),
                resolved: t('registry.RegistryUpdateFinished'),
                rejected: t('registry.RegistryUpdateFailed'),
              },
            },
          });
        } else {
          upsertNotification({
            key: notiKey,
            backgroundTask: {
              status: 'rejected',
            },
            duration: 1,
          });
        }
      })
      .catch(handleReScanError);
  };

  const enabledColumn: BAIColumnType<ContainerRegistry> = {
    key: 'enabled',
    title: t('general.Enabled'),
    render: (_value, record) => {
      const isEnabled = (record.currentDomain?.count ?? 0) > 0;
      const isInFlightRelationMutation =
        isInFlightCreateRelationMutation || isInFlightPurgeRelationMutation;
      return (
        // antd Switch checked/loading/disabled -> Astryx Switch
        // value/isLoading/isDisabled; `label` is required, hidden here
        // because the column header already names the control (P2).
        <BAISwitch
          aria-label={t('general.Enabled')}
          value={
            inFlightRowKey === record.id + deferredFetchKey
              ? !isEnabled
              : isEnabled
          }
          disabled={deferredFetchKey !== fetchKey || isInFlightRelationMutation}
          isLoading={
            (deferredFetchKey !== fetchKey || isInFlightRelationMutation) &&
            inFlightRowKey === record.id + deferredFetchKey
          }
          onChange={(isOn) => {
            setInFlightRowKey(record.id + deferredFetchKey);
            (isOn ? commitCreateRelationMutation : commitPurgeRelationMutation)(
              {
                variables: {
                  domainId: baiClient._config.domainId,
                  containerRegistryId: record.entityId,
                },
                onCompleted: (_res, errors) => {
                  if (errors && errors?.length > 0) {
                    const errorMsgList = _.map(
                      errors,
                      (error) => error.message,
                    );
                    for (const error of errorMsgList) {
                      message.error(error);
                    }
                  } else {
                    message.success({
                      key: 'registry-enabled',
                      content: isOn
                        ? t('registry.RegistryTurnedOn')
                        : t('registry.RegistryTurnedOff'),
                    });
                  }
                  // The refetch also recovers the optimistically-toggled
                  // switch when the manager returned GraphQL errors.
                  updateFetchKey();
                },
                onError: (error) => {
                  message.error(getErrorMessage(error));
                  updateFetchKey();
                },
              },
            );
          }}
        />
      );
    },
  };

  const columns: BAIColumnsType<ContainerRegistry> = [
    {
      key: 'registry_name',
      title: t('registry.RegistryName'),
      dataIndex: 'registryName',
      sorter: true,
      fixed: 'left',
      render: (name: string, record) => (
        <BAINameActionCell
          title={name}
          showActions="always"
          actions={[
            {
              key: 'edit',
              title: t('button.Edit'),
              icon: <SquarePenIcon />,
              onClick: () => {
                setEditingRegistry(record);
              },
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <Trash2 size="1em" />,
              type: 'danger',
              onClick: () => {
                setDeletingRegistry(record);
              },
            },
            {
              key: 'rescan',
              title: t('maintenance.RescanImages'),
              icon: <RefreshCw size="1em" />,
              onClick: () => {
                rescanImage(record.registryName, record.project);
              },
            },
          ]}
        />
      ),
    },
    {
      key: 'url',
      title: t('registry.RegistryURL'),
      dataIndex: 'url',
    },
    {
      key: 'type',
      title: t('registry.Type'),
      dataIndex: 'type',
      render: (value: string) => toLegacyRegistryType(value),
    },
    {
      key: 'project',
      title: t('registry.Project'),
      dataIndex: 'project',
      render: (value) => {
        return value ? <Token key={value} label={value} /> : null;
      },
    },
    {
      key: 'username',
      title: t('registry.Username'),
      dataIndex: 'username',
    },
    {
      key: 'password',
      title: t('registry.Password'),
      dataIndex: 'password',
    },
    {
      key: 'is_global',
      title: t('registry.Global'),
      dataIndex: 'isGlobal',
      render: (value) => <BAIBooleanToken value={value} />,
    },
    {
      key: 'allowed_groups',
      title: t('registry.AllowedProjects'),
      render: (_value, record) => {
        // A global registry is open to every project and has no relation rows.
        if (record.isGlobal) {
          return t('environment.AllProjects');
        }
        const projects = filterOutNullAndUndefined(
          _.map(record.projects?.edges, (edge) => edge?.node),
        );
        return (
          <BAITokenRow
            items={_.map(projects, (project) => ({
              key: project.id,
              label: project.basicInfo.name,
            }))}
            maxCount={ALLOWED_PROJECT_PREVIEW_COUNT}
            totalCount={record.projects?.count ?? undefined}
          />
        );
      },
    },
    enabledColumn,
  ];

  const [storedHiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('ContainerRegistryList');
  // The setting is only seeded once the user opens the column settings, so an
  // untouched account gets the defaults rather than every column at once.
  const hiddenColumnKeys =
    storedHiddenColumnKeys ?? DEFAULT_HIDDEN_REGISTRY_COLUMN_KEYS;

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      style={{
        flex: 1,
        ...style,
        // height: 'calc(100vh - 183px)',
      }}
    >
      <BAIFlex
        direction="row"
        justify="between"
        gap={'sm'}
        align="start"
        wrap="wrap"
      >
        <BAIGraphQLPropertyFilter<ContainerRegistryV2Filter>
          filterProperties={[
            {
              key: 'registryName',
              propertyLabel: t('registry.RegistryName'),
              type: 'string',
            },
          ]}
          value={queryParams.filter ?? undefined}
          onChange={(value) => {
            setQueryParams({ filter: value ?? null });
          }}
        />
        <BAIFlex gap="xs">
          <IconButton
            label={t('button.Refresh')}
            tooltip={t('button.Refresh')}
            isLoading={deferredFetchKey !== fetchKey}
            icon={<RotateCw size="1em" />}
            onClick={() => {
              updateFetchKey();
            }}
          />
          <Button
            variant="primary"
            icon={<PlusIcon />}
            label={t('registry.AddRegistry')}
            onClick={() => {
              setIsNewModalOpen(true);
            }}
          />
        </BAIFlex>
      </BAIFlex>
      <BAITable
        scroll={{ x: 'max-content' }}
        rowKey={(record) => record.id}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: adminContainerRegistriesV2?.count ?? 0,
          current: tablePaginationOption.current,
          onChange(current, pageSize) {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
          },
          extraContent: (
            <IconButton
              variant="ghost"
              icon={<Settings size="1em" />}
              label={t('table.SettingTable')}
              onClick={() => {
                toggleColumnSettingModal();
              }}
            />
          ),
        }}
        onChangeOrder={(order) => {
          setQueryParams({ order: order ?? null });
        }}
        loading={
          deferredQueryVariables !== queryVariables ||
          deferredFetchKey !== fetchKey
        }
        dataSource={filterOutNullAndUndefined(containerRegistries)}
        columns={
          _.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
          ) as BAIColumnType<ContainerRegistry>[]
        }
      />
      {editingRegistry ? (
        <Suspense fallback={null}>
          <BAIUnmountAfterClose>
            <EditingRegistryModal
              entityId={editingRegistry.entityId}
              {...editorModalProps}
            />
          </BAIUnmountAfterClose>
        </Suspense>
      ) : (
        <BAIUnmountAfterClose>
          <ContainerRegistryEditorModal {...editorModalProps} />
        </BAIUnmountAfterClose>
      )}
      <BAIDeleteConfirmModal
        open={!!deletingRegistry}
        title={t('dialog.title.DeleteSomething', {
          name: deletingRegistry?.registryName,
        })}
        target={t('general.ContainerRegistry')}
        items={
          deletingRegistry
            ? [
                {
                  key: deletingRegistry.id,
                  label: deletingRegistry.registryName,
                },
              ]
            : []
        }
        confirmText={deletingRegistry?.registryName ?? ''}
        requireConfirmInput
        confirmLoading={isInFlightPurgeMutation}
        onOk={() => {
          if (deletingRegistry) {
            commitPurgeMutation({
              variables: {
                id: deletingRegistry.entityId,
              },
              onCompleted: (_res, error) => {
                if (error) {
                  setDeletingRegistry(null);
                  message.error({
                    key: 'registry-deletion-failed',
                    content: t('dialog.ErrorOccurred'),
                  });
                } else {
                  updateFetchKey();
                  message.success({
                    key: 'registry-deleted',
                    content: t('registry.RegistrySuccessfullyDeleted'),
                  });
                  setDeletingRegistry(null);
                }
              },
              onError: () => {
                message.error({
                  key: 'registry-deletion-failed',
                  content: t('dialog.ErrorOccurred'),
                });
              },
            });
          } else {
            setDeletingRegistry(null);
          }
        }}
        onCancel={() => {
          setDeletingRegistry(null);
        }}
      />
      <TableColumnsSettingModal
        open={visibleColumnSettingModal}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setHiddenColumnKeys(
              _.difference(
                columns.map((column) => _.toString(column.key)),
                values?.selectedColumnKeys,
              ),
            );
          toggleColumnSettingModal();
        }}
        columns={columns}
        hiddenColumnKeys={hiddenColumnKeys}
      />
    </BAIFlex>
  );
};

export default ContainerRegistryList;
