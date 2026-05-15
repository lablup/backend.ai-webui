/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelCardDrawerFragment$key } from '../__generated__/ModelCardDrawerFragment.graphql';
import { ModelCardDrawerQuery } from '../__generated__/ModelCardDrawerQuery.graphql';
import { useBackendAIImageMetaData } from '../hooks';
import DeploymentSettingModal from './DeploymentSettingModal';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import ModelBrandIcon from './ModelBrandIcon';
import ModelCardDeployModal from './ModelCardDeployModal';
import VFolderNodeIdenticonV2 from './VFolderNodeIdenticonV2';
import { BankOutlined, FileOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Card,
  Descriptions,
  Drawer,
  type DrawerProps,
  Skeleton,
  Tag,
  Typography,
} from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAILink,
  BAIResourceNumberWithIcon,
  BAIUnmountAfterClose,
  filterOutEmpty,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import Markdown from 'markdown-to-jsx';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface ModelCardDrawerProps extends Omit<DrawerProps, 'children'> {
  modelCardId: string | undefined;
}

const ModelCardDrawer: React.FC<ModelCardDrawerProps> = ({
  modelCardId,
  open,
  onClose,
  ...drawerProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const [imageMetaData] = useBackendAIImageMetaData();
  const { generateFolderPath } = useFolderExplorerOpener();
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [
    isCreateDeploymentOpen,
    { toggle: toggleCreateDeployment, setLeft: closeCreateDeployment },
  ] = useToggle(false);

  // Defer `open` so the lazy query only fires once the drawer has actually
  // committed to opening. `loading={deferredOpen !== open}` then lets the
  // drawer show its built-in skeleton during the transition instead of an
  // inner Suspense fallback (FR-2869 review).
  const deferredOpen = useDeferredValue(open);

  const drawerData = useLazyLoadQuery<ModelCardDrawerQuery>(
    graphql`
      query ModelCardDrawerQuery($id: UUID!) {
        modelCardV2(id: $id) {
          ...ModelCardDrawerFragment
        }
      }
    `,
    { id: modelCardId ?? '' },
    {
      // Skip the network round-trip until the drawer has actually committed
      // to opening and a model-card UUID is known. The empty-string fallback
      // for `id` is never sent in that case because `store-only` short-
      // circuits the fetch.
      fetchPolicy:
        deferredOpen && open && modelCardId
          ? 'store-and-network'
          : 'store-only',
    },
  );

  const modelCardDrawerFrgmt: ModelCardDrawerFragment$key | null =
    drawerData.modelCardV2 ?? null;

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
          ...VFolderNodeIdenticonV2Fragment
        }
        availablePresets(orderBy: [{ field: RANK, direction: "ASC" }]) {
          edges {
            node {
              id
              name
              description
              runtimeVariantId
              ...DeploymentPresetDetailModalFragment
            }
          }
        }
      }
    `,
    modelCardDrawerFrgmt,
  );

  const presets =
    modelCard?.availablePresets?.edges
      ?.map((e) => e?.node)
      .filter((node): node is NonNullable<typeof node> => node != null) ?? [];

  return (
    <>
      <Drawer
        destroyOnHidden
        placement="right"
        size={800}
        {...drawerProps}
        open={open}
        loading={deferredOpen !== open}
        onClose={(e) => {
          setDeployModalOpen(false);
          closeCreateDeployment();
          onClose?.(e);
        }}
        title={
          <BAIFlex
            direction="row"
            align="center"
            gap="xs"
            style={{ flex: 1, minWidth: 0 }}
          >
            <ModelBrandIcon modelName={modelCard?.name ?? ''} />
            <Typography.Text strong ellipsis>
              {modelCard?.metadata?.title || modelCard?.name}
            </Typography.Text>
          </BAIFlex>
        }
        extra={
          <BAIButton
            type="primary"
            disabled={!modelCard?.id}
            onClick={() => setDeployModalOpen(true)}
          >
            {t('modelStore.Deploy')}
          </BAIButton>
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
                            <VFolderNodeIdenticonV2
                              vfolderNodeIdenticonFrgmt={modelCard.vfolder}
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
      <BAIUnmountAfterClose>
        <ModelCardDeployModal
          open={deployModalOpen}
          onClose={() => setDeployModalOpen(false)}
          modelCardRowId={modelCard?.id ? toLocalId(modelCard.id) : undefined}
          availablePresets={presets.map((p) => ({
            ...p,
            description: p.description ?? null,
          }))}
          onDeployed={(_deploymentId) => {
            setDeployModalOpen(false);
            onClose();
          }}
          onRequestCreateDeployment={toggleCreateDeployment}
        />
      </BAIUnmountAfterClose>
      <DeploymentSettingModal
        open={isCreateDeploymentOpen}
        onRequestClose={toggleCreateDeployment}
      />
    </>
  );
};

export default ModelCardDrawer;
