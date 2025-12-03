import {
  availableProjectSorterValues,
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIProjectTable,
  BAIPropertyFilter,
  filterOutEmpty,
} from 'backend.ai-ui';
import _ from 'lodash';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  ProjectPageQuery,
  ProjectPageQuery$variables,
} from 'src/__generated__/ProjectPageQuery.graphql';
import { INITIAL_FETCH_KEY, useUpdatableState } from 'src/hooks';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';

const ProjectPage = () => {
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
      order: parseAsStringLiteral(availableProjectSorterValues).withDefault(
        '-created_at',
      ),
      filter: parseAsString.withDefault(''),
    },
    {
      history: 'replace',
    },
  );
  const [fetchKey, updateFetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryVariables: ProjectPageQuery$variables = {
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.limit,
    order: queryParams.order,
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
              ...BAIProjectTableFragment
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
              },
            ]}
            value={queryParams.filter}
            onChange={(filter) => {
              setQueryParams({ filter: filter || '' });
            }}
          />
          <BAIFlex>
            <BAIFetchKeyButton
              value={fetchKey}
              autoUpdateDelay={10_000}
              loading={deferredFetchKey !== fetchKey}
              onChange={() => {
                updateFetchKey();
              }}
            />
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
              if (_.isNumber(pageSize) && _.isNumber(current))
                setTablePaginationOption({ current, pageSize });
            },
          }}
          sortDirections={['ascend', 'descend', 'ascend']}
          order={queryParams.order}
          onChangeOrder={(order) => {
            setQueryParams({ order });
          }}
          onEditProject={(_project) => {}}
        />
      </BAIFlex>
    </BAICard>
  );
};

export default ProjectPage;
