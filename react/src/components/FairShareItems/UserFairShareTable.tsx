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
  UserFairShareOrderBy,
  UserFairShareTableQuery,
  UserFairShareTableQuery$variables,
} from 'src/__generated__/UserFairShareTableQuery.graphql';
import { convertToOrderBy } from 'src/helper';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';

type UserFairShare = NonNullable<
  UserFairShareTableQuery['response']
>['userFairShares']['edges'][number]['node'];

const availableUserFairShareSorterKeys = [] as const;
const availableUserFairShareSorterValues = [
  ...availableUserFairShareSorterKeys,
  ...availableUserFairShareSorterKeys.map((key) => `-${key}`),
] as const;
const isEnableSorter = (key: string) => {
  return _.includes(availableUserFairShareSorterValues, key);
};

interface UserFairShareTableProps extends BAITableProps<UserFairShare> {
  resourceGroupName: string;
  domainName: string;
  projectId: string;
}

const UserFairShareTable: React.FC<UserFairShareTableProps> = ({
  resourceGroupName,
  domainName,
  projectId,
  ...tableProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedUserUuid, setSelectedUserUuid] = useState('');
  const [selectedUserUuidList, setSelectedUserUuidList] = useState<string[]>(
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

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableUserFairShareSorterValues),
      filter: parseAsString,
    },
    { history: 'replace' },
  );
  const queryVariables: UserFairShareTableQuery$variables = {
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.limit,
    orderBy: convertToOrderBy<UserFairShareOrderBy>(queryParams.order) || [
      { field: 'FAIR_SHARE_FACTOR', direction: 'ASC' },
    ],
    filter: {
      ...(JSON.parse(
        queryParams.filter || '{}',
      ) as UserFairShareTableQuery$variables['filter']),
    },
  };
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { userFairShares } = useLazyLoadQuery<UserFairShareTableQuery>(
    graphql`
      query UserFairShareTableQuery(
        $filter: UserFairShareFilter
        $orderBy: [UserFairShareOrderBy!]
        $offset: Int
        $limit: Int
      ) {
        userFairShares(
          filter: $filter
          orderBy: $orderBy
          offset: $offset
          limit: $limit
        ) {
          count
          edges {
            node {
              id
              userUuid
              projectId
              domainName
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

  const columns: ColumnsType<UserFairShare> = [
    {
      // FIXME: show user name instead of user UUID
      key: 'userUuid',
      title: t('fairShare.Name'),
      dataIndex: 'userUuid',
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
              setSelectedUserUuid(record?.userUuid);
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
            name: t('fairShare.User'),
          })}
        </Typography.Title>
        <Typography.Text type="secondary">
          {<Trans i18nKey={t('fairShare.UserDescription')} />}
        </Typography.Text>
      </BAIFlex>

      <BAIFlex justify="between" align="center">
        <BAIGraphQLPropertyFilter
          filterProperties={[
            {
              key: 'userUuid',
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
          {selectedUserUuidList?.length > 0 && (
            <>
              {t('general.NSelected', {
                count: selectedUserUuidList.length,
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
        rowKey={'userUuid'}
        scroll={{ x: 'max-content' }}
        dataSource={filterOutEmpty(
          _.map(userFairShares?.edges, (edge) => edge?.node),
        )}
        columns={columns}
        loading={
          deferredQueryVariables !== queryVariables ||
          deferredFetchKey !== fetchKey
        }
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys) => {
            setSelectedUserUuidList(selectedRowKeys as string[]);
          },
          selectedRowKeys: selectedUserUuidList,
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: userFairShares?.count || 0,
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
              ? (orderString as (typeof availableUserFairShareSorterValues)[number])
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
                openBulkWeightSettingModal && setSelectedUserUuidList([]);
              }
              setSelectedUserUuid('');
              setOpenWeightSettingModal(false);
              setOpenBulkWeightSettingModal(false);
            }}
            resourceGroupName={resourceGroupName}
            domainNames={[domainName]}
            projectIds={[projectId]}
            userIds={
              openBulkWeightSettingModal
                ? selectedUserUuidList
                : [selectedUserUuid]
            }
            isBulkEdit={openBulkWeightSettingModal}
          />
        </BAIUnmountAfterClose>
      </Suspense>
    </BAIFlex>
  );
};

export default UserFairShareTable;
