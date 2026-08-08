/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FolderExplorerHeaderFragment$key } from '../__generated__/FolderExplorerHeaderFragment.graphql';
import { theme, useBAIBreakpoint } from '../theme-shim';
import EditableVFolderName from './EditableVFolderName';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import FileBrowserButton from './FileBrowserButton';
import SFTPServerButton from './SFTPServerButton';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import BAISkeleton from './astryx-bui/BAISkeletonAstryx';
// FRONTIER RESIDUE (MAPPING §8): the only remaining antd symbol here is
// `Typography.Title`, and it is not rendered by this file — it is passed as the
// `component` argument to the still-antd `EditableVFolderName`, whose
// polymorphic `component?: typeof Typography.Text | typeof Typography.Title`
// prop is the contract. `EditableVFolderNameV2` already replaced that
// polymorphism with `variant="title"` (see `FolderExplorerHeaderV2`); this
// import disappears when the V1 editable name follows. Converting it here
// would mean editing a component outside this batch and its other consumers.
import { Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { graphql, useFragment } from 'react-relay';

interface FolderExplorerHeaderProps {
  vfolderNodeFrgmt?: FolderExplorerHeaderFragment$key | null;
  titleStyle?: React.CSSProperties;
}

const FolderExplorerHeader: React.FC<FolderExplorerHeaderProps> = ({
  vfolderNodeFrgmt,
  titleStyle,
}) => {
  'use memo';

  const { token } = theme.useToken();
  // antd `Grid.useBreakpoint` → `useBAIBreakpoint` (RESPONSIVE-POLICY R2);
  // Astryx `useMediaQuery` returns false on first render and flashes.
  const { lg } = useBAIBreakpoint();

  const vfolderNode = useFragment(
    graphql`
      fragment FolderExplorerHeaderFragment on VirtualFolderNode {
        id
        user
        permission
        unmanaged_path @since(version: "25.04.0")
        ...VFolderNameTitleNodeFragment
        ...VFolderNodeIdenticonFragment
        ...EditableVFolderNameFragment
        ...FileBrowserButtonFragment
        ...SFTPServerButtonFragment
      }
    `,
    vfolderNodeFrgmt,
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
          <VFolderNodeIdenticon
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
          <EditableVFolderName
            vfolderFrgmt={vfolderNode}
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
        {vfolderNode && !vfolderNode?.unmanaged_path ? (
          <Suspense fallback={<BAISkeleton variant="button" />}>
            <ErrorBoundaryWithNullFallback>
              <FileBrowserButton vfolderFrgmt={vfolderNode} showTitle={lg} />
            </ErrorBoundaryWithNullFallback>
            <ErrorBoundaryWithNullFallback>
              <SFTPServerButton vfolderFrgmt={vfolderNode} showTitle={lg} />
            </ErrorBoundaryWithNullFallback>
          </Suspense>
        ) : null}
      </BAIFlex>
    </BAIFlex>
  );
};

export default FolderExplorerHeader;
