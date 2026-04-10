/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelCardDrawerFragment$key } from '../__generated__/ModelCardDrawerFragment.graphql';
import { useBackendAIImageMetaData } from '../hooks';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import ModelBrandIcon from './ModelBrandIcon';
import { BankOutlined, FileOutlined } from '@ant-design/icons';
import { shapes } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Skeleton,
  Tag,
  Typography,
  theme,
} from 'antd';
import {
  BAIFlex,
  BAILink,
  BAIResourceNumberWithIcon,
  filterOutEmpty,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import Markdown from 'markdown-to-jsx';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface ModelCardDrawerProps {
  modelCardDrawerFrgmt: ModelCardDrawerFragment$key | null;
  open: boolean;
  onClose: () => void;
}

const ModelCardDrawer: React.FC<ModelCardDrawerProps> = ({
  modelCardDrawerFrgmt,
  open,
  onClose,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [imageMetaData] = useBackendAIImageMetaData();
  const { generateFolderPath } = useFolderExplorerOpener();

  const modelCard = useFragment(
    graphql`
      fragment ModelCardDrawerFragment on ModelCardV2 {
        id
        name
        metadata {
          title
          author
          description
          task
          category
          architecture
          framework
          label
          license
          modelVersion
        }
        minResource {
          resourceType
          quantity
        }
        readme
        createdAt
        updatedAt
        vfolder {
          id
          metadata {
            name
          }
        }
        availablePresets(limit: 1) {
          count
        }
      }
    `,
    modelCardDrawerFrgmt,
  );

  const hasNoPresets =
    !modelCard?.availablePresets || modelCard.availablePresets.count === 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      placement="right"
      size={800}
      title={
        <BAIFlex direction="row" align="center" gap="xs">
          <ModelBrandIcon modelName={modelCard?.name ?? ''} />
          <Typography.Text strong ellipsis>
            {modelCard?.metadata?.title || modelCard?.name}
          </Typography.Text>
        </BAIFlex>
      }
      extra={
        <Button type="primary" disabled>
          {t('modelStore.Deploy')}
        </Button>
      }
    >
      {modelCard && (
        <BAIFlex direction="column" align="stretch" gap="sm">
          {hasNoPresets && (
            <Alert
              type="error"
              showIcon
              title={t('modelStore.NoCompatiblePresets')}
            />
          )}

          {modelCard.metadata?.description && (
            <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
              {modelCard.metadata.description}
            </Typography.Paragraph>
          )}

          <BAIFlex direction="row" wrap="wrap" gap="xs">
            {modelCard.metadata?.task && (
              <Tag style={{ marginRight: 0 }}>{modelCard.metadata.task}</Tag>
            )}
            {modelCard.metadata?.category && (
              <Tag style={{ marginRight: 0 }}>
                {modelCard.metadata.category}
              </Tag>
            )}
            {modelCard.metadata?.label &&
              _.map(modelCard.metadata.label, (label) => (
                <Tag key={label} style={{ marginRight: 0 }}>
                  {label}
                </Tag>
              ))}
            {modelCard.metadata?.license && (
              <Tag icon={<BankOutlined />} style={{ marginRight: 0 }}>
                {modelCard.metadata.license}
              </Tag>
            )}
          </BAIFlex>

          <Descriptions
            size="small"
            bordered
            column={1}
            items={filterOutEmpty([
              {
                key: 'author',
                label: t('modelStore.Author'),
                children: modelCard.metadata?.author,
              },
              {
                key: 'architecture',
                label: t('modelStore.Architecture'),
                children: modelCard.metadata?.architecture,
              },
              {
                key: 'framework',
                label: t('modelStore.Framework'),
                children: (
                  <BAIFlex direction="row" gap="xs">
                    {_.map(
                      _.filter(
                        modelCard.metadata?.framework,
                        (v) => !_.isEmpty(v),
                      ),
                      (framework, index) => {
                        const targetImageKey = framework?.replace(
                          /\s*\d+\s*$/,
                          '',
                        );
                        const imageInfo = _.find(
                          imageMetaData?.imageInfo,
                          (info) => info?.name === targetImageKey,
                        );
                        const uniqueKey = `${framework}-${index}`;
                        return imageInfo?.icon ? (
                          <BAIFlex gap="xxs" key={uniqueKey}>
                            <img
                              style={{ width: '1em', height: '1em' }}
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
                key: 'version',
                label: t('modelStore.Version'),
                children: modelCard.metadata?.modelVersion,
              },
              {
                key: 'created',
                label: t('modelStore.Created'),
                children: modelCard.createdAt
                  ? dayjs(modelCard.createdAt).format('lll')
                  : undefined,
              },
              {
                key: 'lastModified',
                label: t('modelStore.LastModified'),
                children: modelCard.updatedAt
                  ? dayjs(modelCard.updatedAt).format('lll')
                  : '-',
              },
              {
                key: 'modelFolder',
                label: t('modelStore.ModelFolder'),
                children: modelCard.vfolder?.id ? (
                  <ErrorBoundaryWithNullFallback>
                    <Suspense fallback={<Skeleton.Input active size="small" />}>
                      <BAILink
                        type="hover"
                        to={generateFolderPath(toLocalId(modelCard.vfolder.id))}
                      >
                        <BAIFlex gap="xs" align="center">
                          <img
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            style={{
                              borderRadius: '0.25em',
                              width: '1em',
                              height: '1em',
                              borderWidth: 0.5,
                              borderStyle: 'solid',
                              borderColor: token.colorBorder,
                              userSelect: 'none',
                            }}
                            src={createAvatar(shapes, {
                              seed: modelCard.vfolder.id,
                              shape3: [],
                            })?.toDataUri()}
                            alt="VFolder Identicon"
                          />
                          {modelCard.vfolder.metadata?.name}
                        </BAIFlex>
                      </BAILink>
                    </Suspense>
                  </ErrorBoundaryWithNullFallback>
                ) : (
                  '-'
                ),
              },
              {
                key: 'minResource',
                label: t('modelStore.MinResource'),
                children:
                  modelCard.minResource && modelCard.minResource.length > 0 ? (
                    <BAIFlex gap="sm" wrap="wrap">
                      {_.map(modelCard.minResource, (entry) => (
                        <BAIResourceNumberWithIcon
                          key={entry.resourceType}
                          type={entry.resourceType}
                          value={entry.quantity}
                        />
                      ))}
                    </BAIFlex>
                  ) : undefined,
              },
            ])}
          />

          {modelCard.readme && (
            <Card
              size="small"
              title={
                <BAIFlex direction="row" gap="xs">
                  <FileOutlined />
                  README.md
                </BAIFlex>
              }
              style={{ width: '100%' }}
            >
              <Markdown options={{ disableParsingRawHTML: true }}>
                {modelCard.readme}
              </Markdown>
            </Card>
          )}
        </BAIFlex>
      )}
    </Drawer>
  );
};

export default ModelCardDrawer;
