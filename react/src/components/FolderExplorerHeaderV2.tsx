/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FolderExplorerHeaderV2Fragment$key } from '../__generated__/FolderExplorerHeaderV2Fragment.graphql';
import EditableVFolderNameV2 from './EditableVFolderNameV2';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import FileBrowserButtonV2 from './FileBrowserButtonV2';
import SFTPServerButtonV2 from './SFTPServerButtonV2';
import VFolderNodeIdenticonV2 from './VFolderNodeIdenticonV2';
import { theme, Typography, Skeleton, Grid } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
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

  const { token } = theme.useToken();
  const { lg } = Grid.useBreakpoint();

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
    <BAIFlex
      data-testid="folder-explorer-header"
      justify="between"
      gap={token.marginMD}
      style={{ width: '100%' }}
    >
      <BAIFlex
        data-testid="folder-explorer-title"
        gap={'xs'}
        // reset font weight set by BAIModal header
        style={{ flex: 1, fontWeight: 'normal', ...titleStyle }}
      >
        {vfolderNode ? (
          <VFolderNodeIdenticonV2
            vfolderNodeIdenticonFrgmt={vfolderNode}
            style={{
              fontSize: token.fontSizeHeading4,
            }}
          />
        ) : (
          <BAIFlex
            style={{
              borderColor: token.colorBorderSecondary,
              borderWidth: 1,
              borderStyle: 'solid',
              width: token.fontSizeHeading3,
              height: token.fontSizeHeading3,
              borderRadius: token.borderRadius,
            }}
          />
        )}
        {vfolderNode && (
          <EditableVFolderNameV2
            vfolderNodeFrgmt={vfolderNode}
            enableLink={false}
            component={Typography.Title}
            level={3}
            style={{
              margin: 0,
              width: '100%',
            }}
            ellipsis
            editable={{
              triggerType: ['icon', 'text'],
            }}
            inputProps={{
              size: 'large',
              count: {
                max: 64,
                show: true,
              },
              style: {
                fontWeight: 'normal',
              },
            }}
          />
        )}
      </BAIFlex>
      <BAIFlex
        data-testid="folder-explorer-actions"
        justify="end"
        gap={token.marginSM}
      >
        {vfolderNode && !vfolderNode?.unmanagedPath ? (
          <Suspense fallback={<Skeleton.Button active />}>
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
      </BAIFlex>
    </BAIFlex>
  );
};

export default FolderExplorerHeaderV2;
