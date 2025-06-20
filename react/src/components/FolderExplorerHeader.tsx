import { FileBrowserButtonImageNodeFragment$key } from '../__generated__/FileBrowserButtonImageNodeFragment.graphql';
import { FolderExplorerHeaderFragment$key } from '../__generated__/FolderExplorerHeaderFragment.graphql';
import FileBrowserButton from './FileBrowserButton';
import Flex from './Flex';
import VFolderNameTitle from './VFolderNameTitle';
import { Button, Tooltip, Image, Skeleton, Grid, theme } from 'antd';
import React, { LegacyRef, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface FolderExplorerHeaderProps {
  vfolderNodeFrgmt?: FolderExplorerHeaderFragment$key | null;
  imageNodesFrgmt?: FileBrowserButtonImageNodeFragment$key | null;
  folderExplorerRef: LegacyRef<HTMLDivElement>;
}

const FolderExplorerHeader: React.FC<FolderExplorerHeaderProps> = ({
  vfolderNodeFrgmt,
  imageNodesFrgmt,
  folderExplorerRef,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { lg } = Grid.useBreakpoint();

  const vfolderNode = useFragment(
    graphql`
      fragment FolderExplorerHeaderFragment on VirtualFolderNode {
        id
        user
        permission
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
              imageNodesFrgmt={imageNodesFrgmt}
            />
            <Tooltip title={!lg && t('data.explorer.RunSSH/SFTPserver')}>
              <Button
                icon={
                  <Image
                    width="18px"
                    src="/resources/icons/sftp.png"
                    alt="SSH / SFTP"
                    preview={false}
                  />
                }
                onClick={() => {
                  // @ts-ignore
                  folderExplorerRef.current?._executeSSHProxyAgent();
                }}
              >
                {lg && t('data.explorer.RunSSH/SFTPserver')}
              </Button>
            </Tooltip>
          </>
        ) : null}
      </Flex>
    </Flex>
  );
};

export default FolderExplorerHeader;
