import Flex from '../components/Flex';
import ModelCardModal from '../components/ModelCardModal';
import { ModelCardModalFragment$key } from '../components/__generated__/ModelCardModalFragment.graphql';
import { ModelStoreListPageQuery } from './__generated__/ModelStoreListPageQuery.graphql';
import { useToggle } from 'ahooks';
import { Button, Card, Form, Input, List, Table, Tag, theme } from 'antd';
import { useForm } from 'antd/es/form/Form';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

const ModelStoreListPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [search, setSearch] = useState<string>();
  const [searchForm] = useForm<{
    search: string;
  }>();

  const [currentModelInfo, setCurrentModelInfo] =
    useState<ModelCardModalFragment$key | null>();

  const queryVariables = useMemo(
    () => ({
      filter: search,
    }),
    [search],
  );

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
    queryVariables,
    {
      fetchPolicy: 'network-only',
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
      <Form form={searchForm}>
        <Form.Item name="search" noStyle>
          <Input.Search
            placeholder={t('modelStore.SearchModels')}
            allowClear
            onSearch={(value) => {
              setSearch(value);
            }}
          />
        </Form.Item>
      </Form>
      <List
        dataSource={model_infos?.edges?.map((edge) => edge?.node)}
        renderItem={(item) => (
          <List.Item
            onClick={() => {
              setCurrentModelInfo(item);
            }}
          >
            <Card title={item?.title} size="small">
              <Tag bordered={false}>{item?.category}</Tag>
              <Tag bordered={false} color="success">
                {item?.task}
              </Tag>
              {_.map(item?.label, (label) => (
                <Tag key={label} bordered={false} color="gold">
                  {label}
                </Tag>
              ))}
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
