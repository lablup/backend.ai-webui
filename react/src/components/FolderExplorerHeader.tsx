import { FolderExplorerHeaderFragment$key } from '../__generated__/FolderExplorerHeaderFragment.graphql';
import EditableVFolderName from './EditableVFolderName';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import { Button, Tooltip, Image, Grid, theme, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { LegacyRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface FolderExplorerHeaderProps {
  vfolderNodeFrgmt?: FolderExplorerHeaderFragment$key | null;
  folderExplorerRef: LegacyRef<HTMLDivElement>;
  titleStyle?: React.CSSProperties;
}

const FolderExplorerHeader: React.FC<FolderExplorerHeaderProps> = ({
  vfolderNodeFrgmt,
  folderExplorerRef,
  titleStyle,
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
        ...VFolderNameTitleNodeFragment
        ...VFolderNodeIdenticonFragment
        ...EditableVFolderNameFragment
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
        style={{ flex: 1, ...titleStyle }}
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
            }}
          />
        )}
      </BAIFlex>
      <BAIFlex
        data-testid="folder-explorer-actions"
        justify="end"
        gap={token.marginSM}
      >
        {!vfolderNode?.unmanaged_path ? (
          <>
            <Tooltip title={!lg && t('data.explorer.ExecuteFileBrowser')}>
              <Button
                icon={
                  <Image
                    width="18px"
                    src="/resources/icons/filebrowser.svg"
                    alt="File Browser"
                    preview={false}
                  />
                }
                onClick={() =>
                  // @ts-ignore
                  folderExplorerRef.current?._executeFileBrowser()
                }
              >
                {lg && t('data.explorer.ExecuteFileBrowser')}
              </Button>
            </Tooltip>
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
      </BAIFlex>
    </BAIFlex>
  );
};

export default FolderExplorerHeader;
