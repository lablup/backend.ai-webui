/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelCardModalFragment$key } from '../__generated__/ModelCardModalFragment.graphql';
import { useBackendAIImageMetaData } from '../hooks';
import { useModelCardMetadata } from '../hooks/useModelCardMetadata';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import ModelCardChat from './ModelCardChat';
import ModelCloneModal from './ModelCloneModal';
import ModelTryContentButton from './ModelTryContentButton';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import { BankOutlined, FileOutlined, CopyOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Grid,
  Tag,
  Typography,
  theme,
  Skeleton,
  Tooltip,
} from 'antd';
import {
  BAIFlex,
  BAILink,
  BAIModal,
  BAIModalProps,
  BAIResourceNumberWithIcon,
  filterOutEmpty,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { FolderX } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { useCurrentUserRole } from 'src/hooks/backendai';

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

  const [imageMetaData] = useBackendAIImageMetaData();
  const { generateFolderPath } = useFolderExplorerOpener();

  const screen = Grid.useBreakpoint();
  const { models: modelMetadataList } = useModelCardMetadata();
  const userRole = useCurrentUserRole();

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
          host
        }
        vfolder_node @since(version: "24.09.*") {
          id
          name
          ...ModelCloneModalVFolderFragment
          ...ModelTryContentButtonVFolderFragment
          ...VFolderNodeIdenticonFragment
        }
        error_msg @since(version: "24.03.7")
      }
    `,
    modelCardModalFrgmt,
  );

  const model = modelMetadataList.find(
    (item) => model_card?.name === item.name,
  );

  return (
    <BAIModal
      {...props}
      title={
        <BAIFlex direction="row" align="center" gap={'xs'}>
          {model_card?.title ? (
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
          )}
        </BAIFlex>
      }
      centered
      onCancel={onRequestClose}
      destroyOnHidden
      width={
        _.isEmpty(model_card?.readme) || _.isEmpty(model_card?.description)
          ? 800
          : screen.xxl
            ? '75%'
            : '90%'
      }
      footer={[
        // This button is used to clone-and-create/create the model service with the content of the model card.
        <ErrorBoundaryWithNullFallback key="model-try-content-button">
          <Suspense
            fallback={
              <Tooltip title={t('modelStore.CheckingSettings')}>
                <Button loading disabled />
              </Tooltip>
            }
          >
            <ModelTryContentButton
              vfolderNode={model_card?.vfolder_node || null}
            />
          </Suspense>
        </ErrorBoundaryWithNullFallback>,
        <Button
          key="clone"
          type="primary"
          ghost
          icon={<CopyOutlined />}
          disabled={!model_card?.vfolder?.cloneable}
          onClick={() => {
            setVisibleCloneModal(true);
          }}
        >
          {t('modelStore.CloneToFolder')}
        </Button>,
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
        <BAIFlex
          direction="row"
          wrap="wrap"
          align="stretch"
          gap={'sm'}
          style={{ width: '100%' }}
        >
          {modelMetadataList.some((item) => item.name === model_card?.name) && (
            <BAIFlex direction="row" wrap="wrap" align="center" gap={'sm'}>
              <ModelCardChat modelName={model?.serviceName} />
            </BAIFlex>
          )}
          <BAIFlex
            direction="column"
            wrap="wrap"
            align="center"
            gap={'sm'}
            style={{ flex: 2, width: '100%' }}
          >
            {model_card?.error_msg ? (
              <BAIFlex
                direction="column"
                wrap="wrap"
                align="stretch"
                gap={'sm'}
              >
                <Alert
                  title={model_card?.error_msg}
                  type="error"
                  showIcon
                  style={{ width: '100%' }}
                />
                <Empty
                  style={{ width: '100%' }}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </BAIFlex>
            ) : (
              <>
                <BAIFlex
                  direction="row"
                  wrap="wrap"
                  align="center"
                  gap={'xs'}
                  style={{ width: '100%' }}
                >
                  {model_card?.category && (
                    <Tag style={{ marginRight: 0 }}>{model_card?.category}</Tag>
                  )}
                  {model_card?.task && (
                    <Tag color="success" style={{ marginRight: 0 }}>
                      {model_card?.task}
                    </Tag>
                  )}
                  {model_card?.label &&
                    _.map(model_card?.label, (label) => (
                      <Tag key={label} color="blue" style={{ marginRight: 0 }}>
                        {label}
                      </Tag>
                    ))}
                  {model_card?.license && (
                    <Tag
                      icon={<BankOutlined />}
                      color="geekblue"
                      style={{ marginRight: 0 }}
                    >
                      {model_card?.license}
                    </Tag>
                  )}
                </BAIFlex>
                <BAIFlex
                  direction="column"
                  wrap="wrap"
                  align="center"
                  gap={'sm'}
                  style={{ width: '100%' }}
                >
                  <Descriptions
                    style={{ width: '100%' }}
                    column={2}
                    size="small"
                    bordered
                    items={filterOutEmpty([
                      userRole === 'superadmin' && {
                        key: 'vfolder.id',
                        label: t('modelStore.ModelFolder'),
                        children: model_card?.vfolder_node?.id ? (
                          <BAIFlex direction="row" align="center" gap={'xs'}>
                            <ErrorBoundaryWithNullFallback>
                              <Suspense fallback={<Skeleton active />}>
                                <BAILink
                                  type="hover"
                                  to={generateFolderPath(
                                    toLocalId(model_card.vfolder_node.id),
                                  )}
                                >
                                  <BAIFlex gap={'xs'}>
                                    <VFolderNodeIdenticon
                                      vfolderNodeIdenticonFrgmt={
                                        model_card.vfolder_node
                                      }
                                    />
                                    {model_card.vfolder_node.name}
                                  </BAIFlex>
                                </BAILink>
                              </Suspense>
                            </ErrorBoundaryWithNullFallback>
                          </BAIFlex>
                        ) : (
                          '-'
                        ),
                      },
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
                          <BAIFlex direction="row" gap={'xs'}>
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
                                  imageMetaData?.imageInfo,
                                  (imageInfo) =>
                                    imageInfo?.name === targetImageKey,
                                );
                                const uniqueKey = `${framework}-${index}`;
                                return imageInfo?.icon ? (
                                  <BAIFlex gap={'xxs'} key={uniqueKey}>
                                    <img
                                      style={{
                                        width: '1em',
                                        height: '1em',
                                      }}
                                      src={'resources/icons/' + imageInfo?.icon}
                                      alt={framework || ''}
                                    />
                                    {framework}
                                  </BAIFlex>
                                ) : (
                                  <Typography.Text key={uniqueKey}>
                                    {framework}
                                  </Typography.Text>
                                );
                              },
                            )}
                          </BAIFlex>
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
                          <BAIFlex gap="xs">
                            {model_card?.min_resource &&
                              _.map(
                                JSON.parse(model_card?.min_resource),
                                (value, type) => {
                                  return (
                                    <BAIResourceNumberWithIcon
                                      key={type}
                                      type={type}
                                      value={_.toString(value)}
                                    />
                                  );
                                },
                              )}
                          </BAIFlex>
                        ),
                      },
                    ])}
                  />
                  {model_card?.readme ? (
                    <Card
                      size="small"
                      title={
                        <BAIFlex direction="row" gap={'xs'}>
                          <FileOutlined />
                          README.md
                        </BAIFlex>
                      }
                      style={{
                        width: '100%',
                      }}
                      styles={{
                        body: {
                          padding: token.paddingLG,
                          overflowBlock: 'scroll',
                          overflowY: 'auto',
                          height: '300px',
                          minHeight: 200,
                        },
                      }}
                    >
                      <Markdown>{model_card?.readme || ''}</Markdown>
                    </Card>
                  ) : null}
                </BAIFlex>
              </>
            )}
          </BAIFlex>
        </BAIFlex>
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
