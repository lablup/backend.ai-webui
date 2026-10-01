/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx. `Grid.useBreakpoint` becomes
 `useBAIBreakpoint` (RESPONSIVE-POLICY R2), `Skeleton.Button` becomes the
 `BAISkeleton` button variant, and the editable title uses the rebuilt
 `EditableVFolderNameV2` (`variant="title"` replaces the antd
 `component={Typography.Title}` polymorphism).
*/
import { FolderExplorerHeaderV2Fragment$key } from '../__generated__/FolderExplorerHeaderV2Fragment.graphql';
import { ProjectContextOrNull } from '../types/projectContext';
import EditableVFolderNameV2 from './EditableVFolderNameV2';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import FileBrowserButtonV2 from './FileBrowserButtonV2';
import SFTPServerButtonV2 from './SFTPServerButtonV2';
import VFolderNodeIdenticonV2 from './VFolderNodeIdenticonV2';
import { IconButton } from '@lablup/ui-common/IconButton';
import { HStack } from '@lablup/ui-common/Stack';
import { Heading } from '@lablup/ui-common/Text';
import {
  BAISkeleton,
  BAIVFolderIdenticon,
  useBAIBreakpoint,
} from 'backend.ai-ui';
import { PencilIcon } from 'lucide-react';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface FolderExplorerHeaderV2Props {
  vfolderNodeFrgmt?: FolderExplorerHeaderV2Fragment$key | null;
  /**
   * Drawn when `vfolderV2` nulls the whole node and only the legacy node
   * answers (FR-3997): rename and launch buttons stay, disabled with a reason.
   */
  legacyVFolder?: {
    id: string;
    name?: string | null;
    unmanaged_path?: string | null;
  } | null;
  titleStyle?: React.CSSProperties;
  /**
   * Explicit project prop contract (ADR-0001, FR-3412/FR-3413): pass-through
   * for the FileBrowser/SFTP session-launch buttons (`null` renders them
   * disabled with `noProjectTooltip` as the reason) and for the rename
   * gating of `EditableVFolderNameV2` (`null` drops the project-membership
   * branch — owner/super-admin keep their power).
   */
  project: ProjectContextOrNull;
  noProjectTooltip?: string;
}

const FolderExplorerHeaderV2: React.FC<FolderExplorerHeaderV2Props> = ({
  vfolderNodeFrgmt,
  legacyVFolder,
  titleStyle,
  project,
  noProjectTooltip,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { lg } = useBAIBreakpoint();

  const vfolderNode = useFragment(
    graphql`
      fragment FolderExplorerHeaderV2Fragment on VFolder {
        id @required(action: THROW)
        unmanagedPath
        ...VFolderNodeIdenticonV2Fragment
        ...EditableVFolderNameV2Fragment
        ...FileBrowserButtonV2Fragment
        ...SFTPServerButtonV2Fragment
      }
    `,
    vfolderNodeFrgmt ?? null,
  );

  const disabledTooltip = vfolderNode
    ? noProjectTooltip
    : t('explorer.FolderDetailUnavailable');

  return (
    <HStack
      justify="between"
      align="center"
      // Legacy `BAIFlex gap={token.marginMD}` = 16px = `--spacing-4` (step 4).
      // The conversion had landed on step 5 (20px).
      gap={4}
      width="100%"
      // Wraps so the FileBrowser/SFTP groups drop under the title instead of
      // clipping into the modal's close button at narrow widths (FR-3606).
      wrap="wrap"
      {...({ 'data-testid': 'folder-explorer-header' } as object)}
    >
      <HStack
        align="center"
        // Legacy `BAIFlex gap="xs"` = antd `sizeXS` = 8px = step 2.
        gap={2}
        // reset font weight set by the modal header; the min width keeps a
        // readable slice of the name and is the wrap trigger for the actions
        style={{ flex: 1, minWidth: 180, fontWeight: 'normal', ...titleStyle }}
        {...({ 'data-testid': 'folder-explorer-title' } as object)}
      >
        {vfolderNode ? (
          <VFolderNodeIdenticonV2
            vfolderNodeIdenticonFrgmt={vfolderNode}
            style={{
              fontSize: 'var(--font-size-xl)',
            }}
          />
        ) : legacyVFolder ? (
          <BAIVFolderIdenticon
            seed={legacyVFolder.id}
            style={{ fontSize: 'var(--font-size-xl)' }}
          />
        ) : (
          <span
            style={{
              display: 'inline-flex',
              borderColor: 'var(--color-border)',
              borderWidth: 1,
              borderStyle: 'solid',
              width: 'var(--font-size-2xl)',
              height: 'var(--font-size-2xl)',
              borderRadius: 'var(--radius-inner)',
            }}
          />
        )}
        {vfolderNode && (
          <EditableVFolderNameV2
            vfolderNodeFrgmt={vfolderNode}
            project={project}
            enableLink={false}
            variant="title"
            style={{
              margin: 0,
              width: '100%',
            }}
            editable
          />
        )}
        {!vfolderNode && legacyVFolder && (
          <HStack gap={1} align="center" style={{ minWidth: 0 }}>
            <Heading level={3} maxLines={1}>
              {legacyVFolder.name}
            </Heading>
            <IconButton
              label={t('button.Edit')}
              tooltip={t('explorer.FolderDetailUnavailable')}
              icon={<PencilIcon />}
              size="sm"
              variant="ghost"
              isDisabled
            />
          </HStack>
        )}
      </HStack>
      <HStack
        justify="end"
        align="center"
        // Legacy `BAIFlex gap={token.marginSM}` = 12px = `--spacing-3` (step 3).
        // The conversion had landed on step 2 (8px), crowding the two buttons.
        gap={3}
        // Keeps the group right-aligned on its own row once wrapped.
        style={{ marginLeft: 'auto' }}
        {...({ 'data-testid': 'folder-explorer-actions' } as object)}
      >
        {(vfolderNode && !vfolderNode.unmanagedPath) ||
        (!vfolderNode && legacyVFolder && !legacyVFolder.unmanaged_path) ? (
          <Suspense fallback={<BAISkeleton variant="button" />}>
            <ErrorBoundaryWithNullFallback>
              <FileBrowserButtonV2
                vfolderNodeFrgmt={vfolderNode ?? null}
                showTitle={lg}
                project={project}
                disabledTooltip={disabledTooltip}
              />
            </ErrorBoundaryWithNullFallback>
            <ErrorBoundaryWithNullFallback>
              <SFTPServerButtonV2
                vfolderNodeFrgmt={vfolderNode ?? null}
                showTitle={lg}
                project={project}
                disabledTooltip={disabledTooltip}
              />
            </ErrorBoundaryWithNullFallback>
          </Suspense>
        ) : null}
      </HStack>
    </HStack>
  );
};

export default FolderExplorerHeaderV2;
