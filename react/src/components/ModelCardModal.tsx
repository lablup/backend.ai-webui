import { useBackendAIImageMetaData } from '../hooks';
import { useUpdatableState } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import ModelCloneModal from './ModelCloneModal';
import ResourceNumber from './ResourceNumber';
import { ModelCardModalEndpointDetailQuery } from './__generated__/ModelCardModalEndpointDetailQuery.graphql';
import { ModelCardModalFragment$key } from './__generated__/ModelCardModalFragment.graphql';
import { Model } from './lablupTalkativotUI/ChatUIModal';
import LLMChatCard from './lablupTalkativotUI/LLMChatCard';
import {
  BankOutlined,
  CopyOutlined,
  FileOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { stringLiteral } from '@babel/types';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Grid,
  Row,
  Tag,
  Typography,
  Tabs,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _, { head } from 'lodash';
import { Cog, FolderX } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';
import { useLazyLoadQuery } from 'react-relay';

interface ModelCardModalProps extends BAIModalProps {
  modelCardModalFrgmt?: ModelCardModalFragment$key | null;
  basePath?: string;
  onRequestClose: () => void;
}
const ModelCardModal: React.FC<ModelCardModalProps> = ({
  modelCardModalFrgmt = null,
  basePath = 'v1',
  onRequestClose,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [visibleCloneModal, setVisibleCloneModal] = useState(false);
  const [fetchKey, updateFetchKey] = useUpdatableState('first');

  const [metadata] = useBackendAIImageMetaData();
  const screen = Grid.useBreakpoint();
  const model_card = useFragment(
    graphql`
      fragment ModelCardModalFragment on ModelCard {
        id
        row_id @since(version: "24.03.7")
        name
        author
        title
        version
        created_at
        modified_at
        description
        task
        category
        architecture
        framework
        label
        license
        readme
        min_resource
        architecture
        framework
        vfolder {
          cloneable
        }
        vfolder_node @since(version: "24.09.*") {
          ...ModelCloneModalVFolderFragment
        }
        vfolder {
          id
          name
          host
        }
        error_msg @since(version: "24.03.7")
      }
    `,
    modelCardModalFrgmt,
  );

  const [paginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 100,
  });

  const { endpoint, endpoint_token_list } =
    useLazyLoadQuery<ModelCardModalEndpointDetailQuery>(
      graphql`
        query ModelCardModalEndpointDetailQuery(
          $endpointId: UUID!
          $tokenListOffset: Int!
          $tokenListLimit: Int!
        ) {
          endpoint(endpoint_id: $endpointId) {
            name
            status
            endpoint_id
            image @deprecatedSince(version: "23.09.9")
            image_object @since(version: "23.09.9") {
              name
              humanized_name
              tag
              registry
              architecture
              is_local
              digest
              resource_limits {
                key
                min
                max
              }
              labels {
                key
                value
              }
              size_bytes
              supported_accelerators
            }
            desired_session_count
            url
            open_to_public
            retries
            runtime_variant @since(version: "24.03.5") {
              human_readable_name
            }
            model
            model_mount_destiation @deprecatedSince(version: "24.03.4")
            model_mount_destination @since(version: "24.03.4")
            model_definition_path @since(version: "24.03.4")
            extra_mounts @since(version: "24.03.4") {
              row_id
              name
            }
            environ
            resource_group
            resource_slots
            resource_opts
            routings {
              routing_id
              session
              traffic_ratio
              endpoint
              status
            }
            created_user_email @since(version: "23.09.8")
            ...EndpointOwnerInfoFragment
            ...EndpointStatusTagFragment
          }
          endpoint_token_list(
            offset: $tokenListOffset
            limit: $tokenListLimit
            endpoint_id: $endpointId
          ) {
            total_count
            items {
              id
              token
              endpoint_id
              domain
              project
              session_owner
              created_at
              valid_until
            }
          }
        }
      `,
      {
        tokenListOffset:
          (paginationState.current - 1) * paginationState.pageSize,
        tokenListLimit: paginationState.pageSize,
        // TODO: set endpointId
        endpointId: 'cdc6ffa1-5b35-4111-9f2a-d99875fdf6ff',
      },
      {
        fetchPolicy:
          fetchKey === 'initial-fetch' ? 'store-and-network' : 'network-only',
        fetchKey,
      },
    );

  const {
    data: modelsResult,
    // error,
    isFetching,
    refetch,
  } = useTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', endpoint?.url],
    queryFn: () => {
      return fetch(
        new URL(basePath + '/models', endpoint?.url || '').toString(),
      ).then((res) => res.json());
    },
  });

  const newestToken = _.maxBy(
    endpoint_token_list?.items,
    (item) => item?.created_at,
  );
  // FIXME: temporally parse UTC and change to timezone (timezone need to be added in server side)
  const newestValidToken = dayjs
    .utc(newestToken?.valid_until)
    .tz()
    .isAfter(dayjs())
    ? newestToken?.token
    : undefined;

  const colSize = {
    xs: { span: 24 },
    lg: {
      span:
        _.compact([model_card?.description, model_card?.readme]).length === 2
          ? 12
          : 24,
    },
  };

  return (
    <BAIModal
      {...props}
      title={
        model_card?.title ? (
          model_card?.title
        ) : (
          <div style={{ color: token.colorTextSecondary }}>
            <FolderX
              style={{
                marginRight: token.marginXXS,
              }}
            />
            {model_card?.name}
          </div>
        )
      }
      centered
      onCancel={onRequestClose}
      destroyOnClose
      width={
        _.isEmpty(model_card?.readme) || _.isEmpty(model_card?.description)
          ? 800
          : screen.xxl
            ? '75%'
            : '90%'
      }
      footer={[
        <Button
          onClick={() => {
            onRequestClose();
          }}
          key="close"
        >
          {t('button.Close')}
        </Button>,
      ]}
    >
      <Tabs
        defaultActiveKey="experience"
        tabBarStyle={{ minWidth: 200 }}
        items={[
          {
            key: 'experience',
            label: t('modelStore.Experience'),
            children: (
              <Flex direction="row" wrap="wrap" align="center" gap={'sm'}>
                <LLMChatCard
                  endpointId={endpoint?.endpoint_id || ''}
                  baseURL={new URL(basePath, endpoint?.url || '').toString()}
                  models={_.map(modelsResult?.data, (m) => ({
                    id: m.id,
                    name: m.id,
                  }))}
                  fetchOnClient
                  style={{ flex: 1 }}
                  allowCustomModel={_.isEmpty(modelsResult?.data)}
                  alert={
                    _.isEmpty(modelsResult?.data) && (
                      <Alert
                        type="warning"
                        showIcon
                        message={t('chatui.CannotFindModel')}
                        action={
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                              refetch();
                            }}
                          >
                            {t('button.Refresh')}
                          </Button>
                        }
                      />
                    )
                  }
                  modelId={modelsResult?.data?.[0].id ?? 'custom'}
                  modelToken={newestValidToken}
                />
              </Flex>
            ),
          },
          {
            key: 'modelcard',
            label: t('modelStore.ModelCard'),
            children: model_card?.error_msg ? (
              <Flex direction="column" wrap="wrap" align="stretch" gap={'sm'}>
                <Alert
                  message={model_card?.error_msg}
                  type="error"
                  showIcon
                  style={{ width: '100%' }}
                />
                <Empty
                  style={{ width: '100%' }}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Flex>
            ) : (
              <>
                <Flex
                  direction="row"
                  align="start"
                  style={{ marginBottom: token.marginSM }}
                  gap={'xs'}
                  wrap="wrap"
                >
                  <Flex
                    justify="start"
                    align="start"
                    gap={'xs'}
                    style={{ flex: 1 }}
                    wrap="wrap"
                  >
                    {model_card?.category && (
                      <Tag bordered={false} style={{ marginRight: 0 }}>
                        {model_card?.category}
                      </Tag>
                    )}
                    {model_card?.task && (
                      <Tag
                        bordered={false}
                        color="success"
                        style={{ marginRight: 0 }}
                      >
                        {model_card?.task}
                      </Tag>
                    )}
                    {model_card?.label &&
                      _.map(model_card?.label, (label) => (
                        <Tag
                          key={label}
                          bordered={false}
                          color="blue"
                          style={{ marginRight: 0 }}
                        >
                          {label}
                        </Tag>
                      ))}
                    {model_card?.license && (
                      <Tag
                        icon={<BankOutlined />}
                        bordered={false}
                        color="geekblue"
                        style={{ marginRight: 0 }}
                      >
                        {model_card?.license}
                      </Tag>
                    )}
                  </Flex>
                  <Flex direction="row" justify="end" gap={'sm'}>
                    {/* <Button
                  type="primary"
                  ghost
                  icon={<DownloadOutlined />}
                  size="small"
                  disabled
                >
                  {t('button.Download')}
                </Button> */}
                    {/* <Button disabled ghost size="small" icon={<Cog />}>
                      {t('modelStore.FinetuneModel')}
                    </Button>
                    <Button
                      type="primary"
                      ghost
                      icon={<CopyOutlined />}
                      size="small"
                      disabled={!model_card?.vfolder?.cloneable}
                      onClick={() => {
                        // const event = new CustomEvent('backend-ai-vfolder-cloning', {
                        //   detail: {
                        //     // TODO: change this to vfolder name
                        //     name: mode_card?.name,
                        //   },
                        // });
                        // onRequestClose();
                        // document.dispatchEvent(event);
                        setVisibleCloneModal(true);
                      }}
                    >
                      {t('modelStore.CloneToFolder')}
                    </Button> */}
                  </Flex>
                </Flex>
                <Row gutter={[token.marginLG, token.marginLG]}>
                  <Col {...colSize}>
                    <Flex direction="column" align="stretch" gap={'xs'}>
                      {!!model_card?.description ? (
                        <>
                          <Typography.Title level={5} style={{ marginTop: 0 }}>
                            {t('modelStore.Description')}
                          </Typography.Title>
                          <Card
                            size="small"
                            style={{
                              whiteSpace: 'pre-wrap',
                              minHeight: screen.lg ? 100 : undefined,
                              height: screen.lg
                                ? 'calc(100vh - 590px)'
                                : undefined,
                              maxHeight: 'calc(100vh - 590px)',
                              overflow: 'auto',
                            }}
                          >
                            <Typography.Paragraph
                              ellipsis={{
                                rows: screen.lg ? 11 : 3,
                                expandable: 'collapsible',
                                symbol: (expanded) => (
                                  <Button size="small" type="link">
                                    {expanded
                                      ? t('button.Collapse')
                                      : t('button.Expand')}
                                  </Button>
                                ),
                              }}
                            >
                              {model_card?.description}
                            </Typography.Paragraph>
                          </Card>
                        </>
                      ) : null}
                      <Descriptions
                        style={{ marginTop: token.marginMD }}
                        // title={t('modelStore.Metadata')}
                        column={1}
                        size="small"
                        bordered
                        items={[
                          {
                            key: 'author',
                            label: t('modelStore.Author'),
                            children: model_card?.author,
                          },
                          {
                            key: 'version',
                            label: t('modelStore.Version'),
                            children: model_card?.version,
                          },
                          {
                            key: 'architecture',
                            label: t('environment.Architecture'),
                            children: model_card?.architecture,
                          },
                          {
                            key: 'frameworks',
                            label: t('modelStore.Framework'),
                            children: (
                              <Flex direction="row" gap={'xs'}>
                                {_.map(
                                  _.filter(
                                    _.castArray(model_card?.framework),
                                    (v) => !_.isEmpty(v),
                                  ),
                                  (framework, index) => {
                                    const targetImageKey = framework?.replace(
                                      /\s*\d+\s*$/,
                                      '',
                                    );
                                    const imageInfo = _.find(
                                      metadata?.imageInfo,
                                      (imageInfo) =>
                                        imageInfo?.name === targetImageKey,
                                    );
                                    const uniqueKey = `${framework}-${index}`;
                                    return imageInfo?.icon ? (
                                      <Flex gap={'xxs'} key={uniqueKey}>
                                        <img
                                          style={{
                                            width: '1em',
                                            height: '1em',
                                          }}
                                          src={
                                            'resources/icons/' + imageInfo?.icon
                                          }
                                          alt={framework || ''}
                                        />
                                        {framework}
                                      </Flex>
                                    ) : (
                                      <Typography.Text key={uniqueKey}>
                                        {framework}
                                      </Typography.Text>
                                    );
                                  },
                                )}
                              </Flex>
                            ),
                          },
                          {
                            key: 'created',
                            label: t('modelStore.Created'),
                            children: dayjs(model_card?.created_at).format(
                              'lll',
                            ),
                          },
                          {
                            key: 'last_modified',
                            label: t('modelStore.LastModified'),
                            children: dayjs(model_card?.modified_at).format(
                              'lll',
                            ),
                          },
                          {
                            key: 'min_resource',
                            label: t('modelStore.MinResource'),
                            children: (
                              <Flex gap="xs">
                                {model_card?.min_resource &&
                                  _.map(
                                    JSON.parse(model_card?.min_resource),
                                    (value, type) => {
                                      return (
                                        <ResourceNumber
                                          key={type}
                                          // @ts-ignore
                                          type={type}
                                          value={_.toString(value)}
                                        />
                                      );
                                    },
                                  )}
                              </Flex>
                            ),
                          },
                        ]}
                      />
                    </Flex>
                  </Col>
                  {!!model_card?.readme ? (
                    <Col {...colSize}>
                      <Card
                        size="small"
                        title={
                          <Flex direction="row" gap={'xs'}>
                            <FileOutlined />
                            README.md
                          </Flex>
                        }
                        styles={{
                          body: {
                            padding: token.paddingLG,
                            overflow: 'auto',
                            height: screen.lg
                              ? 'calc(100vh - 287px)'
                              : undefined,
                            minHeight: 200,
                          },
                        }}
                      >
                        <Markdown>{model_card?.readme || ''}</Markdown>
                      </Card>
                    </Col>
                  ) : null}
                </Row>
              </>
            ),
          },
        ]}
      />
      <Suspense>
        <ModelCloneModal
          vfolderNode={model_card?.vfolder_node || null}
          deprecatedVFolderInfo={{
            id: model_card?.vfolder?.id || '',
            host: model_card?.vfolder?.host || '',
            name: model_card?.vfolder?.name || '',
          }}
          title={t('modelStore.CloneAsFolder')}
          open={visibleCloneModal}
          onOk={() => {
            setVisibleCloneModal(false);
          }}
          onCancel={() => {
            setVisibleCloneModal(false);
          }}
        />
      </Suspense>
    </BAIModal>
  );
};

export default ModelCardModal;
