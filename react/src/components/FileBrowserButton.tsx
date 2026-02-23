/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../hooks';
import { PrimaryAppOption } from './ComputeSessionNodeItems/SessionActionButtons';
import { EllipsisOutlined } from '@ant-design/icons';
import { App, Dropdown, Image, Space, Tooltip } from 'antd';
import {
  BAIButton,
  BAIButtonProps,
  toLocalId,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { FileBrowserButtonFragment$key } from 'src/__generated__/FileBrowserButtonFragment.graphql';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from 'src/hooks';
import { useCurrentProjectValue } from 'src/hooks/useCurrentProject';
import { useDefaultFileBrowserImageWithFallback } from 'src/hooks/useDefaultImagesWithFallback';
import { useMergedAllowedStorageHostPermission } from 'src/hooks/useMergedAllowedStorageHostPermission';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from 'src/hooks/useStartSession';

interface FileBrowserButtonProps extends BAIButtonProps {
  showTitle?: boolean;
  vfolderFrgmt: FileBrowserButtonFragment$key;
}
const FileBrowserButton: React.FC<FileBrowserButtonProps> = ({
  showTitle = true,
  vfolderFrgmt,
  ...buttonProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { logger } = useBAILogger();

  const webuiNavigate = useWebUINavigate();

  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const currentUserAccessKey = baiClient?._config?.accessKey;
  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      currentProject.id,
      currentUserAccessKey,
    );

  const { getErrorMessage } = useErrorMessageResolver();
  const { startSessionWithDefault, upsertSessionNotification } =
    useStartSession();

  const filebrowserImage = useDefaultFileBrowserImageWithFallback();

  const vfolder = useFragment(
    graphql`
      fragment FileBrowserButtonFragment on VirtualFolderNode {
        id
        host
      }
    `,
    vfolderFrgmt,
  );

  const hasAccessPermission = _.includes(
    unitedAllowedPermissionByVolume[vfolder?.host ?? ''],
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
    sessionName: `filebrowser-${toLocalId(vfolder.id || '')}`,
    sessionType: 'interactive',
    environments: {
      version: filebrowserImage || '',
    },
    allocationPreset: 'minimum-required',
    cluster_mode: 'single-node',
    cluster_size: 1,
    mount_ids: [toLocalId(vfolder.id || '').replaceAll('-', '')],
    reuseIfExists: true,
  });

  return (
    <Tooltip title={getTooltipTitle()}>
      <Space.Compact>
        <BAIButton
          icon={
            <Image
              width="18px"
              src="/resources/icons/filebrowser.svg"
              alt="File Browser"
              preview={false}
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
            const fileBrowserFormValue = createFilebrowserLauncherValue();
            await startSessionWithDefault(fileBrowserFormValue)
              .then((results) => {
                if (results?.fulfilled && results.fulfilled.length > 0) {
                  upsertSessionNotification(results.fulfilled, [
                    {
                      key: `filebrowser-${toLocalId(vfolder.id || '')}`,
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
        <Dropdown
          disabled={!filebrowserImage || !hasAccessPermission}
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'custom',
                label: t('import.StartWithOptions'),
                onClick: () => {
                  const launcherValue = createFilebrowserLauncherValue();
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

export default FileBrowserButton;
