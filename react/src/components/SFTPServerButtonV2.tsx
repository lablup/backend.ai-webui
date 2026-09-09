/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SFTPServerButtonV2Fragment$key } from '../__generated__/SFTPServerButtonV2Fragment.graphql';
import { App } from '../app-shim';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import { useDefaultSystemSSHImageWithFallback } from '../hooks/useDefaultImagesWithFallback';
import { useMergedAllowedStorageHostPermission } from '../hooks/useMergedAllowedStorageHostPermission';
import { useProjectPath } from '../hooks/useRouteScope';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from '../hooks/useStartSession';
import { useVHostInfo } from '../hooks/useVHostInfo';
import { ProjectContext, ProjectContextOrNull } from '../types/projectContext';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { IconButton } from '@astryxdesign/core/IconButton';
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

interface SFTPServerButtonV2Props extends BAIButtonProps {
  showTitle?: boolean;
  vfolderNodeFrgmt: SFTPServerButtonV2Fragment$key;
  /**
   * Explicit project prop contract (ADR-0001, FR-3412): the project the
   * SSH/SFTP session is created in. With `null` the button renders disabled
   * and shows the caller-provided `noProjectTooltip` — this component never
   * knows WHY the project is absent.
   */
  project: ProjectContextOrNull;
  noProjectTooltip?: string;
}

const SFTPServerButtonV2: React.FC<SFTPServerButtonV2Props> = ({
  showTitle = true,
  vfolderNodeFrgmt,
  project,
  noProjectTooltip,
  ...buttonProps
}) => {
  'use memo';
  const { t } = useTranslation();

  if (project === null) {
    return (
      <Tooltip content={noProjectTooltip} isEnabled={!!noProjectTooltip}>
        <ButtonGroup label={t('data.explorer.RunSSH/SFTPserver')}>
          <BAIButton
            icon={
              <img
                width="18"
                height="18"
                src="/resources/icons/sftp.png"
                alt="SSH / SFTP"
              />
            }
            {...buttonProps}
            // After the spread: a caller must not re-enable this tier.
            disabled
          >
            {showTitle && t('data.explorer.RunSSH/SFTPserver')}
          </BAIButton>
          <IconButton
            label={t('import.StartWithOptions')}
            icon={<Ellipsis size="1em" />}
            isDisabled
          />
        </ButtonGroup>
      </Tooltip>
    );
  }

  return (
    <SFTPServerButtonWithProject
      showTitle={showTitle}
      vfolderNodeFrgmt={vfolderNodeFrgmt}
      project={project}
      {...buttonProps}
    />
  );
};

interface SFTPServerButtonWithProjectProps extends BAIButtonProps {
  showTitle: boolean;
  vfolderNodeFrgmt: SFTPServerButtonV2Fragment$key;
  project: ProjectContext;
}

const SFTPServerButtonWithProject: React.FC<
  SFTPServerButtonWithProjectProps
> = ({ showTitle, vfolderNodeFrgmt, project, ...buttonProps }) => {
  'use memo';

  const { logger } = useBAILogger();
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentUserAccessKey = baiClient?._config?.accessKey;
  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      project.id,
      currentUserAccessKey,
    );
  // Per-project volume host info (FR-3412) — keyed to the passed project,
  // not the ambient current-project derived atom.
  const { vhostInfo } = useVHostInfo(project.id);

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

  // Verify that the passed project has access to the volume of the vfolder.
  // Check the project has SFTP scaling groups for the host of the vfolder.
  const sftpScalingGroupsByProject =
    vhostInfo?.volume_info[vfolderNode?.host || '']?.sftp_scaling_groups;
  // Verify that the passed project has access to the volumes in the folder.
  // Check the user has 'mount-in-session' permission united by domain, project, and keypair resource policy.
  const hasAccessPermission = _.includes(
    unitedAllowedPermissionByVolume[vfolderNode?.host ?? ''],
    'mount-in-session',
  );

  const getTooltipTitle = () => {
    if (!hasAccessPermission) {
      return t('data.explorer.NoPermissionToMountFolder');
    } else if (_.isEmpty(sftpScalingGroupsByProject)) {
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
    resourceGroup: sftpScalingGroupsByProject?.[0],
    reuseIfExists: true,
  });

  // Empty in the ordinary healthy state, and Astryx `Tooltip` has no
  // empty-content guard — an enabled one then opens a contentless dark pill
  // over the whole button group (FR-3672).
  const tooltipTitle = getTooltipTitle();

  return (
    // P18 caveat, unchanged from the antd original: the tooltip explains why
    // the control is disabled, and a disabled control swallows hover events.
    // It stays on the GROUP (never disabled itself), which is what made it
    // reachable under antd too. `Space.Compact` -> `ButtonGroup` (MAPPING §4).
    <Tooltip content={tooltipTitle} isEnabled={!!tooltipTitle}>
      <ButtonGroup label={t('data.explorer.RunSSH/SFTPserver')}>
        <BAIButton
          disabled={
            _.isEmpty(sftpScalingGroupsByProject) ||
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
            const sftpSessionConf = {
              ...createSftpLauncherValue(),
              // Pin the session to exactly the passed project (FR-3412).
              projectName: project.name,
            };
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
              _.isEmpty(sftpScalingGroupsByProject) ||
              !systemSSHImage ||
              !hasAccessPermission,
          }}
          hasChevron={false}
          alignment="end"
          items={[
            {
              label: t('import.StartWithOptions'),
              onClick: () => {
                const launcherValue = {
                  ...createSftpLauncherValue(),
                  projectName: project.name,
                };
                const params = new URLSearchParams();
                params.set('formValues', JSON.stringify(launcherValue));
                params.set('step', '4');
                webuiNavigate({
                  // The launcher reads the project from the URL, not from
                  // these form values. `scope` is required too: the launcher
                  // route exists only in the project subtree.
                  pathname: buildProjectPath('session/start', {
                    scope: 'project',
                    projectName: project.name,
                  }),
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

export default SFTPServerButtonV2;
