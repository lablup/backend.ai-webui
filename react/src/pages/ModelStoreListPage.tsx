import Flex from '../components/Flex';
import ModelCardModal from '../components/ModelCardModal';
import TextHighlighter from '../components/TextHighlighter';
import { ModelCardModalFragment$key } from '../components/__generated__/ModelCardModalFragment.graphql';
import { useUpdatableState } from '../hooks';
import { ModelStoreListPageQuery } from './__generated__/ModelStoreListPageQuery.graphql';
import { ReloadOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Card, Form, Input, List, Table, Tag, theme } from 'antd';
import { useForm } from 'antd/es/form/Form';
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
  const [searchForm] = useForm<{
    search: string;
  }>();

  const [currentModelInfo, setCurrentModelInfo] =
    useState<ModelCardModalFragment$key | null>();

  const [isPendingRefetching, startRefetchingTransition] = useTransition();
  // const queryVariables = useMemo(
  //   () => ({
  //     filter: search,
  //   }),
  //   [search],
  // );

  const [isOpenModelCard, { toggle: toggleIsOpenModelCard }] = useToggle();

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

  return (
    <Flex
      direction="column"
      align="stretch"
      justify="center"
      gap="lg"
      style={{ padding: token.paddingLG }}
    >
      <Flex direction="row" gap={'md'}>
        <Form form={searchForm} style={{ flex: 1 }}>
          <Form.Item name="search" noStyle>
            <Input.Search
              placeholder={t('modelStore.SearchModels')}
              allowClear
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              autoComplete="off"
            />
          </Form.Item>
        </Form>
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
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 5 }}
        dataSource={model_infos?.edges
          ?.map((edge) => edge?.node)
          .filter((info) => {
            if (search) {
              const searchLower = search.toLowerCase();
              return (
                info?.title?.toLowerCase().includes(searchLower) ||
                info?.task?.toLowerCase().includes(searchLower) ||
                info?.category?.toLowerCase().includes(searchLower) ||
                info?.label?.some(
                  (label) => label?.toLowerCase().includes(searchLower),
                )
              );
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
