import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
import { SettingOutlined } from '@ant-design/icons';
import { Button, theme, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIResourceNumberWithIcon,
  BAITable,
  BAITableProps,
  BAIUnmountAfterClose,
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  toFixedFloorWithoutTrailingZeros,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useDeferredValue, useState, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  ProjectFairShareOrderBy,
  ProjectFairShareTableQuery,
  ProjectFairShareTableQuery$variables,
} from 'src/__generated__/ProjectFairShareTableQuery.graphql';
import { convertToOrderBy } from 'src/helper';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';

type ProjectFairShare = NonNullable<
  ProjectFairShareTableQuery['response']
>['projectFairShares']['edges'][number]['node'];

const availableProjectFairShareSorterKeys = [] as const;
const availableProjectFairShareSorterValues = [
  ...availableProjectFairShareSorterKeys,
  ...availableProjectFairShareSorterKeys.map((key) => `-${key}`),
] as const;
const isEnableSorter = (key: string) => {
  return _.includes(availableProjectFairShareSorterValues, key);
};

interface ProjectFairShareTableProps extends BAITableProps<ProjectFairShare> {
  resourceGroupName: string;
  domainName: string;
  onClickProjectName: (id: string) => void;
}

const ProjectFairShareTable: React.FC<ProjectFairShareTableProps> = ({
  resourceGroupName,
  domainName,
  // onClickProjectName,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProjectIdList, setSelectedProjectIdList] = useState<string[]>(
    [],
  );
  const [openWeightSettingModal, setOpenWeightSettingModal] = useState(false);
  const [openBulkWeightSettingModal, setOpenBulkWeightSettingModal] =
    useState(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  // const resourceGroupNameFilter: ProjectFairShareTableQuery$variables['filter'] =
  //   resourceGroupName ? { resourceGroup: { equals: resourceGroupName } } : {};
  // const domainNameFilter: ProjectFairShareTableQuery$variables['filter'] =
  //   domainName ? { domainName: { equals: domainName } } : {};
  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableProjectFairShareSorterValues),
      filter: parseAsString,
    },
    { history: 'replace' },
  );
  const queryVariables: ProjectFairShareTableQuery$variables = {
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.limit,
    orderBy: convertToOrderBy<ProjectFairShareOrderBy>(queryParams.order) || [
      { field: 'FAIR_SHARE_FACTOR', direction: 'ASC' },
    ],
    filter: {
      // FIXME: server error (empty response) occurs when both filters are applied.
      // ...resourceGroupNameFilter,
      // ...domainNameFilter,
      ...(JSON.parse(
        queryParams.filter || '{}',
      ) as ProjectFairShareTableQuery$variables['filter']),
    },
  };
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { projectFairShares } = useLazyLoadQuery<ProjectFairShareTableQuery>(
    graphql`
      query ProjectFairShareTableQuery(
        $filter: ProjectFairShareFilter
        $orderBy: [ProjectFairShareOrderBy!]
        $offset: Int
        $limit: Int
      ) {
        projectFairShares(
          filter: $filter
          orderBy: $orderBy
          offset: $offset
          limit: $limit
        ) {
          count
          edges {
            node {
              id
              projectId
              spec {
                weight
              }
              calculationSnapshot {
                fairShareFactor
                totalDecayedUsage {
                  entries {
                    resourceType
                    quantity
                  }
                }
              }
              createdAt
              updatedAt
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

  const columns: ColumnsType<ProjectFairShare> = [
    {
      // FIXME: show project name instead of project ID
      key: 'projectId',
      title: t('fairShare.Name'),
      dataIndex: 'projectId',
      fixed: 'left',
    },
    {
      key: 'control',
      title: t('general.Control'),
      fixed: 'left',
      render: (_text, record) => (
        <BAIFlex direction="row" gap="xxs">
          <Button
            type="text"
            icon={<SettingOutlined style={{ color: token.colorInfo }} />}
            onClick={() => {
              setSelectedProjectId(record?.projectId);
              setOpenWeightSettingModal(true);
            }}
          />
        </BAIFlex>
      ),
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.Weight')}
          <QuestionIconWithTooltip title={t('fairShare.WeightDescription')} />
        </BAIFlex>
      ),
      key: 'weight',
      dataIndex: ['spec', 'weight'],
      render: (weight) =>
        weight ? toFixedFloorWithoutTrailingZeros(weight, 1) : '-',
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.FairShareFactor')}
          <QuestionIconWithTooltip
            title={t('fairShare.FairShareFactorDescription')}
          />
        </BAIFlex>
      ),
      key: 'fairShareFactor',
      dataIndex: ['calculationSnapshot', 'fairShareFactor'],
      sorter: isEnableSorter('fairShareFactor'),
      render: (fairShareFactor) =>
        fairShareFactor !== null && fairShareFactor !== undefined
          ? toFixedFloorWithoutTrailingZeros(fairShareFactor, 2)
          : '-',
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.TotalUsage')}
          <QuestionIconWithTooltip
            title={t('fairShare.TotalUsageDescription')}
          />
        </BAIFlex>
      ),
      key: 'totalUsage',
      dataIndex: ['calculationSnapshot', 'totalDecayedUsage', 'entries'],
      render: (entries) => {
        return _.isEmpty(entries) ? (
          '-'
        ) : (
          <BAIFlex wrap="wrap" gap="sm">
            {_.map(
              entries,
              (entry: { resourceType: string; quantity: number }) => (
                <BAIResourceNumberWithIcon
                  key={entry.resourceType}
                  type={entry.resourceType}
                  value={toFixedFloorWithoutTrailingZeros(entry.quantity, 2)}
                />
              ),
            )}
          </BAIFlex>
        );
      },
    },
    {
      title: t('general.ModifiedAt'),
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      render: (date) => dayjs(date).format('lll'),
    },
    {
      title: t('general.CreatedAt'),
      key: 'createdAt',
      dataIndex: 'createdAt',
      sorter: isEnableSorter('createdAt'),
      render: (date) => dayjs(date).format('lll'),
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="column" align="start">
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('fairShare.FairShareSettingTitleWithName', {
            name: t('fairShare.Project'),
          })}
        </Typography.Title>
        <Typography.Text type="secondary">
          {<Trans i18nKey={t('fairShare.ProjectDescription')} />}
        </Typography.Text>
      </BAIFlex>

      <BAIFlex justify="between" align="center">
        <BAIGraphQLPropertyFilter
          filterProperties={[
            {
              key: 'projectId',
              propertyLabel: t('fairShare.Name'),
              type: 'string',
            },
          ]}
          value={JSON.parse(queryParams.filter || '{}')}
          onChange={(filter) => {
            startRefetchTransition(() => {
              setQueryParams({
                filter: filter ? JSON.stringify(filter) : null,
              });
              setTablePaginationOption({ current: 1 });
            });
          }}
        />
        <BAIFlex gap="sm">
          {selectedProjectIdList?.length > 0 && (
            <>
              {t('general.NSelected', {
                count: selectedProjectIdList.length,
              })}
              <Tooltip title={t('general.BulkEdit')} placement="topLeft">
                <Button
                  icon={<SettingOutlined style={{ color: token.colorInfo }} />}
                  onClick={() => {
                    setOpenBulkWeightSettingModal(true);
                  }}
                />
              </Tooltip>
            </>
          )}
          <BAIFetchKeyButton
            autoUpdateDelay={7_000}
            loading={isPendingRefetch}
            value=""
            onChange={() => {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }}
          />
        </BAIFlex>
      </BAIFlex>

      <BAITable
        rowKey={'projectId'}
        scroll={{ x: 'max-content' }}
        dataSource={filterOutEmpty(
          _.map(projectFairShares?.edges, (edge) => edge?.node),
        )}
        columns={columns}
        loading={
          deferredQueryVariables !== queryVariables ||
          deferredFetchKey !== fetchKey
        }
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys) => {
            setSelectedProjectIdList(selectedRowKeys as string[]);
          },
          selectedRowKeys: selectedProjectIdList,
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: projectFairShares?.count || 0,
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
        order={queryParams.order}
        onChangeOrder={(order) => {
          const isDescending = (order || '').startsWith('-');
          const orderKey = order?.split(',').pop() || '';
          const orderString =
            isDescending && !_.startsWith(orderKey, '-')
              ? `-${orderKey}`
              : orderKey;
          setQueryParams({
            order: orderString
              ? (orderString as (typeof availableProjectFairShareSorterValues)[number])
              : null,
          });
        }}
        {...tableProps}
      />

      <Suspense fallback={null}>
        <BAIUnmountAfterClose>
          <FairShareWeightSettingModal
            open={openWeightSettingModal || openBulkWeightSettingModal}
            onRequestClose={(success) => {
              if (success) {
                startRefetchTransition(() => {
                  updateFetchKey();
                });
                openBulkWeightSettingModal && setSelectedProjectIdList([]);
              }
              setSelectedProjectId('');
              setOpenWeightSettingModal(false);
              setOpenBulkWeightSettingModal(false);
            }}
            resourceGroupName={resourceGroupName}
            domainNames={[domainName]}
            projectIds={
              openBulkWeightSettingModal
                ? selectedProjectIdList
                : [selectedProjectId]
            }
            isBulkEdit={openBulkWeightSettingModal}
          />
        </BAIUnmountAfterClose>
      </Suspense>
    </BAIFlex>
  );
};

export default ProjectFairShareTable;
