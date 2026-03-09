/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PlusOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App } from 'antd';
import {
  availableProjectSorterValues,
  BAIButton,
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIProjectBulkEditModal,
  BAIProjectSettingModal,
  BAIProjectTable,
  BAIPropertyFilter,
  BAIText,
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  isValidUUID,
  useBAILogger,
  useUpdatableState,
} from 'backend.ai-ui';
import _ from 'lodash';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  ProjectPageQuery,
  ProjectPageQuery$data,
  ProjectPageQuery$variables,
} from 'src/__generated__/ProjectPageQuery.graphql';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';
import { useCSVExport } from 'src/hooks/useCSVExport';

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
  const [openSettingModal, { toggle: toggleSettingModal }] = useToggle(false);
  const [openBulkEditModal, { toggle: toggleBulkEditModal }] = useToggle(false);
  const [selectedProjectList, setSelectedProjectList] = useState<ProjectNode[]>(
    [],
  );
  const [selectedProject, setSelectedProject] = useState<ProjectNode | null>(
    null,
  );
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
    },
    {
      history: 'replace',
    },
  );
  const [fetchKey, updateFetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { supportedFields, exportCSV } = useCSVExport('projects');

  const queryVariables: ProjectPageQuery$variables = {
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.limit,
    order: queryParams.order || '-created_at',
    filter: queryParams.filter || null,
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
  return (
    <BAICard
      activeTabKey="project"
      tabList={[
        {
          key: 'project',
          tab: t('project.Project'),
        },
      ]}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="between" wrap="wrap" gap="sm">
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
                key: 'is_active',
                propertyLabel: t('project.Active'),
                type: 'boolean',
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
          <BAIFlex gap="xs">
            {selectedProjectList.length > 0 && (
              <>
                <BAIText>
                  {t('general.NSelected', {
                    count: selectedProjectList.length,
                  })}
                </BAIText>
                <BAIButton onClick={toggleBulkEditModal}>
                  {t('project.BulkEdit')}
                </BAIButton>
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
              icon={<PlusOutlined />}
              onClick={toggleSettingModal}
            >
              {t('project.CreateProject')}
            </BAIButton>
          </BAIFlex>
        </BAIFlex>
        <BAIProjectTable
          updateFetchKey={updateFetchKey}
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
          onClickProjectEditButton={(project) => {
            group_nodes?.edges.forEach((edge) => {
              if (edge?.node?.id === project.id) {
                setSelectedProject(edge.node);
                toggleSettingModal();
              }
            });
          }}
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
                _.chain(group_nodes.edges)
                  .map((e) => e?.node)
                  .compact()
                  .filter((node) => keys.includes(node.id))
                  .value(),
              );
            },
            selectedRowKeys: _.map(selectedProjectList, 'id'),
            getCheckboxProps: (record) => ({
              disabled: _.get(record, 'type') === 'MODEL_STORE',
            }),
          }}
        />
      </BAIFlex>
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
    </BAICard>
  );
};

export default ProjectPage;
