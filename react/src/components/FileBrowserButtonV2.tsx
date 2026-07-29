/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FileBrowserButtonV2Fragment$key } from '../__generated__/FileBrowserButtonV2Fragment.graphql';
import { App } from '../app-shim';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import { useDefaultFileBrowserImageWithFallback } from '../hooks/useDefaultImagesWithFallback';
import { useMergedAllowedStorageHostPermission } from '../hooks/useMergedAllowedStorageHostPermission';
import { useProjectPath } from '../hooks/useRouteScope';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from '../hooks/useStartSession';
import {
  ProjectContext,
  ProjectContextOrNull,
} from '../types/projectContext';
import { PrimaryAppOption } from './ComputeSessionNodeItems/SessionActionButtons';
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
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface FileBrowserButtonV2Props extends BAIButtonProps {
  showTitle?: boolean;
  vfolderNodeFrgmt: FileBrowserButtonV2Fragment$key;
  /**
   * Explicit project prop contract (ADR-0001, FR-3412): the project the
   * FileBrowser session is created in. With `null` the button renders
   * disabled and shows the caller-provided `noProjectTooltip` — this
   * component never knows WHY the project is absent.
   */
  project: ProjectContextOrNull;
  noProjectTooltip?: string;
}

const FileBrowserButtonV2: React.FC<FileBrowserButtonV2Props> = ({
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
      <Tooltip title={noProjectTooltip}>
        <Space.Compact>
          <BAIButton
            icon={
              <Image
                width="18px"
                src="/resources/icons/filebrowser.svg"
                alt="File Browser"
                preview={false}
                style={{
                  filter: 'grayscale(100%)',
                }}
              />
            }
            disabled
            {...buttonProps}
          >
            {showTitle && t('data.explorer.ExecuteFileBrowser')}
          </BAIButton>
          <BAIButton icon={<EllipsisOutlined />} disabled />
        </Space.Compact>
      </Tooltip>
    );
  }

  return (
    <FileBrowserButtonWithProject
      showTitle={showTitle}
      vfolderNodeFrgmt={vfolderNodeFrgmt}
      project={project}
      {...buttonProps}
    />
  );
};

interface FileBrowserButtonWithProjectProps extends BAIButtonProps {
  showTitle: boolean;
  vfolderNodeFrgmt: FileBrowserButtonV2Fragment$key;
  project: ProjectContext;
}

const FileBrowserButtonWithProject: React.FC<
  FileBrowserButtonWithProjectProps
> = ({ showTitle, vfolderNodeFrgmt, project, ...buttonProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { logger } = useBAILogger();

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

  const { getErrorMessage } = useErrorMessageResolver();
  const { startSessionWithDefault, upsertSessionNotification } =
    useStartSession();

  const filebrowserImage = useDefaultFileBrowserImageWithFallback();

  const vfolderNode = useFragment(
    graphql`
      fragment FileBrowserButtonV2Fragment on VFolder {
        id
        host
      }
    `,
    vfolderNodeFrgmt,
  );

  const hasAccessPermission = _.includes(
    unitedAllowedPermissionByVolume[vfolderNode?.host ?? ''],
    'mount-in-session',
  );

  const getTooltipTitle = () => {
    if (!hasAccessPermission) {
      return t('data.explorer.NoPermissionToMountFolder');
    } else if (filebrowserImage === null) {
      return t('data.explorer.NoImagesSupportingFileBrowser');
    } else if (!showTitle && filebrowserImage) {
      return t('data.explorer.ExecuteFileBrowser');
    } else return '';
  };

  // Helper to create launcher value for filebrowser
  const createFilebrowserLauncherValue = (): StartSessionWithDefaultValue => ({
    sessionName: `filebrowser-${toLocalId(vfolderNode.id || '')}`,
    sessionType: 'interactive',
    environments: {
      version: filebrowserImage || '',
    },
    allocationPreset: 'minimum-required',
    cluster_mode: 'single-node',
    cluster_size: 1,
    mount_ids: [toLocalId(vfolderNode.id || '').replaceAll('-', '')],
    reuseIfExists: true,
  });

  const tooltipTitle = getTooltipTitle();

  return (
    // antd `Tooltip title` → Astryx `Tooltip content` (MAPPING §4). The antd
    // original rendered an empty tooltip when the title resolved to '';
    // `isEnabled` expresses that intent instead.
    <Tooltip content={tooltipTitle} isEnabled={!!tooltipTitle}>
      {/* antd `Space.Compact` → `ButtonGroup` (MAPPING §4). */}
      <ButtonGroup label={t('data.explorer.ExecuteFileBrowser')}>
        <BAIButton
          icon={
            // antd `Image preview={false}` was a plain 18px raster with the
            // lightbox switched off; Astryx's Image family (Thumbnail /
            // Lightbox) is for previewable media, so a bare <img> is the
            // faithful mapping here (PILOT-DECISION).
            <img
              width="18px"
              src="/resources/icons/filebrowser.svg"
              alt="File Browser"
              style={
                filebrowserImage
                  ? undefined
                  : {
                      filter: 'grayscale(100%)',
                    }
              }
            />
          }
          disabled={!filebrowserImage || !hasAccessPermission}
          action={async () => {
            if (!filebrowserImage) {
              return;
            }
            const fileBrowserFormValue = {
              ...createFilebrowserLauncherValue(),
              // Pin the session to exactly the passed project (FR-3412).
              projectName: project.name,
            };
            await startSessionWithDefault(fileBrowserFormValue)
              .then((results) => {
                if (results?.fulfilled && results.fulfilled.length > 0) {
                  upsertSessionNotification(results.fulfilled, [
                    {
                      key: `filebrowser-${toLocalId(vfolderNode.id || '')}`,
                      extraData: {
                        appName: 'filebrowser',
                      } as PrimaryAppOption,
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
          {showTitle && t('data.explorer.ExecuteFileBrowser')}
        </BAIButton>
        {/* antd `Dropdown menu={{items}}` with a click trigger →
            `DropdownMenu items` (MAPPING §3.7). The trigger moves from
            `children` to the `button` slot, which is where the disabled state
            and the accessible name now live. */}
        <DropdownMenu
          button={{
            label: t('import.StartWithOptions'),
            icon: <Ellipsis size="1em" />,
            isIconOnly: true,
            isDisabled: !filebrowserImage || !hasAccessPermission,
          }}
          hasChevron={false}
          items={[
            {
              label: t('import.StartWithOptions'),
              onClick: () => {
                const launcherValue = createFilebrowserLauncherValue();
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

export default FileBrowserButtonV2;
