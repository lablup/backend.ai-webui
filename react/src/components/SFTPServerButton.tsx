/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SFTPServerButtonFragment$key } from '../__generated__/SFTPServerButtonFragment.graphql';
import { App } from '../app-shim';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import {
  useCurrentProjectValue,
  useResourceGroupsForCurrentProject,
} from '../hooks/useCurrentProject';
import { useDefaultSystemSSHImageWithFallback } from '../hooks/useDefaultImagesWithFallback';
import { useMergedAllowedStorageHostPermission } from '../hooks/useMergedAllowedStorageHostPermission';
import { useProjectPath } from '../hooks/useRouteScope';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from '../hooks/useStartSession';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIButton,
  BAIButtonProps,
  toLocalId,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Ellipsis } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SFTPServerButtonProps extends BAIButtonProps {
  showTitle?: boolean;
  vfolderFrgmt: SFTPServerButtonFragment$key;
}

const SFTPServerButton: React.FC<SFTPServerButtonProps> = ({
  showTitle = true,
  vfolderFrgmt,
  ...buttonProps
}) => {
  'use memo';

  const { logger } = useBAILogger();
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  if (!currentProject.id) {
    throw new Error('Project ID is required for SFTPServerButton');
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

  const vfolder = useFragment(
    graphql`
      fragment SFTPServerButtonFragment on VirtualFolderNode {
        id
        host
      }
    `,
    vfolderFrgmt,
  );

  // Verify that the current user has access to the volume of the vfolder.
  // Check the project has SFTP scaling groups for the host of the vfolder.
  const sftpScalingGroupByCurrentProject =
    vhostInfoByCurrentProject?.volume_info[vfolder?.host || '']
      ?.sftp_scaling_groups;
  // Verify that the current project has access to the volumes in the folder.
  // Check the user has 'mount-in-session' permission united by domain, project, and keypair resource policy.
  const hasAccessPermission = _.includes(
    unitedAllowedPermissionByVolume[vfolder?.host ?? ''],
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
    sessionName: `sftp-${toLocalId(vfolder?.id || '')}`,
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
    mount_ids: [toLocalId(vfolder?.id || '').replaceAll('-', '')],
    resourceGroup: sftpScalingGroupByCurrentProject?.[0],
    reuseIfExists: true,
  });

  return (
    // P18 caveat, unchanged from the antd original: the tooltip explains why
    // the control is disabled, and a disabled control swallows hover events.
    // It stays on the GROUP (never disabled itself), which is what made it
    // reachable under antd too. `Space.Compact` -> `ButtonGroup` (MAPPING §4).
    <Tooltip content={getTooltipTitle()}>
      <ButtonGroup label={t('data.explorer.RunSSH/SFTPserver')}>
        <BAIButton
          disabled={
            _.isEmpty(sftpScalingGroupByCurrentProject) ||
            !systemSSHImage ||
            !hasAccessPermission
          }
          // MAPPING §5: antd `Image preview={false}` is not a Thumbnail or a
          // Lightbox — with the preview off it is a plain 18px inline glyph,
          // so it becomes a bare <img>. Nothing antd contributed is lost.
          icon={
            <img
              width="18"
              height="18"
              src="/resources/icons/sftp.png"
              alt="SSH / SFTP"
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
                      key: `sftp-${toLocalId(vfolder?.id || '')}`,
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
        {/* MAPPING §3.7: a click-triggered `Dropdown menu={{items}}` with an
            icon-only child button -> `DropdownMenu` and its own `button`
            slot, which also gives the trigger the accessible name antd's
            bare icon button never had. */}
        <DropdownMenu
          button={{
            label: t('import.StartWithOptions'),
            icon: <Ellipsis size="1em" />,
            isIconOnly: true,
            isDisabled:
              _.isEmpty(sftpScalingGroupByCurrentProject) ||
              !systemSSHImage ||
              !hasAccessPermission,
          }}
          hasChevron={false}
          alignment="end"
          items={[
            {
              label: t('import.StartWithOptions'),
              onClick: () => {
                const launcherValue = createSftpLauncherValue();
                const params = new URLSearchParams();
                params.set('formValues', JSON.stringify(launcherValue));
                params.set('step', '4');
                webuiNavigate({
                  pathname: buildProjectPath('session/start'),
                  search: params.toString(),
                });
              },
            },
          ]}
        />
      </ButtonGroup>
    </Tooltip>
  );
};

export default SFTPServerButton;
