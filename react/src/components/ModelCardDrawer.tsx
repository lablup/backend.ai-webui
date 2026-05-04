/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelCardDrawerFragment$key } from '../__generated__/ModelCardDrawerFragment.graphql';
import { useBackendAIImageMetaData } from '../hooks';
import useDeploymentLauncher from '../hooks/useDeploymentLauncher';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import ModelBrandIcon from './ModelBrandIcon';
import ModelCardDeployModal from './ModelCardDeployModal';
import {
  BankOutlined,
  EllipsisOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { shapes } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import {
  Card,
  Descriptions,
  Drawer,
  Dropdown,
  Skeleton,
  Space,
  Tag,
  Typography,
  theme,
} from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAILink,
  BAIResourceNumberWithIcon,
  filterOutEmpty,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import Markdown from 'markdown-to-jsx';
import React, { Suspense, useState } from 'react';
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
  const { deployInstantly, openLauncher, isDeploying, supportsQuickDeploy } =
    useDeploymentLauncher();

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
        availablePresets(orderBy: [{ field: RANK, direction: "ASC" }]) {
          count
          edges {
            node {
              id
              name
              description
              rank
              runtimeVariantId
            }
          }
        }
      }
    `,
    modelCardDrawerFrgmt,
  );

  const hasNoAvailablePresets =
    !modelCard?.availablePresets || modelCard.availablePresets.count === 0;
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  const presets =
    modelCard?.availablePresets?.edges
      ?.map((e) => e?.node)
      .filter(
        (
          node,
        ): node is {
          readonly id: string;
          readonly name: string;
          readonly description: string | null;
          readonly rank: number;
          readonly runtimeVariantId: string;
        } => node != null,
      ) ?? [];

  return (
    <>
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
          hasNoAvailablePresets ? (
            // When no presets are available, show a single "Configure and
            // deploy" button that navigates to the full launcher so the user
            // can set up a deployment manually.
            <BAIButton
              type="primary"
              disabled={!modelCard?.vfolder?.id}
              onClick={() => {
                const modelFolderId = toLocalId(modelCard?.vfolder?.id ?? '');
                if (!modelFolderId) return;
                openLauncher({ modelFolderId });
              }}
            >
              {t('modelStore.QuickDeployDetailed')}
            </BAIButton>
          ) : supportsQuickDeploy && modelCard?.vfolder?.id ? (
            // Flow 7 (FR-2684): [Deploy | ▼] split button backed by
            // useDeploymentLauncher. Primary action fires Quick Deploy via
            // createModelDeployment; the dropdown item navigates to the
            // full launcher page at /deployments/start?model=<folderId>.
            <Space.Compact>
              <BAIButton
                type="primary"
                loading={isDeploying}
                disabled={!modelCard?.id}
                action={async () => {
                  const modelFolderId = toLocalId(modelCard.vfolder?.id ?? '');
                  if (!modelFolderId) return;
                  const revisionPresetId = toLocalId(presets[0]?.id ?? '');
                  await deployInstantly({
                    modelFolderId,
                    revisionPresetId: revisionPresetId ?? undefined,
                  });
                }}
              >
                {t('modelStore.Deploy')}
              </BAIButton>
              <Dropdown
                disabled={!modelCard?.id || isDeploying}
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'configure',
                      label: t('modelStore.QuickDeployDetailed'),
                      onClick: () => {
                        const modelFolderId = toLocalId(
                          modelCard.vfolder?.id ?? '',
                        );
                        if (!modelFolderId) return;
                        openLauncher({ modelFolderId });
                      },
                    },
                  ],
                }}
              >
                <BAIButton type="primary" icon={<EllipsisOutlined />} />
              </Dropdown>
            </Space.Compact>
          ) : (
            // Legacy path (< manager 26.4.3): keep the pre-FR-2684
            // single-button behavior that opens the ModelCardDeployModal
            // so older backends remain functional until Quick Deploy is
            // universally available.
            <BAIButton
              type="primary"
              disabled={!modelCard?.id}
              onClick={() => setDeployModalOpen(true)}
            >
              {t('modelStore.Deploy')}
            </BAIButton>
          )
        }
      >
        {modelCard && (
          <BAIFlex direction="column" align="stretch" gap="sm">
            {modelCard.metadata?.description && (
              <Typography.Paragraph
                style={{ marginBottom: 0 }}
                type="secondary"
              >
                {modelCard.metadata.description}
              </Typography.Paragraph>
            )}

            <BAIFlex direction="row" wrap="wrap" gap="xs">
              {modelCard.metadata?.task && <Tag>{modelCard.metadata.task}</Tag>}
              {modelCard.metadata?.category && (
                <Tag>{modelCard.metadata.category}</Tag>
              )}
              {modelCard.metadata?.label &&
                _.map(modelCard.metadata.label, (label) => (
                  <Tag key={label} variant="filled">
                    {label}
                  </Tag>
                ))}
              {modelCard.metadata?.license && (
                <Tag icon={<BankOutlined />}>{modelCard.metadata.license}</Tag>
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
                      <Suspense
                        fallback={<Skeleton.Input active size="small" />}
                      >
                        <BAILink
                          type="hover"
                          to={generateFolderPath(
                            toLocalId(modelCard.vfolder.id),
                          )}
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
                    modelCard.minResource &&
                    modelCard.minResource.length > 0 ? (
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
      <ModelCardDeployModal
        open={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        modelCardRowId={modelCard?.id ? toLocalId(modelCard.id) : undefined}
        availablePresets={presets}
        onDeployed={(_deploymentId) => {
          setDeployModalOpen(false);
          onClose();
        }}
      />
    </>
  );
};

export default ModelCardDrawer;
