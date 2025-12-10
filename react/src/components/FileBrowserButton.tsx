import { PrimaryAppOption } from './ComputeSessionNodeItems/SessionActionButtons';
import { App, Image, Tooltip } from 'antd';
import {
  BAIButton,
  BAIButtonProps,
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
        row_id
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

  return (
    <Tooltip title={getTooltipTitle()}>
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
          const fileBrowserFormValue: StartSessionWithDefaultValue = {
            // If the resource setting is not included when the session is created,
            // it is created with the value determined by the server.
            sessionName: `filebrowser-${vfolder.row_id}`,
            sessionType: 'interactive',
            // use default file browser image if configured and allowed
            environments: {
              version: filebrowserImage,
            },
            allocationPreset: 'minimum-required',
            cluster_mode: 'single-node',
            cluster_size: 1,
            mount_ids: [vfolder.row_id?.replaceAll('-', '') || ''],
          };

          await startSessionWithDefault(fileBrowserFormValue)
            .then((results) => {
              if (results?.fulfilled && results.fulfilled.length > 0) {
                upsertSessionNotification(results.fulfilled, [
                  {
                    key: `filebrowser-${vfolder.row_id}`,
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
              logger.error('Unexpected error during session creation:', error);
              message.error(t('error.UnexpectedError'));
            });
        }}
        {...buttonProps}
      >
        {showTitle && t('data.explorer.ExecuteFileBrowser')}
      </BAIButton>
    </Tooltip>
  );
};

export default FileBrowserButton;
