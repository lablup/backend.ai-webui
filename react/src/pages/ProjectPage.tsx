/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectAdminSettingModalQuery } from '../__generated__/ProjectAdminSettingModalQuery.graphql';
import { ProjectPageDeactivateMutation } from '../__generated__/ProjectPageDeactivateMutation.graphql';
import { ProjectPageModifyMutation } from '../__generated__/ProjectPageModifyMutation.graphql';
import { ProjectPagePurgeMutation } from '../__generated__/ProjectPagePurgeMutation.graphql';
import {
  ProjectPageQuery,
  ProjectPageQuery$data,
  ProjectPageQuery$variables,
} from '../__generated__/ProjectPageQuery.graphql';
import BAIRadioGroup from '../components/BAIRadioGroup';
import ProjectAdminSettingModal, {
  ProjectAdminSettingQuery,
} from '../components/ProjectAdminSettingModal';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useCSVExport } from '../hooks/useCSVExport';
import { DeleteFilled, SettingOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, theme, Tooltip } from 'antd';
import {
  availableProjectSorterValues,
  BAIButton,
  BAICard,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAINameActionCell,
  BAIProjectBulkEditModal,
  BAIProjectSettingModal,
  BAIProjectTable,
  BAIPropertyFilter,
  BAISelectionLabel,
  BAIUnmountAfterClose,
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  isValidUUID,
  mergeFilterValues,
  type ProjectInList,
  useBAILogger,
  useErrorMessageResolver,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { BanIcon, PlusIcon, ShieldUserIcon, UndoIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useMutation,
  useQueryLoader,
  useRelayEnvironment,
} from 'react-relay';

type ProjectNode = NonNullable<
  NonNullable<
    NonNullable<ProjectPageQuery$data['group_nodes']>['edges'][number]
  >['node']
>;

const ProjectPage = () => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const { getErrorMessage } = useErrorMessageResolver();
  const relayEnvironment = useRelayEnvironment();
  const baiClient = useSuspendedBackendaiClient();
  // RoleFilter.mappedScope (the role lookup this action relies on) exists
  // from manager 26.8.0; hide the action on older managers.
  const supportsProjectAdminSetting = baiClient.supports(
    'role-mapped-scope-filter',
  );
  const [openSettingModal, { toggle: toggleSettingModal }] = useToggle(false);
  const [openBulkEditModal, { toggle: toggleBulkEditModal }] = useToggle(false);
  const [selectedProjectList, setSelectedProjectList] = useState<ProjectNode[]>(
    [],
  );
  const [selectedProject, setSelectedProject] = useState<ProjectNode | null>(
    null,
  );
  const [purgingProject, setPurgingProject] = useState<ProjectInList | null>(
    null,
  );
  const [projectAdminModalProjectId, setProjectAdminModalProjectId] = useState<
    string | null
  >(null);
  const [projectAdminQueryRef, loadProjectAdminQuery] =
    useQueryLoader<ProjectAdminSettingModalQuery>(ProjectAdminSettingQuery);
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
      order: parseAsStringLiteral(availableProjectSorterValues),
      filter: parseAsString.withDefault(''),
      status: parseAsStringLiteral(['active', 'inactive']).withDefault(
        'active',
      ),
    },
    {
      history: 'replace',
    },
  );
  const [fetchKey, updateFetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { supportedFields, exportCSV } = useCSVExport('projects');

  const statusFilter =
    queryParams.status === 'active'
      ? 'is_active == true'
      : 'is_active == false';

  const queryVariables: ProjectPageQuery$variables = {
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.limit,
    order: queryParams.order || '-created_at',
    filter: mergeFilterValues([queryParams.filter, statusFilter]) || null,
  };

  const deferredValueQueryVariables = useDeferredValue(queryVariables);

  const { group_nodes } = useLazyLoadQuery<ProjectPageQuery>(
    graphql`
      query ProjectPageQuery(
        $filter: String
        $order: String
        $offset: Int
        $first: Int
        $before: String
        $after: String
        $last: Int
      ) {
        group_nodes(
          filter: $filter
          order: $order
          offset: $offset
          first: $first
          after: $after
          before: $before
          last: $last
        ) {
          count
          edges {
            node {
              id
              ...BAIProjectSettingModalFragment
              ...BAIProjectTableFragment
              ...BAIProjectBulkEditModalFragment
            }
          }
        }
      }
    `,
    deferredValueQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const [commitDeactivateGroup] = useMutation<ProjectPageDeactivateMutation>(
    graphql`
      mutation ProjectPageDeactivateMutation($gid: UUID!) {
        delete_group(gid: $gid) {
          msg
          ok
        }
      }
    `,
  );

  const [commitModifyGroup] = useMutation<ProjectPageModifyMutation>(graphql`
    mutation ProjectPageModifyMutation($gid: UUID!, $props: ModifyGroupInput!) {
      modify_group(gid: $gid, props: $props) {
        ok
        msg
      }
    }
  `);

  const [commitPurgeGroup] = useMutation<ProjectPagePurgeMutation>(graphql`
    mutation ProjectPagePurgeMutation($gid: UUID!) {
      purge_group(gid: $gid) {
        ok
        msg
      }
    }
  `);

  // Open the project admin setting modal with a preloaded query so the row
  // action button (not the modal) carries the initial loading state: the
  // click event awaits `fetchQuery` to warm the store, then `loadQuery`
  // resolves from it instantly.
  const openProjectAdminSettingModal = async (project: ProjectInList) => {
    if (!project.row_id) {
      return;
    }
    const variables: ProjectAdminSettingModalQuery['variables'] = {
      filter: {
        source: { equals: 'SYSTEM' },
        status: { equals: 'ACTIVE' },
        mappedScope: {
          scopeType: { equals: 'PROJECT' },
          scopeId: { equals: project.row_id },
        },
      },
      limit: 100,
      offset: 0,
    };
    let roleData: ProjectAdminSettingModalQuery['response'] | undefined;
    try {
      roleData = await fetchQuery<ProjectAdminSettingModalQuery>(
        relayEnvironment,
        ProjectAdminSettingQuery,
        variables,
      ).toPromise();
    } catch (error) {
      logger.error(error);
      message.error(
        error instanceof Error ? error.message : t('general.ErrorOccurred'),
      );
      return;
    }
    // The project admin role is resolved here, before the modal opens; a
    // project without one only gets an error message. The project scope
    // carries a member/admin SYSTEM role pair — the admin one is identified
    // by its name suffix.
    const hasProjectAdminRole = _.some(roleData?.adminRoles?.edges, (edge) =>
      _.endsWith(edge?.node?.name, 'admin'),
    );
    if (!hasProjectAdminRole) {
      message.error(
        t('project.ProjectAdminRoleNotFound', {
          project: project.name ?? project.row_id,
        }),
      );
      return;
    }
    loadProjectAdminQuery(variables, { fetchPolicy: 'store-or-network' });
    setProjectAdminModalProjectId(project.row_id);
  };

  const removeFromSelection = (projectId: string) => {
    setSelectedProjectList((prev) =>
      prev.filter((project) => project.id !== projectId),
    );
  };

  const handleDeactivateProject = (project: ProjectInList) =>
    new Promise<void>((resolve) => {
      if (!project.row_id) {
        resolve();
        return;
      }
      commitDeactivateGroup({
        variables: { gid: project.row_id },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            errors.forEach((error) => {
              message.error(
                getErrorMessage(error, t('project.FailedToDeactivateProject')),
              );
            });
            resolve();
            return;
          }
          if (response.delete_group?.ok) {
            message.success(t('project.ProjectDeactivated'));
            removeFromSelection(project.id);
            updateFetchKey();
          } else {
            message.error(
              response.delete_group?.msg ||
                t('project.FailedToDeactivateProject'),
            );
          }
          resolve();
        },
        onError: (error) => {
          message.error(
            error?.message || t('project.FailedToDeactivateProject'),
          );
          logger.error(error);
          resolve();
        },
      });
    });

  const handleRestoreProject = (project: ProjectInList) =>
    new Promise<void>((resolve) => {
      if (!project.row_id) {
        resolve();
        return;
      }
      commitModifyGroup({
        variables: {
          gid: project.row_id,
          props: { is_active: true },
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            errors.forEach((error) => {
              message.error(
                getErrorMessage(error, t('project.FailedToActivateProject')),
              );
            });
            resolve();
            return;
          }
          if (response.modify_group?.ok) {
            message.success(t('project.ProjectActivated'));
            removeFromSelection(project.id);
            updateFetchKey();
          } else {
            message.error(
              response.modify_group?.msg ||
                t('project.FailedToActivateProject'),
            );
          }
          resolve();
        },
        onError: (error) => {
          message.error(error?.message || t('project.FailedToActivateProject'));
          logger.error(error);
          resolve();
        },
      });
    });

  const handlePurgeProject = () =>
    new Promise<void>((resolve) => {
      if (!purgingProject?.row_id) {
        resolve();
        return;
      }
      const projectId = purgingProject.id;
      commitPurgeGroup({
        variables: { gid: purgingProject.row_id },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            errors.forEach((error) => {
              message.error(
                getErrorMessage(error, t('project.FailedToPurgeProject')),
              );
            });
            resolve();
            return;
          }
          if (response.purge_group?.ok) {
            message.success(t('project.ProjectPurged'));
            removeFromSelection(projectId);
            setPurgingProject(null);
            updateFetchKey();
          } else {
            message.error(
              response.purge_group?.msg || t('project.FailedToPurgeProject'),
            );
          }
          resolve();
        },
        onError: (error) => {
          message.error(error?.message || t('project.FailedToPurgeProject'));
          logger.error(error);
          resolve();
        },
      });
    });

  return (
    <BAICard
      activeTabKey="projects"
      tabList={[{ key: 'projects', label: t('webui.menu.Projects') }]}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="between" align="start" wrap="wrap" gap="xs">
          <BAIFlex direction="row" gap="sm" align="start" wrap="wrap">
            <BAIRadioGroup
              value={queryParams.status}
              onChange={(e) => {
                setQueryParams({ status: e.target.value });
                setTablePaginationOption({ current: 1 });
                setSelectedProjectList([]);
              }}
              optionType="button"
              options={[
                { label: t('general.Active'), value: 'active' },
                { label: t('general.Inactive'), value: 'inactive' },
              ]}
            />
            <BAIPropertyFilter
              filterProperties={[
                {
                  key: 'name',
                  propertyLabel: t('project.Name'),
                  type: 'string',
                },
                {
                  key: 'domain_name',
                  propertyLabel: t('project.Domain'),
                  type: 'string',
                },
                {
                  key: 'resource_policy',
                  propertyLabel: t('project.ResourcePolicy'),
                  type: 'string',
                },
                {
                  key: 'id',
                  propertyLabel: t('project.ProjectID'),
                  type: 'string',
                  defaultOperator: '==',
                  rule: {
                    message: t('project.ProjectIDFilterRuleMessage'),
                    validate: (value) => isValidUUID(value),
                  },
                },
              ]}
              value={queryParams.filter}
              onChange={(filter) => {
                setQueryParams({ filter: filter || '' });
                setSelectedProjectList([]);
              }}
            />
          </BAIFlex>
          <BAIFlex gap="xs">
            {selectedProjectList.length > 0 && (
              <>
                <BAISelectionLabel
                  count={selectedProjectList.length}
                  onClearSelection={() => setSelectedProjectList([])}
                />
                <Tooltip title={t('project.BulkEdit')}>
                  <BAIButton
                    icon={
                      <SettingOutlined style={{ color: token.colorInfo }} />
                    }
                    style={{ backgroundColor: token.colorInfoBg }}
                    onClick={toggleBulkEditModal}
                  />
                </Tooltip>
              </>
            )}
            <BAIFetchKeyButton
              value={fetchKey}
              autoUpdateDelay={null}
              loading={deferredFetchKey !== fetchKey}
              onChange={() => {
                updateFetchKey();
              }}
            />
            <BAIButton
              type="primary"
              icon={<PlusIcon />}
              onClick={toggleSettingModal}
            >
              {t('project.CreateProject')}
            </BAIButton>
          </BAIFlex>
        </BAIFlex>
        <BAIProjectTable
          projectFragment={filterOutEmpty(
            group_nodes?.edges.map((e) => e?.node) ?? [],
          )}
          loading={
            deferredFetchKey !== fetchKey ||
            deferredValueQueryVariables !== queryVariables
          }
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: group_nodes?.count ?? 0,
            onChange: (current, pageSize) => {
              if (_.isNumber(pageSize) && _.isNumber(current)) {
                setTablePaginationOption({ current, pageSize });
                setSelectedProjectList([]);
              }
            },
          }}
          order={queryParams.order}
          onChangeOrder={(order) => {
            setQueryParams({ order });
          }}
          customizeColumns={(columns) =>
            columns.map((col) =>
              col.key === 'name'
                ? {
                    ...col,
                    render: (_name: string, record: ProjectInList) => {
                      const isModelStore = record.type === 'MODEL_STORE';
                      return (
                        <BAINameActionCell
                          title={record.name}
                          showActions="always"
                          actions={[
                            ...(supportsProjectAdminSetting
                              ? [
                                  {
                                    key: 'set-project-admin',
                                    title: t('project.SetProjectAdmin'),
                                    icon: <ShieldUserIcon />,
                                    disabled: isModelStore,
                                    action: () =>
                                      openProjectAdminSettingModal(record),
                                  },
                                ]
                              : []),
                            {
                              key: 'edit',
                              title: t('project.EditProject'),
                              icon: <SettingOutlined />,
                              disabled: isModelStore,
                              onClick: () => {
                                const node = group_nodes?.edges.find(
                                  (edge) => edge?.node?.id === record.id,
                                )?.node;
                                if (node) {
                                  setSelectedProject(node);
                                  toggleSettingModal();
                                }
                              },
                            },
                            ...(record.is_active
                              ? [
                                  {
                                    key: 'deactivate',
                                    title: t('project.Deactivate'),
                                    icon: <BanIcon />,
                                    type: 'danger' as const,
                                    disabled: isModelStore,
                                    popConfirm: {
                                      title: t('project.DeactivateProject'),
                                      description: record.name,
                                      okButtonProps: { danger: true },
                                      okText: t('project.Deactivate'),
                                      onConfirm: () =>
                                        handleDeactivateProject(record),
                                    },
                                  },
                                ]
                              : [
                                  {
                                    key: 'activate',
                                    title: t('project.Activate'),
                                    icon: <UndoIcon />,
                                    disabled: isModelStore,
                                    popConfirm: {
                                      title: t('project.ActivateProject'),
                                      description: record.name,
                                      okText: t('project.Activate'),
                                      onConfirm: () =>
                                        handleRestoreProject(record),
                                    },
                                  },
                                  {
                                    key: 'purge',
                                    title: t('project.Purge'),
                                    icon: <DeleteFilled />,
                                    type: 'danger' as const,
                                    disabled: isModelStore,
                                    onClick: () => {
                                      setPurgingProject(record);
                                    },
                                  },
                                ]),
                          ]}
                        />
                      );
                    },
                  }
                : col,
            )
          }
          exportSettings={
            !_.isEmpty(supportedFields)
              ? {
                  supportedFields,
                  onExport: async (selectedExportKeys) => {
                    await exportCSV(selectedExportKeys).catch((err) => {
                      message.error(t('general.ErrorOccurred'));
                      logger.error(err);
                    });
                  },
                }
              : undefined
          }
          rowSelection={{
            type: 'checkbox',
            onChange: (keys) => {
              if (!group_nodes) {
                return;
              }
              setSelectedProjectList(
                _.filter(
                  _.compact(_.map(group_nodes.edges, (e) => e?.node)),
                  (node) => keys.includes(node.id),
                ),
              );
            },
            selectedRowKeys: _.map(selectedProjectList, 'id'),
            getCheckboxProps: (record) => ({
              disabled: _.get(record, 'type') === 'MODEL_STORE',
            }),
          }}
        />
        <BAIProjectSettingModal
          open={openSettingModal}
          onOk={() => {
            updateFetchKey();
            toggleSettingModal();
            setSelectedProject(null);
          }}
          onCancel={() => {
            toggleSettingModal();
            setSelectedProject(null);
          }}
          projectFragment={selectedProject}
        />
        <BAIProjectBulkEditModal
          open={openBulkEditModal}
          selectedProjectFragments={selectedProjectList}
          onOk={() => {
            updateFetchKey();
            toggleBulkEditModal();
            setSelectedProjectList([]);
          }}
          onCancel={() => {
            toggleBulkEditModal();
          }}
        />
        {projectAdminQueryRef != null && (
          <BAIUnmountAfterClose>
            <ProjectAdminSettingModal
              open={!!projectAdminModalProjectId}
              queryRef={projectAdminQueryRef}
              projectId={projectAdminModalProjectId ?? ''}
              onReload={loadProjectAdminQuery}
              onCancel={() => setProjectAdminModalProjectId(null)}
            />
          </BAIUnmountAfterClose>
        )}
        <BAIDeleteConfirmModal
          open={!!purgingProject}
          title={t('project.PurgeProject')}
          target={t('general.Project')}
          items={
            purgingProject
              ? [{ key: purgingProject.id, label: purgingProject.name ?? '' }]
              : []
          }
          confirmText={purgingProject?.name ?? ''}
          requireConfirmInput
          inputProps={{
            placeholder: purgingProject?.name ?? '',
          }}
          okText={t('project.Purge')}
          onOk={handlePurgeProject}
          onCancel={() => setPurgingProject(null)}
        />
      </BAIFlex>
    </BAICard>
  );
};

export default ProjectPage;
