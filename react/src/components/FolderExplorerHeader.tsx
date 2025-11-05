import { FolderExplorerHeaderFragment$key } from '../__generated__/FolderExplorerHeaderFragment.graphql';
import EditableVFolderName from './EditableVFolderName';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import { Button, Tooltip, Image, Grid, theme, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { LegacyRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { useSuspendedBackendaiClient, useWebUINavigate } from 'src/hooks';
import { SessionLauncherFormValue } from 'src/pages/SessionLauncherPage';

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
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { lg } = Grid.useBreakpoint();

  const baiClient = useSuspendedBackendaiClient();

  const webuiNavigate = useWebUINavigate();

  const vfolderNode = useFragment(
    graphql`
      fragment FolderExplorerHeaderFragment on VirtualFolderNode {
        id
        row_id
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

  const INITIAL_FORM_VALUE_FOR_SESSION_LAUNCHER: DeepPartial<SessionLauncherFormValue> =
    {
      sessionType: 'interactive',
      ...(baiClient._config?.systemSSHImage && {
        environments: {
          environment: baiClient._config?.systemSSHImage,
        },
      }),
      allocationPreset: 'minimum-required',
      cluster_mode: 'single-node',
      cluster_size: 1,
    };

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
                onClick={() => {
                  // @ts-ignore
                  // folderExplorerRef.current?._executeFileBrowser();

                  const params = new URLSearchParams();
                  const sessionLauncherFormValueForFileBrowser: DeepPartial<SessionLauncherFormValue> =
                    {
                      mount_ids: [
                        vfolderNode?.row_id?.replaceAll('-', '') ?? '',
                      ],
                      // FIXME: If `allow_manual_image_name_for_session` is set to false in the session launcher,
                      // it must be modified to prevent the manual image passed via URL parameter from being selected.
                      ...(baiClient._config?.systemSSHImage &&
                        baiClient._config
                          ?.allow_manual_image_name_for_session && {
                          environments: {
                            environment: undefined,
                            image: undefined,
                            manual: baiClient._config?.systemSSHImage,
                            version: undefined,
                          },
                        }),
                    };
                  params.set(
                    'formValues',
                    JSON.stringify(
                      _.merge(
                        INITIAL_FORM_VALUE_FOR_SESSION_LAUNCHER,
                        sessionLauncherFormValueForFileBrowser,
                      ),
                    ),
                  );
                  params.set('step', '4');
                  params.set('launchMode', 'file-browser');
                  webuiNavigate(`/session/start?${params.toString()}`);
                }}
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
