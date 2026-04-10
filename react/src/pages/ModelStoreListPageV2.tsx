/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelCardDrawerFragment$key } from '../__generated__/ModelCardDrawerFragment.graphql';
import {
  ModelCardV2Filter,
  ModelStoreListPageV2Query,
} from '../__generated__/ModelStoreListPageV2Query.graphql';
import { ModelStoreListPageV2_ModelCardV2Fragment$key } from '../__generated__/ModelStoreListPageV2_ModelCardV2Fragment.graphql';
import AuthorIcon from '../components/AuthorIcon';
import ModelBrandIcon from '../components/ModelBrandIcon';
import ModelCardDrawer from '../components/ModelCardDrawer';
import TextHighlighter from '../components/TextHighlighter';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useModelStoreProject } from '../hooks/useModelStoreProject';
import { SwapOutlined } from '@ant-design/icons';
import {
  Alert,
  Card,
  Col,
  ConfigProvider,
  Empty,
  Pagination,
  Row,
  Tag,
  Typography,
  theme,
} from 'antd';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAISelect,
  type GraphQLFilter,
  useUpdatableState,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useDeferredValue, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

const SORT_VALUES = [
  'NAME_ASC',
  'NAME_DESC',
  'CREATED_AT_ASC',
  'CREATED_AT_DESC',
] as const;

type SortField = 'NAME' | 'CREATED_AT';
type SortDirection = 'ASC' | 'DESC';

const parseSortValue = (value: string) => {
  const parts = value.split('_');
  const direction = parts.pop() as SortDirection;
  const field = parts.join('_') as SortField;
  return { field, direction };
};

