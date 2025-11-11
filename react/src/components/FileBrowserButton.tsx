import { PrimaryAppOption } from './ComputeSessionNodeItems/SessionActionButtons';
import { App, ButtonProps, Image, Tooltip } from 'antd';
import { BAIButton, useErrorMessageResolver } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { FileBrowserButtonFragment$key } from 'src/__generated__/FileBrowserButtonFragment.graphql';
import { useDefaultFileBrowserImageWithFallback } from 'src/hooks/useDefaultFileBrowserImageWithFallback';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from 'src/hooks/useStartSession';

interface FileBrowserButtonProps extends ButtonProps {
  showTitle?: boolean;
  vfolderFrgmt: FileBrowserButtonFragment$key;
}
const FileBrowserButton: React.FC<FileBrowserButtonProps> = ({
  showTitle = true,
  vfolderFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  const { getErrorMessage } = useErrorMessageResolver();
  const { startSessionWithDefault, upsertSessionNotification } =
    useStartSession();

  const filebrowserImage = useDefaultFileBrowserImageWithFallback();

  const vfolder = useFragment(
    graphql`
      fragment FileBrowserButtonFragment on VirtualFolderNode {
        id
        row_id
      }
    `,
    vfolderFrgmt,
  );

  return (
    <Tooltip
      title={
        filebrowserImage === null
          ? t('data.explorer.NoImagesSupportingFileBrowser')
          : !showTitle &&
            filebrowserImage &&
            t('data.explorer.ExecuteFileBrowser')
      }
    >
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
        disabled={!filebrowserImage}
        action={async () => {
          if (!filebrowserImage) {
            return;
          }
          const fileBrowserFormValue: StartSessionWithDefaultValue = {
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
            resource: {
              cpu: 1,
              mem: '0.5g',
            },
          };

          await startSessionWithDefault(fileBrowserFormValue)
            .then((results) => {
              if (results?.fulfilled && results.fulfilled.length > 0) {
                upsertSessionNotification(results.fulfilled, [
                  {
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
              console.error('Unexpected error during session creation:', error);
              message.error(t('error.UnexpectedError'));
            });
        }}
      >
        {showTitle && t('data.explorer.ExecuteFileBrowser')}
      </BAIButton>
    </Tooltip>
  );
};

export default FileBrowserButton;
