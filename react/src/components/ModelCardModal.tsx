import { useBackendAIImageMetaData } from '../hooks';
import { useUpdatableState } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import ModelCardChat from './ModelCardChat';
import ModelCloneModal from './ModelCloneModal';
import ModelTryContent from './ModelTryContent';
import ResourceNumber from './ResourceNumber';
import { ModelCardModalFragment$key } from './__generated__/ModelCardModalFragment.graphql';
import { BankOutlined, FileOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Grid,
  Tag,
  Typography,
  Tabs,
  theme,
  Skeleton,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import { FolderX } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface ModelCardModalProps extends BAIModalProps {
  modelCardModalFrgmt?: ModelCardModalFragment$key | null;
  onRequestClose: () => void;
}
const ModelCardModal: React.FC<ModelCardModalProps> = ({
  modelCardModalFrgmt = null,
  onRequestClose,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [visibleCloneModal, setVisibleCloneModal] = useState(false);

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
      <Suspense fallback={<Skeleton active />}>
        <Flex
          direction="row"
          wrap="wrap"
          align="stretch"
          gap={'sm'}
          style={{ width: '100%' }}
        >
          <Flex
            direction="row"
            wrap="wrap"
            align="center"
            gap={'sm'}
            style={{ flex: 2, width: '100%' }}
          >
            {model_card?.name === 'Talkativot UI' ? (
              <iframe
                src="https://talkativot-aiot-demo.asia03.app.backend.ai/chat"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="Talkativot AIOT Demo"
              />
            ) : (
              <ModelCardChat
                basePath={
                  model_card?.name?.includes('stable-diffusion-3-medium')
                    ? 'generate-image'
                    : 'v1'
                }
                modelName={
                  model_card?.name === 'stable-diffusion-3-medium'
                    ? 'stable-diffusion-3m'
                    : model_card?.name === 'Llama-3.2-11B-Vision-Instruct'
                      ? 'llama-vision-11b'
                      : model_card?.name === 'Meta-Llama-3-8B-Instruct'
                        ? 'llama-3-8b'
                        : model_card?.name || ''
                }
              />
            )}
            <ModelTryContent
              modelStorageHost={model_card?.vfolder?.host as string}
              modelName={model_card?.name as string}
              minAIAcclResource={(() => {
                // FIXME: need to get proper FGPU based on actual memory, not FGPU count.

                const minResource = _.ceil(
                  _.toNumber(
                    JSON.parse(model_card?.min_resource ?? '{}')['cuda.shares'],
                  ),
                  0,
                );
                if (_.isNaN(minResource) || minResource === 0) {
                  return 10;
                }
                // FIXME: temporally set 12 as minimum resource for Meta-Llama-3-8B-Instruct
                if (model_card?.name === 'Meta-Llama-3-8B-Instruct') {
                  return 12;
                }
                return minResource;
              })()}
            />
          </Flex>
          <Divider type="vertical" style={{ height: '100%' }} />
          <Flex
            direction="column"
            wrap="wrap"
            align="center"
            gap={'sm'}
            style={{ flex: 2, width: '100%' }}
          >
            {model_card?.error_msg ? (
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
                  <Flex direction="row" justify="end" gap={'sm'}></Flex>
                </Flex>
                <Flex
                  direction="column"
                  wrap="wrap"
                  align="center"
                  gap={'sm'}
                  style={{ width: '100%' }}
                >
                  <Descriptions
                    style={{ marginTop: token.marginMD, width: '100%' }}
                    column={2}
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
                                      src={'resources/icons/' + imageInfo?.icon}
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
                        children: dayjs(model_card?.created_at).format('lll'),
                      },
                      {
                        key: 'last_modified',
                        label: t('modelStore.LastModified'),
                        children: dayjs(model_card?.modified_at).format('lll'),
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
                  {!!model_card?.readme ? (
                    <Card
                      size="small"
                      title={
                        <Flex direction="row" gap={'xs'}>
                          <FileOutlined />
                          README.md
                        </Flex>
                      }
                      style={{
                        width: '100%',
                        marginTop: token.marginMD,
                      }}
                      bodyStyle={{
                        padding: token.paddingLG,
                        overflowBlock: 'scroll',
                        overflowY: 'auto',
                        height: '300px',
                        minHeight: 200,
                      }}
                    >
                      <Markdown>{model_card?.readme || ''}</Markdown>
                    </Card>
                  ) : null}
                </Flex>
              </>
            )}
          </Flex>
        </Flex>
      </Suspense>
      <Suspense>
        <ModelCloneModal
          vfolderNode={model_card?.vfolder_node || null}
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
