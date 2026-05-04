/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../hooks';
import { EllipsisOutlined } from '@ant-design/icons';
import { App, Dropdown, Image, Space, Tooltip } from 'antd';
import {
  BAIButton,
  BAIButtonProps,
  toLocalId,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { SFTPServerButtonV2Fragment$key } from 'src/__generated__/SFTPServerButtonV2Fragment.graphql';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from 'src/hooks';
import {
  useCurrentProjectValue,
  useResourceGroupsForCurrentProject,
} from 'src/hooks/useCurrentProject';
import { useDefaultSystemSSHImageWithFallback } from 'src/hooks/useDefaultImagesWithFallback';
import { useMergedAllowedStorageHostPermission } from 'src/hooks/useMergedAllowedStorageHostPermission';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from 'src/hooks/useStartSession';

interface SFTPServerButtonV2Props extends BAIButtonProps {
  showTitle?: boolean;
  vfolderNodeFrgmt: SFTPServerButtonV2Fragment$key;
}

const SFTPServerButtonV2: React.FC<SFTPServerButtonV2Props> = ({
  showTitle = true,
  vfolderNodeFrgmt,
  ...buttonProps
}) => {
  'use memo';

  const { logger } = useBAILogger();
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  const webuiNavigate = useWebUINavigate();

  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  if (!currentProject.id) {
    throw new Error('Project ID is required for SFTPServerButtonV2');
  }
  const currentUserAccessKey = baiClient?._config?.accessKey;
  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      currentProject.id,
      currentUserAccessKey,
    );
  const { vhostInfo: vhostInfoByCurrentProject } =
    useResourceGroupsForCurrentProject();

  const { getErrorMessage } = useErrorMessageResolver();
  const { startSessionWithDefault, upsertSessionNotification } =
    useStartSession();

  const { systemSSHImage } = useDefaultSystemSSHImageWithFallback();

  const vfolderNode = useFragment(
    graphql`
      fragment SFTPServerButtonV2Fragment on VFolder {
        id
        host
      }
    `,
    vfolderNodeFrgmt,
  );

  // Verify that the current user has access to the volume of the vfolder.
  // Check the project has SFTP scaling groups for the host of the vfolder.
  const sftpScalingGroupByCurrentProject =
    vhostInfoByCurrentProject?.volume_info[vfolderNode?.host || '']
      ?.sftp_scaling_groups;
  // Verify that the current project has access to the volumes in the folder.
  // Check the user has 'mount-in-session' permission united by domain, project, and keypair resource policy.
  const hasAccessPermission = _.includes(
    unitedAllowedPermissionByVolume[vfolderNode?.host ?? ''],
    'mount-in-session',
  );

  const getTooltipTitle = () => {
    if (!hasAccessPermission) {
      return t('data.explorer.NoPermissionToMountFolder');
    } else if (_.isEmpty(sftpScalingGroupByCurrentProject)) {
      return t('data.explorer.NoSFTPSupportingScalingGroup');
    } else if (!systemSSHImage) {
      return t('data.explorer.NoImagesSupportingSystemSession');
    } else if (!showTitle && systemSSHImage) {
      return t('data.explorer.RunSSH/SFTPserver');
    } else return '';
  };

  // Helper to create launcher value for SFTP session
  const createSftpLauncherValue = (): StartSessionWithDefaultValue => ({
    sessionName: `sftp-${toLocalId(vfolderNode?.id || '')}`,
    sessionType: 'system',
    ...(baiClient._config?.systemSSHImage &&
    baiClient._config?.allow_manual_image_name_for_session
      ? {
          environments: {
            manual: baiClient._config.systemSSHImage,
          },
        }
      : {
          environments: {
            version: systemSSHImage || '',
          },
        }),
    cluster_mode: 'single-node',
    cluster_size: 1,
    mount_ids: [toLocalId(vfolderNode?.id || '').replaceAll('-', '')],
    resourceGroup: sftpScalingGroupByCurrentProject?.[0],
    reuseIfExists: true,
  });

  return (
    <Tooltip title={getTooltipTitle()}>
      <Space.Compact>
        <BAIButton
          disabled={
            _.isEmpty(sftpScalingGroupByCurrentProject) ||
            !systemSSHImage ||
            !hasAccessPermission
          }
          icon={
            <Image
              width="18px"
              src="/resources/icons/sftp.png"
              alt="SSH / SFTP"
              preview={false}
            />
          }
          action={async () => {
            const sftpSessionConf = createSftpLauncherValue();
            await startSessionWithDefault(sftpSessionConf)
              .then((results) => {
                if (results?.fulfilled && results.fulfilled.length > 0) {
                  // set notification key for handling duplicate session creation
                  upsertSessionNotification(results.fulfilled, [
                    {
                      key: `sftp-${toLocalId(vfolderNode?.id || '')}`,
                    },
                  ]);
                }
                if (results?.rejected && results.rejected.length > 0) {
                  const error = results.rejected[0].reason;
                  modal.error({
                    title: error?.title,
                    content: getErrorMessage(error),
                  });
                }
              })
              .catch((error) => {
                logger.error(
                  'Unexpected error during session creation:',
                  error,
                );
                message.error(t('error.UnexpectedError'));
              });
          }}
          {...buttonProps}
        >
          {showTitle && t('data.explorer.RunSSH/SFTPserver')}
        </BAIButton>
        <Dropdown
          disabled={
            _.isEmpty(sftpScalingGroupByCurrentProject) ||
            !systemSSHImage ||
            !hasAccessPermission
          }
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'custom',
                label: t('import.StartWithOptions'),
                onClick: () => {
                  const launcherValue = createSftpLauncherValue();
                  const params = new URLSearchParams();
                  params.set('formValues', JSON.stringify(launcherValue));
                  params.set('step', '4');
                  webuiNavigate({
                    pathname: '/session/start',
                    search: params.toString(),
                  });
                },
              },
            ],
          }}
        >
          <BAIButton icon={<EllipsisOutlined />} />
        </Dropdown>
      </Space.Compact>
    </Tooltip>
  );
};

export default SFTPServerButtonV2;
