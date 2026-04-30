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
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { FileBrowserButtonV2Fragment$key } from 'src/__generated__/FileBrowserButtonV2Fragment.graphql';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from 'src/hooks';
import { useCurrentProjectValue } from 'src/hooks/useCurrentProject';
import { useDefaultFileBrowserImageWithFallback } from 'src/hooks/useDefaultImagesWithFallback';
import { useMergedAllowedStorageHostPermission } from 'src/hooks/useMergedAllowedStorageHostPermission';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from 'src/hooks/useStartSession';

interface FileBrowserButtonV2Props extends BAIButtonProps {
  showTitle?: boolean;
  vfolderNodeFrgmt: FileBrowserButtonV2Fragment$key;
}
const FileBrowserButtonV2: React.FC<FileBrowserButtonV2Props> = ({
  showTitle = true,
  vfolderNodeFrgmt,
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
  if (!currentProject.id) {
    throw new Error('Project ID is required for FileBrowserButtonV2');
  }
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

export default FileBrowserButtonV2;
