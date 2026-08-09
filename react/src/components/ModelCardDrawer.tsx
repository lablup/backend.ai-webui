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
import BAIDrawer from './astryx-bui/BAIDrawerAstryx';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { useToggle } from 'ahooks';
import {
  BAIFlex,
  BAILink,
  BAIResourceNumberWithIcon,
  BAIUnmountAfterClose,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Landmark, File } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

// PILOT-DECISION: props no longer extend antd `DrawerProps` (same tactic as
// `DeploymentRevisionDetailDrawer.tsx`, ticket 18) — grepped call site
// (ModelStoreListPageV2) only ever passes `modelCardId`/`open`/`onClose`.
interface ModelCardDrawerProps {
  modelCardId: string | undefined;
  open?: boolean;
  onClose?: () => void;
}

const ModelCardDrawer: React.FC<ModelCardDrawerProps> = ({
  modelCardId,
  open,
  onClose,
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
        ...ModelCardDeployModalFragment
      }
    `,
    modelCardDrawerFrgmt,
  );

  const heading = modelCard?.metadata?.title || modelCard?.name || '';
  const isLoadingCard = deferredOpen !== open;

  return (
    <>
      <BAIDrawer
        open={!!open}
        side="end"
        size={800}
        label={heading || t('modelStore.ModelDetails')}
        onClose={() => {
          setDeployModalOpen(false);
          closeCreateDeployment();
          onClose?.();
        }}
        title={
          <HStack gap={2} align="center" wrap="nowrap">
            <ModelBrandIcon modelName={modelCard?.name ?? ''} />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {heading}
            </span>
          </HStack>
        }
        extra={
          <Button
            variant="primary"
            label={t('modelStore.Deploy')}
            isDisabled={!modelCard?.id}
            // `clickAction` (not `onClick`) so the state update that mounts
            // `<ModelCardDeployModal>` (which suspends while its Relay
            // query loads) runs inside a transition — the drawer stays
            // interactive instead of falling into Suspense fallback.
            clickAction={async () => {
              setDeployModalOpen(true);
            }}
          />
        }
      >
        <VStack gap={4} align="stretch">
          {isLoadingCard ? (
            <BAISkeletonAstryx rows={6} />
          ) : (
            modelCard && (
              <BAIFlex direction="column" align="stretch" gap="sm">
                {modelCard.metadata?.description && (
                  <Text as="p" style={{ marginBottom: 0 }} color="secondary">
                    {modelCard.metadata.description}
                  </Text>
                )}

                <BAIFlex direction="row" wrap="wrap" gap="xs">
                  {modelCard.metadata?.task && (
                    <Badge variant="neutral" label={modelCard.metadata.task} />
                  )}
                  {modelCard.metadata?.category && (
                    <Badge
                      variant="neutral"
                      label={modelCard.metadata.category}
                    />
                  )}
                  {modelCard.metadata?.label &&
                    _.map(modelCard.metadata.label, (label) => (
                      <Badge key={label} variant="neutral" label={label} />
                    ))}
                  {modelCard.metadata?.license && (
                    <Badge
                      variant="neutral"
                      icon={<Landmark size="1em" />}
                      label={modelCard.metadata.license}
                    />
                  )}
                </BAIFlex>

                {/* antd `Descriptions bordered column={1} size="small"` ->
                    `MetadataList` (MAPPING.md §4, DIRECT). `bordered`/
                    `size="small"` have no destination — dropped. */}
                <MetadataList columns="single">
                  {modelCard.metadata?.author && (
                    <MetadataListItem label={t('modelStore.Author')}>
                      {modelCard.metadata.author}
                    </MetadataListItem>
                  )}
                  {modelCard.metadata?.architecture && (
                    <MetadataListItem label={t('modelStore.Architecture')}>
                      {modelCard.metadata.architecture}
                    </MetadataListItem>
                  )}
                  <MetadataListItem label={t('modelStore.Framework')}>
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
                            <Text key={uniqueKey}>{framework}</Text>
                          );
                        },
                      )}
                    </BAIFlex>
                  </MetadataListItem>
                  {modelCard.metadata?.modelVersion && (
                    <MetadataListItem label={t('modelStore.Version')}>
                      {modelCard.metadata.modelVersion}
                    </MetadataListItem>
                  )}
                  {modelCard.createdAt && (
                    <MetadataListItem label={t('modelStore.Created')}>
                      {dayjs(modelCard.createdAt).format('lll')}
                    </MetadataListItem>
                  )}
                  <MetadataListItem label={t('modelStore.LastModified')}>
                    {modelCard.updatedAt
                      ? dayjs(modelCard.updatedAt).format('lll')
                      : '-'}
                  </MetadataListItem>
                  <MetadataListItem label={t('modelStore.ModelFolder')}>
                    {modelCard.vfolder?.id ? (
                      <ErrorBoundaryWithNullFallback>
                        <Suspense
                          fallback={
                            <BAISkeletonAstryx variant="input" size="small" />
                          }
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
                    )}
                  </MetadataListItem>
                  {modelCard.minResource &&
                    modelCard.minResource.length > 0 && (
                      <MetadataListItem label={t('modelStore.MinResource')}>
                        <BAIFlex gap="sm" wrap="wrap">
                          {_.map(modelCard.minResource, (entry) => (
                            <BAIResourceNumberWithIcon
                              key={entry.resourceType}
                              type={entry.resourceType}
                              value={entry.quantity}
                            />
                          ))}
                        </BAIFlex>
                      </MetadataListItem>
                    )}
                </MetadataList>

                {modelCard.readme && (
                  <Card padding={4} style={{ width: '100%' }}>
                    <VStack gap={4} align="stretch">
                      <HStack gap={2} align="center">
                        <File size="1em" />
                        <Heading level={5}>README.md</Heading>
                      </HStack>
                      <Markdown options={{ disableParsingRawHTML: true }}>
                        {modelCard.readme}
                      </Markdown>
                    </VStack>
                  </Card>
                )}
              </BAIFlex>
            )
          )}
        </VStack>
      </BAIDrawer>
      {/* Local Suspense around the lazily-mounted modal so its initial
          Relay/`useProjectResourceGroups` suspend doesn't bubble up to the
          drawer-level Suspense fallback. The mount is triggered from a
          `Button.clickAction` (transition), but `BAIUnmountAfterClose` defers
          the mount via `useLayoutEffect` — that state update is no longer
          inside the transition, so we still need an explicit Suspense
          boundary here. */}
      <Suspense fallback={null}>
        <BAIUnmountAfterClose>
          <ModelCardDeployModal
            open={deployModalOpen}
            onClose={() => setDeployModalOpen(false)}
            modelCardFrgmt={modelCard}
            onDeployed={(_deploymentId) => {
              setDeployModalOpen(false);
              onClose?.();
            }}
          />
        </BAIUnmountAfterClose>
      </Suspense>
      <DeploymentSettingModal
        open={isCreateDeploymentOpen}
        onRequestClose={toggleCreateDeployment}
      />
    </>
  );
};

export default ModelCardDrawer;
