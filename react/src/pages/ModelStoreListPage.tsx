import Flex from '../components/Flex';
import ImportFromHuggingFacePanel from '../components/ImportFromHuggingFacePanel';
import ModelCardModal from '../components/ModelCardModal';
import TextHighlighter from '../components/TextHighlighter';
import UnmountModalAfterClose from '../components/UnmountModalAfterClose';
import { ModelCardModalFragment$key } from '../components/__generated__/ModelCardModalFragment.graphql';
import { useUpdatableState } from '../hooks';
import { ModelStoreListPageQuery } from './__generated__/ModelStoreListPageQuery.graphql';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Input,
  List,
  Select,
  Tag,
  theme,
  Typography,
  Image,
} from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { FolderX } from 'lucide-react';
import React, { useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

const useStyles = createStyles(({ css, token }) => {
  return {
    cardList: css`
      .ant-col {
        height: calc(100% - ${token.marginMD}px);
      }
    `,
  };
});

const ModelStoreListPage: React.FC = () => {
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [search, setSearch] = useState<string>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [paginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 100,
  });
  const { styles } = useStyles();

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
      <ImportFromHuggingFacePanel />
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
            onChange={(e) => {
              setSearch(e.target.value);
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
            options={_.map(fieldsValues.category, (t) => ({
              label: t,
              value: t,
            }))}
            mode={'multiple'}
            popupMatchSelectWidth={false}
            value={selectedCategories}
            onChange={(value) => {
              setSelectedCategories(value as string[]);
            }}
            allowClear
          />
          <Select
            style={{ minWidth: 150 }}
            placeholder={t('modelStore.Task')}
            options={_.map(fieldsValues.task, (t) => ({
              label: t,
              value: t,
            }))}
            mode={'multiple'}
            popupMatchSelectWidth={false}
            value={selectedTasks}
            onChange={(value) => {
              setSelectedTasks(value as string[]);
            }}
            allowClear
          />
          <Select
            style={{ minWidth: 150 }}
            placeholder={t('modelStore.Label')}
            options={_.map(fieldsValues.label, (t) => ({
              label: t,
              value: t,
            }))}
            mode={'multiple'}
            popupMatchSelectWidth={false}
            value={selectedLabels}
            onChange={(value) => {
              setSelectedLabels(value as string[]);
            }}
            allowClear
          />
        </Flex>
      </Flex>
      <List
        className={styles.cardList}
        grid={{ gutter: 16, column: 2 }}
        dataSource={model_cards?.edges
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
            const specialNames = [
              // FIXME: NIM supported image need to be located first.
              'Meta-Llama-3-8B-Instruct',
              'gemma-2-27b-it',
              'Llama-3.2-11B-Vision-Instruct',
              'stable-diffusion-3-medium',
              'Talkativot UI',
            ];
            const aIndex = specialNames.indexOf(a?.name || '');
            const bIndex = specialNames.indexOf(b?.name || '');

            if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex;
            } else if (aIndex !== -1) {
              return -1;
            } else if (bIndex !== -1) {
              return 1;
            } else {
              return 0;
            }
          })}
        renderItem={(item) => (
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
              children={
                <Flex direction="column" align="stretch" gap="xs">
                  <Flex direction="row" align="start" gap="xs">
                    <Image
                      width={150}
                      preview={false}
                      src={`/resources/images/model-player/${_.replace(item?.name as string, ' ', '-')}.jpeg`}
                      fallback="/resources/images/model-player/default.jpeg"
                      loading={'lazy'}
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
                      _.map(item?.label, (label) => (
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
              }
            ></Card>
          </List.Item>
        )}
      />
      <UnmountModalAfterClose>
        <ModelCardModal
          modelCardModalFrgmt={currentModelInfo}
          open={!!currentModelInfo}
          onRequestClose={() => {
            setCurrentModelInfo(null);
          }}
        />
      </UnmountModalAfterClose>
    </Flex>
  );
};

export default ModelStoreListPage;
