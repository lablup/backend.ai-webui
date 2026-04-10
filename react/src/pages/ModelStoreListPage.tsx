/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelCardModalFragment$key } from '../__generated__/ModelCardModalFragment.graphql';
import { ModelStoreListPageQuery } from '../__generated__/ModelStoreListPageQuery.graphql';
import ModelBrandIcon from '../components/ModelBrandIcon';
import ModelCardModal from '../components/ModelCardModal';
import TextHighlighter from '../components/TextHighlighter';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useMergedAllowedStorageHostPermission } from '../hooks/useMergedAllowedStorageHostPermission';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Tag,
  theme,
  Typography,
} from 'antd';
import { useUpdatableState, BAIFlex, localeCompare } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type ModelCard = NonNullable<
  NonNullable<
    ModelStoreListPageQuery['response']['model_cards']
  >['edges'][number]
>['node'];

const ModelStoreListPage: React.FC = () => {
  'use memo';

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  if (!currentProject.id) {
    throw new Error('Project ID is required for ModelStoreListPage');
  }
  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      currentProject.id,
      baiClient?._config?.accessKey,
    );

  const [search, setSearch] = useState<string>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [currentModelInfo, setCurrentModelInfo] =
    useState<ModelCardModalFragment$key | null>();

  const [isPendingRefetching, startRefetchingTransition] = useTransition();

  const { model_cards } = useLazyLoadQuery<ModelStoreListPageQuery>(
    graphql`
      query ModelStoreListPageQuery($filter: String) {
        # TODO: Implement pagination for model_cards
        model_cards(filter: $filter, first: 200) {
          edges {
            node {
              id
              name
              title
              description
              task
              category
              label
              modified_at
              error_msg
              vfolder_node {
                cloneable
                host
              }
              ...ModelCardModalFragment
            }
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

  const fieldsValues = (() => {
    const result: {
      task: string[];
      category: string[];
      label: string[];
    } = { task: [], category: [], label: [] };
    const fields = ['task', 'category', 'label'] as const;
    fields.forEach((field) => (result[field] = []));

    model_cards?.edges.forEach((edge) => {
      fields.forEach((field) => {
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
  })();
  return (
    <BAIFlex direction="column" align="stretch" justify="center" gap="lg">
      <BAIFlex
        direction="column"
        align="stretch"
        className="filterWrap"
        gap={'xs'}
      >
        <BAIFlex direction="row" gap={'sm'}>
          <Input
            size="large"
            prefix={<SearchOutlined />}
            placeholder={t('modelStore.SearchModels')}
            allowClear
            onChange={(e) => {
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
        </BAIFlex>
        <BAIFlex direction="row" gap={'sm'} wrap="wrap">
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
            onChange={(value) => {
              setSelectedCategories(value);
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
            onChange={(value) => {
              setSelectedTasks(value);
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
            onChange={(value) => {
              setSelectedLabels(value);
            }}
            allowClear
          />
        </BAIFlex>
      </BAIFlex>
      <Row gutter={[16, 16]}>
        {(
          model_cards?.edges
            ?.map((edge) => edge?.node)
            .filter((info) => {
              // Filter by cloneable vfolder with MOUNT_IN_SESSION permission
              if (!info?.vfolder_node?.cloneable) return false;
              const host = info?.vfolder_node?.host;
              if (
                !host ||
                !_.includes(
                  unitedAllowedPermissionByVolume[host],
                  'mount-in-session',
                )
              )
                return false;

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
            .sort((a, b) => localeCompare(a?.name, b?.name)) as Array<ModelCard>
        )?.map((item) => (
          <Col key={item?.id} xs={24} sm={24} md={24} lg={24} xl={12} xxl={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
              styles={{ body: { padding: token.paddingSM } }}
              onClick={() => {
                setCurrentModelInfo(item);
              }}
            >
              <BAIFlex direction="column" align="stretch" gap="xs">
                <BAIFlex direction="row" align="center" gap="xs">
                  <ModelBrandIcon modelName={item?.name ?? ''} />
                  <Typography.Text strong ellipsis style={{ flex: 1 }}>
                    <TextHighlighter keyword={search}>
                      {item?.title || item?.name}
                    </TextHighlighter>
                  </Typography.Text>
                </BAIFlex>
                <BAIFlex direction="row" wrap="wrap" gap={'xs'}>
                  {item?.task && (
                    <Tag variant="filled" color="success">
                      <TextHighlighter keyword={search}>
                        {item?.task}
                      </TextHighlighter>
                    </Tag>
                  )}
                  {item?.category && (
                    <Tag variant="filled">
                      <TextHighlighter keyword={search}>
                        {item?.category}
                      </TextHighlighter>
                    </Tag>
                  )}
                  {item?.modified_at && (
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      Updated {dayjs(item.modified_at).fromNow()}
                    </Typography.Text>
                  )}
                </BAIFlex>
                {item?.error_msg && (
                  <Alert
                    style={{ width: '100%' }}
                    title={
                      <Typography.Paragraph
                        ellipsis={{ rows: 3 }}
                        style={{ marginBottom: 0 }}
                      >
                        {item.error_msg}
                      </Typography.Paragraph>
                    }
                    type="error"
                    showIcon
                  />
                )}
              </BAIFlex>
            </Card>
          </Col>
        ))}
      </Row>
      <ModelCardModal
        modelCardModalFrgmt={currentModelInfo}
        open={!!currentModelInfo}
        onRequestClose={() => {
          setCurrentModelInfo(null);
        }}
      />
    </BAIFlex>
  );
};

export default ModelStoreListPage;
