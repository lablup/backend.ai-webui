import { FileBrowserButtonImageNodeFragment$key } from '../__generated__/FileBrowserButtonImageNodeFragment.graphql';
import { FolderExplorerHeaderFragment$key } from '../__generated__/FolderExplorerHeaderFragment.graphql';
import { SFTPButtonImageNodeFragment$key } from '../__generated__/SFTPButtonImageNodeFragment.graphql';
import FileBrowserButton from './FileBrowserButton';
import Flex from './Flex';
import SFTPButton from './SFTPButton';
import VFolderNameTitle from './VFolderNameTitle';
import { Skeleton, Grid, theme } from 'antd';
import React, { LegacyRef, Suspense } from 'react';
import { graphql, useFragment } from 'react-relay';

interface FolderExplorerHeaderProps {
  vfolderNodeFrgmt?: FolderExplorerHeaderFragment$key | null;
  fileBrowserImageNodesFrgmt?: FileBrowserButtonImageNodeFragment$key | null;
  sftpImageNodesFrgmt?: SFTPButtonImageNodeFragment$key | null;
  folderExplorerRef: LegacyRef<HTMLDivElement>;
}

const FolderExplorerHeader: React.FC<FolderExplorerHeaderProps> = ({
  vfolderNodeFrgmt,
  fileBrowserImageNodesFrgmt,
  sftpImageNodesFrgmt,
  folderExplorerRef,
}) => {
  const { token } = theme.useToken();
  const { lg } = Grid.useBreakpoint();

  const vfolderNode = useFragment(
    graphql`
      fragment FolderExplorerHeaderFragment on VirtualFolderNode {
        id
        user
        permission
        name
        unmanaged_path @since(version: "25.04.0")
        name
        ...VFolderNameTitleNodeFragment
      }
    `,
    vfolderNodeFrgmt,
  );

  return (
    <Flex justify="between" gap={token.marginMD} style={{ width: '100%' }}>
      <Flex gap={token.marginMD} style={{ flex: 1 }}>
        <Suspense fallback={<Skeleton.Input active />}>
          <VFolderNameTitle vfolderNodeFrgmt={vfolderNode} />
        </Suspense>
      </Flex>
      <Flex
        justify="end"
        gap={token.marginSM}
        style={{
          flex: lg ? 2 : 1,
        }}
      >
        {!vfolderNode?.unmanaged_path ? (
          <>
            <FileBrowserButton
              vfolderName={vfolderNode?.name || ''}
              folderExplorerRef={folderExplorerRef}
              imageNodeFrgmt={fileBrowserImageNodesFrgmt}
            />
            <SFTPButton
              vfolderName={vfolderNode?.name || ''}
              folderExplorerRef={folderExplorerRef}
              imageNodeFrgmt={sftpImageNodesFrgmt}
            />
          </>
        ) : null}
      </Flex>
    </Flex>
  );
};

export default FolderExplorerHeader;
