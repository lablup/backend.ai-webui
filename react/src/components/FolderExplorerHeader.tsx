import { FolderExplorerHeaderFragment$key } from '../__generated__/FolderExplorerHeaderFragment.graphql';
import { PrimaryAppOption } from './ComputeSessionNodeItems/SessionActionButtons';
import EditableVFolderName from './EditableVFolderName';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import { Button, Tooltip, Image, Grid, theme, Typography, App } from 'antd';
import { BAIButton, BAIFlex, useErrorMessageResolver } from 'backend.ai-ui';
import _ from 'lodash';
import React, { LegacyRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';
import { FolderExplorerHeader_ImageQuery } from 'src/__generated__/FolderExplorerHeader_ImageQuery.graphql';
import { getImageFullName } from 'src/helper';
import { useSuspendedBackendaiClient } from 'src/hooks';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from 'src/hooks/useStartSession';

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
  const { message, modal } = App.useApp();

  const relayEnv = useRelayEnvironment();
  const baiClient = useSuspendedBackendaiClient();
  const { getErrorMessage } = useErrorMessageResolver();
  const { startSessionWithDefault, upsertSessionNotification } =
    useStartSession();

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
              <BAIButton
                icon={
                  <Image
                    width="18px"
                    src="/resources/icons/filebrowser.svg"
                    alt="File Browser"
                    preview={false}
                  />
                }
                action={async () => {
                  // FIXME: Currently, file browser filtering by server-side is not supported.
                  await fetchQuery<FolderExplorerHeader_ImageQuery>(
                    relayEnv,
                    graphql`
                      query FolderExplorerHeader_ImageQuery(
                        $installed: Boolean
                      ) {
                        images(is_installed: $installed) {
                          id
                          tag
                          registry
                          architecture
                          name @deprecatedSince(version: "24.12.0")
                          namespace @since(version: "24.12.0")
                          labels {
                            key
                            value
                          }
                          tags @since(version: "24.12.0") {
                            key
                            value
                          }
                        }
                      }
                    `,
                    {
                      installed: true,
                    },
                    {
                      fetchPolicy: 'store-or-network',
                    },
                  )
                    .toPromise()
                    .then((response) =>
                      response?.images?.filter((image) =>
                        image?.labels?.find(
                          (label) =>
                            label?.key === 'ai.backend.service-ports' &&
                            label?.value?.toLowerCase().includes('filebrowser'),
                        ),
                      ),
                    )
                    .then(async (filebrowserImages) => {
                      if (_.isEmpty(filebrowserImages)) {
                        message.error(
                          t('data.explorer.NoImagesSupportingFileBrowser'),
                        );
                        return;
                      }

                      const fileBrowserFormValue: StartSessionWithDefaultValue =
                        {
                          sessionName: `filebrowser-${vfolderNode?.row_id.split('-')[0]}`,
                          sessionType: 'interactive',
                          // use default file browser image if configured and allowed
                          ...(baiClient._config?.defaultFileBrowserImage &&
                          baiClient._config?.allow_manual_image_name_for_session
                            ? {
                                environments: {
                                  manual:
                                    baiClient._config.defaultFileBrowserImage,
                                },
                              }
                            : // otherwise use the first image found
                              {
                                environments: {
                                  version:
                                    getImageFullName(filebrowserImages?.[0]) ||
                                    '',
                                },
                              }),
                          allocationPreset: 'minimum-required',
                          cluster_mode: 'single-node',
                          cluster_size: 1,
                          mount_ids: [
                            vfolderNode?.row_id?.replaceAll('-', '') || '',
                          ],
                          resource: {
                            cpu: 1,
                            mem: '0.5g',
                          },
                        };

                      await startSessionWithDefault(fileBrowserFormValue)
                        .then((results) => {
                          if (
                            results?.fulfilled &&
                            results.fulfilled.length > 0
                          ) {
                            upsertSessionNotification(results.fulfilled, [
                              {
                                extraData: {
                                  appName: 'filebrowser',
                                } as PrimaryAppOption,
                              },
                            ]);
                          }
                          if (
                            results?.rejected &&
                            results.rejected.length > 0
                          ) {
                            const error = results.rejected[0].reason;
                            modal.error({
                              title: error?.title,
                              content: getErrorMessage(error),
                            });
                          }
                        })
                        .catch((error) => {
                          console.error(
                            'Unexpected error during session creation:',
                            error,
                          );
                          message.error(t('error.UnexpectedError'));
                        });
                    });
                }}
              >
                {lg && t('data.explorer.ExecuteFileBrowser')}
              </BAIButton>
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
