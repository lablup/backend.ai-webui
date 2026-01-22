import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
import { SettingOutlined } from '@ant-design/icons';
import { Button, theme, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAILink,
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
import { ChevronRight } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useDeferredValue, useState, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  DomainFairShareOrderBy,
  DomainFairShareTableQuery,
  DomainFairShareTableQuery$variables,
} from 'src/__generated__/DomainFairShareTableQuery.graphql';
import { convertToOrderBy } from 'src/helper';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';

type DomainFairShare = NonNullable<
  DomainFairShareTableQuery['response']
>['domainFairShares']['edges'][number]['node'];

const availableDomainFairShareSorterKeys = [
  'domainName',
  'fairShareFactor',
  'createdAt',
] as const;
const availableDomainFairShareSorterValues = [
  ...availableDomainFairShareSorterKeys,
  ...availableDomainFairShareSorterKeys.map((key) => `-${key}` as const),
] as const;
const isEnableSorter = (key: string) => {
  return _.includes(availableDomainFairShareSorterKeys, key);
};

interface DomainFairShareTableProps extends BAITableProps<DomainFairShare> {
  selectedResourceGroupName: string;
  onClickDomainName?: (domainName: string) => void;
}

const DomainFairShareTable: React.FC<DomainFairShareTableProps> = ({
  selectedResourceGroupName,
  onClickDomainName,
  ...tableProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedDomainList, setSelectedDomainList] = useState<string[]>([]);
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
      order: parseAsStringLiteral(availableDomainFairShareSorterValues),
      filter: parseAsString,
    },
    {
      history: 'replace',
    },
  );
  const resourceGroupNameFilter: DomainFairShareTableQuery$variables['filter'] =
    selectedResourceGroupName
      ? { resourceGroup: { equals: selectedResourceGroupName } }
      : {};
  const queryVariables: DomainFairShareTableQuery$variables = {
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.limit,
    orderBy: convertToOrderBy<DomainFairShareOrderBy>(queryParams.order) || [
      { field: 'DOMAIN_NAME', direction: 'DESC' },
    ],
    filter: {
      ...resourceGroupNameFilter,
      ...(JSON.parse(
        queryParams.filter || '{}',
      ) as DomainFairShareTableQuery$variables['filter']),
    },
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { domainFairShares } = useLazyLoadQuery<DomainFairShareTableQuery>(
    graphql`
      query DomainFairShareTableQuery(
        $filter: DomainFairShareFilter
        $orderBy: [DomainFairShareOrderBy!]
        $offset: Int
        $limit: Int
      ) {
        domainFairShares(
          filter: $filter
          orderBy: $orderBy
          offset: $offset
          limit: $limit
        ) {
          edges {
            node {
              id
              resourceGroup
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
          count
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

  const columns: ColumnsType<DomainFairShare> = [
    {
      title: t('fairShare.Name'),
      key: 'domainName',
      fixed: 'left',
      dataIndex: 'domainName',
      sorter: isEnableSorter('domainName'),
      render: (name) => (
        <BAIFlex gap="xxs" align="center">
          <Tooltip
            title={t('fairShare.GoToSubComponent', {
              sub: t('fairShare.Project'),
            })}
          >
            <BAILink
              icon={<ChevronRight />}
              onClick={() => onClickDomainName?.(name)}
            >
              {name}
            </BAILink>
          </Tooltip>
        </BAIFlex>
      ),
    },
    {
      title: t('general.Control'),
      key: 'control',
      fixed: 'left',
      render: (_text, record) => (
        <BAIFlex direction="row" gap="xxs">
          <Button
            type="text"
            icon={<SettingOutlined style={{ color: token.colorInfo }} />}
            onClick={() => {
              setSelectedDomain(record.domainName);
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
            name: t('fairShare.Domain'),
          })}
        </Typography.Title>
        <Typography.Text type="secondary">
          {<Trans i18nKey={t('fairShare.DomainDescription')} />}
        </Typography.Text>
      </BAIFlex>

      <BAIFlex justify="between" align="center">
        <BAIGraphQLPropertyFilter
          filterProperties={[
            {
              key: 'domainName',
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
          {selectedDomainList?.length > 0 && (
            <>
              {t('general.NSelected', {
                count: selectedDomainList.length,
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
        rowKey={'domainName'}
        scroll={{ x: 'max-content' }}
        dataSource={filterOutEmpty(
          _.map(domainFairShares?.edges, (edge) => edge?.node),
        )}
        columns={columns}
        loading={
          deferredQueryVariables !== queryVariables ||
          deferredFetchKey !== fetchKey
        }
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys) => {
            setSelectedDomainList(selectedRowKeys as string[]);
          },
          selectedRowKeys: selectedDomainList,
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: domainFairShares?.count || 0,
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
              ? (orderString as (typeof availableDomainFairShareSorterValues)[number])
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
                openBulkWeightSettingModal && setSelectedDomainList([]);
              }
              setSelectedDomain('');
              setOpenWeightSettingModal(false);
              setOpenBulkWeightSettingModal(false);
            }}
            resourceGroupName={selectedResourceGroupName}
            domainNames={
              openBulkWeightSettingModal ? selectedDomainList : [selectedDomain]
            }
            isBulkEdit={openBulkWeightSettingModal}
          />
        </BAIUnmountAfterClose>
      </Suspense>
    </BAIFlex>
  );
};

export default DomainFairShareTable;
