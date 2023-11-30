import Flex from '../components/Flex';
import ModelCardModal from '../components/ModelCardModal';
import TextHighlighter from '../components/TextHighlighter';
import { ModelCardModalFragment$key } from '../components/__generated__/ModelCardModalFragment.graphql';
import { useUpdatableState } from '../hooks';
import { ModelStoreListPageQuery } from './__generated__/ModelStoreListPageQuery.graphql';
import { ReloadOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Card, Input, List, Select, Tag, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

const ModelStoreListPage: React.FC = () => {
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [search, setSearch] = useState<string>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const [currentModelInfo, setCurrentModelInfo] =
    useState<ModelCardModalFragment$key | null>();

  const [isPendingRefetching, startRefetchingTransition] = useTransition();

  const { model_infos } = useLazyLoadQuery<ModelStoreListPageQuery>(
    graphql`
      query ModelStoreListPageQuery($filter: String) {
        model_infos(filter: $filter) {
          edges {
            cursor
            node {
              id
              name
              author
              title
              description
              task
              category
              label
              license
              min_resource
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

  // const filterInfo = _.map

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
    model_infos?.edges.forEach((edge) => {
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
  }, [model_infos?.edges]);
  return (
    <Flex
      direction="column"
      align="stretch"
      justify="center"
      gap="lg"
      style={{ padding: token.paddingLG }}
    >
      <Flex
        direction="column"
        align="stretch"
        className="filterWrap"
        gap={'xs'}
      >
        <Flex direction="row" gap={'md'}>
          <Input.Search
            placeholder={t('modelStore.SearchModels')}
            allowClear
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            autoComplete="off"
          />
          <Button
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
              console.log(value);
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
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 5 }}
        dataSource={model_infos?.edges
          ?.map((edge) => edge?.node)
          .filter((info) => {
            if (search) {
              const searchLower = search.toLowerCase();
              console.log(selectedTasks);
              return (
                info?.title?.toLowerCase().includes(searchLower) ||
                info?.task?.toLowerCase().includes(searchLower) ||
                info?.category?.toLowerCase().includes(searchLower) ||
                info?.label?.some(
                  (label) => label?.toLowerCase().includes(searchLower),
                )
              );
            }
            if (selectedCategories.length) {
              return _.includes(selectedCategories, info?.category);
            }
            if (selectedLabels.length) {
              return _.intersection(selectedLabels, info?.label).length > 0;
            }
            if (selectedTasks.length) {
              return _.includes(selectedTasks, info?.task);
            }

            return true;
          })}
        renderItem={(item) => (
          <List.Item
            onClick={() => {
              setCurrentModelInfo(item);
            }}
          >
            <Card
              hoverable
              title={
                <TextHighlighter keyword={search}>
                  {item?.title}
                </TextHighlighter>
              }
              size="small"
            >
              <Flex direction="row" wrap="wrap" gap={'xs'}>
                <Tag bordered={false}>
                  <TextHighlighter keyword={search}>
                    {item?.category}
                  </TextHighlighter>
                </Tag>
                <Tag bordered={false} color="success">
                  <TextHighlighter keyword={search}>
                    {item?.task}
                  </TextHighlighter>
                </Tag>
                {_.map(item?.label, (label) => (
                  <Tag key={label} bordered={false} color="blue">
                    <TextHighlighter keyword={search}>{label}</TextHighlighter>
                  </Tag>
                ))}
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
