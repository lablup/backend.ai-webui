/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx. `Grid.useBreakpoint` becomes
 `useBAIBreakpoint` (RESPONSIVE-POLICY R2), `Skeleton.Button` becomes the
 `BAISkeletonAstryx` button variant, and the editable title uses the rebuilt
 `EditableVFolderNameV2` (`variant="title"` replaces the antd
 `component={Typography.Title}` polymorphism).
*/
import { FolderExplorerHeaderV2Fragment$key } from '../__generated__/FolderExplorerHeaderV2Fragment.graphql';
import { useBAIBreakpoint } from '../theme-shim';
import EditableVFolderNameV2 from './EditableVFolderNameV2';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import FileBrowserButtonV2 from './FileBrowserButtonV2';
import SFTPServerButtonV2 from './SFTPServerButtonV2';
import VFolderNodeIdenticonV2 from './VFolderNodeIdenticonV2';
import BAISkeleton from './astryx-bui/BAISkeletonAstryx';
import { HStack } from '@astryxdesign/core/Stack';
import React, { Suspense } from 'react';
import { graphql, useFragment } from 'react-relay';

interface FolderExplorerHeaderV2Props {
  vfolderNodeFrgmt?: FolderExplorerHeaderV2Fragment$key | null;
  titleStyle?: React.CSSProperties;
}

const FolderExplorerHeaderV2: React.FC<FolderExplorerHeaderV2Props> = ({
  vfolderNodeFrgmt,
  titleStyle,
}) => {
  'use memo';

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

  return (
    <HStack
      justify="between"
      align="center"
      // Legacy `BAIFlex gap={token.marginMD}` = 16px = `--spacing-4` (step 4).
      // The conversion had landed on step 5 (20px).
      gap={4}
      width="100%"
      {...({ 'data-testid': 'folder-explorer-header' } as object)}
    >
      <HStack
        align="center"
        // Legacy `BAIFlex gap="xs"` = antd `sizeXS` = 8px = step 2.
        gap={2}
        // reset font weight set by the modal header
        style={{ flex: 1, fontWeight: 'normal', ...titleStyle }}
        {...({ 'data-testid': 'folder-explorer-title' } as object)}
      >
        {vfolderNode ? (
          <VFolderNodeIdenticonV2
            vfolderNodeIdenticonFrgmt={vfolderNode}
            style={{
              fontSize: 'var(--font-size-xl)',
            }}
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
            enableLink={false}
            variant="title"
            style={{
              margin: 0,
              width: '100%',
            }}
            editable
          />
        )}
      </HStack>
      <HStack
        justify="end"
        align="center"
        // Legacy `BAIFlex gap={token.marginSM}` = 12px = `--spacing-3` (step 3).
        // The conversion had landed on step 2 (8px), crowding the two buttons.
        gap={3}
        {...({ 'data-testid': 'folder-explorer-actions' } as object)}
      >
        {vfolderNode && !vfolderNode?.unmanagedPath ? (
          <Suspense fallback={<BAISkeleton variant="button" />}>
            <ErrorBoundaryWithNullFallback>
              <FileBrowserButtonV2
                vfolderNodeFrgmt={vfolderNode}
                showTitle={lg}
              />
            </ErrorBoundaryWithNullFallback>
            <ErrorBoundaryWithNullFallback>
              <SFTPServerButtonV2
                vfolderNodeFrgmt={vfolderNode}
                showTitle={lg}
              />
            </ErrorBoundaryWithNullFallback>
          </Suspense>
        ) : null}
      </HStack>
    </HStack>
  );
};

export default FolderExplorerHeaderV2;
