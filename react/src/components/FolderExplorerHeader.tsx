import { FolderExplorerHeaderFragment$key } from '../__generated__/FolderExplorerHeaderFragment.graphql';
import EditableVFolderName from './EditableVFolderName';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import FileBrowserButton from './FileBrowserButton';
import SFTPServerButton from './SFTPServerButton';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import { theme, Typography, Skeleton, Grid } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
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
  const { lg } = Grid.useBreakpoint();

  const vfolderNode = useFragment(
    graphql`
      fragment FolderExplorerHeaderFragment on VirtualFolderNode {
        id
        user
        permission
        row_id @required(action: THROW)
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
          <Suspense fallback={<Skeleton.Button active />}>
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
