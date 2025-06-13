import { ModelCardModalFragment$key } from '../__generated__/ModelCardModalFragment.graphql';
import { ModelStoreListPageQuery } from '../__generated__/ModelStoreListPageQuery.graphql';
import Flex from '../components/Flex';
import ModelCardModal from '../components/ModelCardModal';
import TextHighlighter from '../components/TextHighlighter';
import { useUpdatableState } from '../hooks';
import { useModelCardMetadata } from '../hooks/useModelCardMetadata';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Image,
  Input,
  List,
  Select,
  Tag,
  theme,
  Typography,
} from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
import { FolderX } from 'lucide-react';
import React, { useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const useStyles = createStyles(({ css, token }) => {
  return {
    cardList: css`
      .ant-col {
        height: calc(100% - ${token.marginMD}px);
      }
    `,
  };
});

type ModelCard = NonNullable<
  NonNullable<
    ModelStoreListPageQuery['response']['model_cards']
  >['edges'][number]
>['node'];

const ModelStoreListPage: React.FC = () => {
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [search, setSearch] = useState<string>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const { styles } = useStyles();
  const { models, sorting } = useModelCardMetadata();

  const [currentModelInfo, setCurrentModelInfo] =
    useState<ModelCardModalFragment$key | null>();

  const [isPendingRefetching, startRefetchingTransition] = useTransition();

  const { model_cards } = useLazyLoadQuery<ModelStoreListPageQuery>(
    graphql`
      query ModelStoreListPageQuery($filter: String) {
        # TODO: Implement pagination for model_cards
        model_cards(filter: $filter, first: 200) {
          edges {
            cursor
            node {
              id
              row_id @since(version: "24.03.7")
              name
              author
              title
              description
              task
              category
              label
              license
              min_resource
              error_msg @since(version: "24.03.7")
              vfolder {
                id
                name
              }
              ...ModelCardModalFragment
            }
          }
          count
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `,
    {
      filter: undefined,
    },
    {
      fetchPolicy: 'network-only',
      fetchKey,
    },
  );

  const fieldsValues = useMemo(() => {
    const result: {
      task: string[];
      category: string[];
      label: string[];
    } = { task: [], category: [], label: [] };
    const fields = ['task', 'category', 'label'] as const;
    // Initialize result object with empty arrays for each field
    fields.forEach((field) => (result[field] = []));

    // Traverse the JSON object
    model_cards?.edges.forEach((edge) => {
      fields.forEach((field) => {
        // Check if the field exists in the node
        if (edge?.node?.[field]) {
          _.map(_.castArray(edge.node[field]), (newValue) => {
            if (_.isString(newValue) && !result[field].includes(newValue)) {
              result[field].push(newValue);
            }
          });
        }
      });
    });
    return result;
  }, [model_cards?.edges]);
  return (
    <Flex direction="column" align="stretch" justify="center" gap="lg">
      <Flex
        direction="column"
        align="stretch"
        className="filterWrap"
        gap={'xs'}
      >
        <Flex direction="row" gap={'sm'}>
          <Input
            size="large"
            prefix={<SearchOutlined />}
            placeholder={t('modelStore.SearchModels')}
            allowClear
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.currentTarget.value);
            }}
            autoComplete="off"
          />
          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => {
              startRefetchingTransition(() => {
                updateFetchKey();
              });
            }}
            loading={isPendingRefetching}
          />
        </Flex>
        <Flex direction="row" gap={'md'} wrap="wrap">
          <Select
            style={{ minWidth: 150 }}
            placeholder={t('modelStore.Category')}
            options={_.map(fieldsValues.category, (t: string) => ({
              label: t,
              value: t,
            }))}
            mode={'multiple'}
            popupMatchSelectWidth={false}
            value={selectedCategories}
            onChange={(value: string[]) => {
              setSelectedCategories(value as string[]);
            }}
            allowClear
          />
          <Select
            style={{ minWidth: 150 }}
            placeholder={t('modelStore.Task')}
            options={_.map(fieldsValues.task, (t: string) => ({
              label: t,
              value: t,
            }))}
            mode={'multiple'}
            popupMatchSelectWidth={false}
            value={selectedTasks}
            onChange={(value: string[]) => {
              setSelectedTasks(value as string[]);
            }}
            allowClear
          />
          <Select
            style={{ minWidth: 150 }}
            placeholder={t('modelStore.Label')}
            options={_.map(fieldsValues.label, (t: string) => ({
              label: t,
              value: t,
            }))}
            mode={'multiple'}
            popupMatchSelectWidth={false}
            value={selectedLabels}
            onChange={(value: string[]) => {
              setSelectedLabels(value as string[]);
            }}
            allowClear
          />
        </Flex>
      </Flex>
      <List
        className={styles.cardList}
        grid={{ gutter: 16, column: 2 }}
        dataSource={
          model_cards?.edges
            ?.map((edge) => edge?.node)
            .filter((info) => {
              let passSearchFilter = true;
              if (search) {
                const searchLower = search.toLowerCase();
                passSearchFilter =
                  info?.description?.toLowerCase().includes(searchLower) ||
                  info?.title?.toLowerCase().includes(searchLower) ||
                  info?.task?.toLowerCase().includes(searchLower) ||
                  info?.category?.toLowerCase().includes(searchLower) ||
                  info?.label?.some((label) =>
                    label?.toLowerCase().includes(searchLower),
                  ) ||
                  false;
              }
              return (
                (_.isEmpty(selectedCategories) ||
                  _.includes(selectedCategories, info?.category)) &&
                (_.isEmpty(selectedLabels) ||
                  _.intersection(selectedLabels, info?.label).length > 0) &&
                (_.isEmpty(selectedTasks) ||
                  _.includes(selectedTasks, info?.task)) &&
                passSearchFilter
              );
            })
            .sort((a, b) => {
              const aIndex = sorting.indexOf(a?.name || '');
              const bIndex = sorting.indexOf(b?.name || '');

              if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
              } else if (aIndex !== -1) {
                return -1;
              } else if (bIndex !== -1) {
                return 1;
              } else {
                return 0;
              }
            }) as Array<ModelCard>
        }
        renderItem={(item: ModelCard) => (
          <List.Item
            onClick={() => {
              setCurrentModelInfo(item);
            }}
            style={{
              height: '100%',
            }}
          >
            <Card
              hoverable
              title={
                item?.title ? (
                  <TextHighlighter keyword={search}>
                    {item?.title}
                  </TextHighlighter>
                ) : (
                  <Typography.Text type="secondary">
                    <FolderX
                      style={{
                        marginLeft: token.marginXXS,
                        marginRight: token.marginXXS,
                        fontSize: token.fontSize,
                      }}
                    />
                    {item?.name}
                  </Typography.Text>
                )
              }
              style={{
                height: '100%',
              }}
            >
              <Flex direction="column" align="stretch" gap="xs">
                <Flex direction="row" align="start" gap="xs">
                  <Image
                    width={150}
                    src={(() => {
                      const found = _.find(
                        models,
                        (model) => model?.name === item?.name,
                      );
                      return found &&
                        typeof found === 'object' &&
                        'thumbnail' in found &&
                        (found as any).thumbnail
                        ? (found as any).thumbnail
                        : '/resources/images/model-player/default.jpeg';
                    })()}
                  />
                  <Typography.Paragraph
                    ellipsis={{ rows: 3, expandable: false }}
                    style={{ flex: 1 }}
                  >
                    <TextHighlighter keyword={search}>
                      {item?.description}
                    </TextHighlighter>
                  </Typography.Paragraph>
                </Flex>
                <Flex direction="row" wrap="wrap" gap={'xs'}>
                  {item?.category && (
                    <Tag bordered={false}>
                      <TextHighlighter keyword={search}>
                        {item?.category}
                      </TextHighlighter>
                    </Tag>
                  )}
                  {item?.task && (
                    <Tag bordered={false} color="success">
                      <TextHighlighter keyword={search}>
                        {item?.task}
                      </TextHighlighter>
                    </Tag>
                  )}
                  {item?.label &&
                    _.map(item?.label, (label: string) => (
                      <Tag key={label} bordered={false} color="blue">
                        <TextHighlighter keyword={search}>
                          {label}
                        </TextHighlighter>
                      </Tag>
                    ))}
                  {item?.error_msg && (
                    <Alert
                      style={{ width: '100%' }}
                      message={
                        <Typography.Paragraph
                          ellipsis={{ rows: 6 }}
                          style={{ marginBottom: 0 }}
                        >
                          {item.error_msg}
                        </Typography.Paragraph>
                      }
                      type="error"
                      showIcon
                    />
                  )}
                </Flex>
              </Flex>
            </Card>
          </List.Item>
        )}
      />
      <ModelCardModal
        modelCardModalFrgmt={currentModelInfo}
        open={!!currentModelInfo}
        onRequestClose={() => {
          setCurrentModelInfo(null);
        }}
      />
    </Flex>
  );
};

export default ModelStoreListPage;