const ModelCardV2Card: React.FC<{
  modelCardV2Frgmt: ModelStoreListPageV2_ModelCardV2Fragment$key;
  searchKeyword?: string;
  onClick?: () => void;
}> = ({ modelCardV2Frgmt, searchKeyword, onClick }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const modelCard = useFragment(
    graphql`
      fragment ModelStoreListPageV2_ModelCardV2Fragment on ModelCardV2 {
        name
        metadata {
          title
          task
          author
        }
        updatedAt
        createdAt
        availablePresets(orderBy: [{ field: RANK, direction: "ASC" }]) {
          count
        }
      }
    `,
    modelCardV2Frgmt,
  );

  const hasNoPresets = modelCard.availablePresets?.count === 0;

  return (
    <Card
      hoverable
      onClick={onClick}
      style={{
        height: '100%',
        cursor: 'pointer',
        opacity: hasNoPresets ? 0.5 : 1,
      }}
      styles={{ body: { padding: token.paddingSM } }}
    >
      <BAIFlex direction="column" align="stretch" gap="xs">
        <BAIFlex direction="row" align="center" gap="xs">
          <ModelBrandIcon modelName={modelCard.name} />
          <Typography.Text strong ellipsis style={{ flex: 1 }}>
            <TextHighlighter keyword={searchKeyword}>
              {modelCard.metadata?.title || modelCard.name}
            </TextHighlighter>
          </Typography.Text>
        </BAIFlex>
        <BAIFlex direction="row" justify="between" wrap="wrap" gap="xs">
          <BAIFlex direction="row" wrap="wrap" gap="xs">
            {modelCard.metadata?.task && (
              <Tag variant="filled">{modelCard.metadata.task}</Tag>
            )}
            {(modelCard.updatedAt || modelCard.createdAt) && (
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                {t('modelStore.RelativeTime', {
                  time: dayjs(
                    modelCard.updatedAt ?? modelCard.createdAt,
                  ).fromNow(),
                })}
              </Typography.Text>
            )}
          </BAIFlex>
          {modelCard.metadata.author && (
            <Typography.Text
              type="secondary"
              style={{
                fontSize: token.fontSizeSM,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <AuthorIcon
                author={modelCard.metadata.author}
                size={token.fontSizeSM}
              />
              {modelCard.metadata.author}
            </Typography.Text>
          )}
        </BAIFlex>
      </BAIFlex>
    </Card>
  );
};

const ModelCardV2Grid: React.FC<{
  projectId: string;
  filter?: GraphQLFilter;
  sortField: SortField;
  sortDirection: SortDirection;
  fetchKey: string;
  searchKeyword?: string;
  pageSize: number;
  offset: number;
  onTotalChange: (total: number) => void;
  onCardClick?: (id: string, frgmt: ModelCardDrawerFragment$key) => void;
  selectedModelCardId?: string | null;
  onSelectedModelCardFound?: (frgmt: ModelCardDrawerFragment$key) => void;
}> = ({
  projectId,
  filter,
  sortField,
  sortDirection,
  fetchKey,
  searchKeyword,
  pageSize,
  offset,
  onTotalChange,
  onCardClick,
  selectedModelCardId,
  onSelectedModelCardFound,
}) => {
  'use memo';

  const { t } = useTranslation();

  const result = useLazyLoadQuery<ModelStoreListPageV2Query>(
    graphql`
      query ModelStoreListPageV2Query(
        $scope: ProjectModelCardV2Scope!
        $filter: ModelCardV2Filter
        $orderBy: [ModelCardV2OrderBy!]
        $limit: Int!
        $offset: Int!
      ) {
        projectModelCardsV2(
          scope: $scope
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              ...ModelStoreListPageV2_ModelCardV2Fragment
              ...ModelCardDrawerFragment
            }
          }
        }
      }
    `,
    {
      scope: { projectId },
      filter: (filter as ModelCardV2Filter) ?? undefined,
      orderBy: [{ field: sortField, direction: sortDirection }],
      limit: pageSize,
      offset,
    },
    {
      fetchPolicy: 'network-only',
      fetchKey,
    },
  );

  const items = result.projectModelCardsV2?.edges ?? [];
  const total = result.projectModelCardsV2?.count ?? 0;

  const onTotalChanged = useEffectEvent(() => {
    onTotalChange(total);
  });

  React.useEffect(() => {
    onTotalChanged();
  }, [total]);

  // When items load and a selectedModelCardId is set (e.g. after refresh),
  // find the matching fragment and report it to the parent.
  const onResolveSelectedModelCard = useEffectEvent(() => {
    if (selectedModelCardId) {
      const match = items.find(
        (edge) => edge?.node?.id === selectedModelCardId,
      );
      if (match?.node) {
        onSelectedModelCardFound?.(match.node);
      }
    }
  });

  React.useEffect(() => {
    onResolveSelectedModelCard();
  }, [selectedModelCardId, result]);

  if (items.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t('modelStore.NoModelsFound')}
      />
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {items.map((edge) => {
        const item = edge?.node;
        if (!item) return null;
        return (
          <Col key={item.id} xs={24} sm={24} lg={12}>
            <ModelCardV2Card
              modelCardV2Frgmt={item}
              searchKeyword={searchKeyword}
              onClick={() => onCardClick?.(item.id, item)}
            />
          </Col>
        );
      })}
    </Row>
  );
};

const ModelStoreListPageV2: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const modelStoreProject = useModelStoreProject();

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const deferredFetchKey = useDeferredValue(fetchKey);

  const [queryParams, setQueryParams] = useQueryStates(
    {
      sort: parseAsStringLiteral(SORT_VALUES).withDefault('CREATED_AT_DESC'),
      modelCard: parseAsString,
      search: parseAsString,
    },
    { history: 'replace' },
  );

  const { field: sortField, direction: sortDirection } = parseSortValue(
    queryParams.sort,
  );

  const [selectedModelCard, setSelectedModelCard] =
    useState<ModelCardDrawerFragment$key | null>(null);

  const filter: GraphQLFilter | undefined = queryParams.search
    ? ({ name: { iContains: queryParams.search } } as GraphQLFilter)
    : undefined;
  const deferredFilter = useDeferredValue(filter);
  const deferredSortField = useDeferredValue(sortField);
  const deferredSortDirection = useDeferredValue(sortDirection);
  const [total, setTotal] = React.useState(0);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const deferredLimit = useDeferredValue(baiPaginationOption.limit);
  const deferredOffset = useDeferredValue(baiPaginationOption.offset);

  const isPendingPage =
    deferredLimit !== baiPaginationOption.limit ||
    deferredOffset !== baiPaginationOption.offset;
  const isPendingSort =
    deferredSortField !== sortField || deferredSortDirection !== sortDirection;
  const isPendingFilter = deferredFilter !== filter;
  const isPendingRefetch = deferredFetchKey !== fetchKey;
  const isPending =
    isPendingSort || isPendingRefetch || isPendingPage || isPendingFilter;

  const sortOptions = [
    {
      value: 'NAME_ASC' as const,
      label: t('modelStore.SortByNameAsc'),
    },
    {
      value: 'NAME_DESC' as const,
      label: t('modelStore.SortByNameDesc'),
    },
    {
      value: 'CREATED_AT_ASC' as const,
      label: t('modelStore.SortByCreatedAtAsc'),
    },
    {
      value: 'CREATED_AT_DESC' as const,
      label: t('modelStore.SortByCreatedAtDesc'),
    },
  ];

  if (!modelStoreProject.id) {
    return (
      <Alert
        type="error"
        showIcon
        title={t('modelStore.ProjectNotFound')}
        description={t('modelStore.ProjectNotFoundDescription')}
      />
    );
  }

  const searchKeyword = queryParams.search ?? '';

  return (
    <BAIFlex direction="column" align="stretch" justify="center" gap="lg">
      <BAIFlex justify="between" wrap="wrap" gap="sm">
        <BAIFlex gap="sm" align="start" style={{ flexShrink: 1 }} wrap="wrap">
          <BAIGraphQLPropertyFilter
            combinationMode="AND"
            value={filter}
            onChange={(value) => {
              const search =
                (value?.name as { iContains?: string } | undefined)
                  ?.iContains || null;
              setQueryParams({ search });
              setTablePaginationOption({ current: 1 });
            }}
            filterProperties={[
              {
                fixedOperator: 'iContains',
                key: 'name',
                propertyLabel: t('modelStore.ModelName'),
                type: 'string',
              },
            ]}
          />
          <BAISelect
            style={{ minWidth: 180 }}
            value={queryParams.sort}
            onChange={(value) => {
              setQueryParams({ sort: value });
              setTablePaginationOption({ current: 1 });
            }}
            options={sortOptions}
            labelRender={({ label }) => (
              <BAIFlex direction="row" align="center" gap="xxs">
                <SwapOutlined rotate={90} />
                {t('modelStore.Sort')}: {label}
              </BAIFlex>
            )}
          />
        </BAIFlex>
        <BAIFetchKeyButton
          loading={isPendingRefetch}
          value={fetchKey}
          onChange={(newFetchKey) => {
            updateFetchKey(newFetchKey);
          }}
        />
      </BAIFlex>
      <div
        style={{
          opacity: isPending ? 0.5 : 1,
          transition: 'opacity 0.2s',
          pointerEvents: isPending ? 'none' : undefined,
        }}
      >
        <ModelCardV2Grid
          projectId={modelStoreProject.id}
          filter={deferredFilter}
          sortField={deferredSortField}
          sortDirection={deferredSortDirection}
          fetchKey={deferredFetchKey}
          searchKeyword={searchKeyword}
          pageSize={deferredLimit}
          offset={deferredOffset}
          onTotalChange={setTotal}
          selectedModelCardId={queryParams.modelCard}
          onSelectedModelCardFound={(frgmt) => setSelectedModelCard(frgmt)}
          onCardClick={(id, frgmt) => {
            setSelectedModelCard(frgmt);
            setQueryParams({ modelCard: id });
          }}
        />
      </div>
      {total > 0 && (
        <ConfigProvider
          theme={{
            components: {
              Pagination: {
                itemBg: 'transparent',
                itemActiveBg: 'transparent',
              },
            },
          }}
        >
          <BAIFlex justify="end" gap="xs">
            <Pagination
              size="small"
              align="end"
              pageSizeOptions={['10', '20', '50']}
              showSizeChanger
              showTotal={(total, range) =>
                t('pagination.Total', {
                  start: range[0],
                  end: range[1],
                  total,
                })
              }
              current={tablePaginationOption.current}
              pageSize={tablePaginationOption.pageSize}
              total={total}
              onChange={(page, pageSize) => {
                setTablePaginationOption({ current: page, pageSize });
              }}
            />
          </BAIFlex>
        </ConfigProvider>
      )}

      <ModelCardDrawer
        modelCardDrawerFrgmt={selectedModelCard}
        open={!!queryParams.modelCard && !!selectedModelCard}
        onClose={() => {
          setSelectedModelCard(null);
          setQueryParams({ modelCard: null });
        }}
      />
    </BAIFlex>
  );
};

export default ModelStoreListPageV2;
