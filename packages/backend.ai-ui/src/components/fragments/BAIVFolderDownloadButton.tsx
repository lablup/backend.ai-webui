import { initiateDownload } from '../../helper';
import BAIButton, { BAIButtonProps } from '../BAIButton';
import { useConnectedBAIClient } from '../provider';
import { useMutation } from '@tanstack/react-query';
import { theme } from 'antd';
import { DownloadIcon } from 'lucide-react';

export interface BAIVFolderDownloadButtonProps extends BAIButtonProps {
  vfolderId: string;
  vfolderName: string;
}

const BAIVFolderDownloadButton = ({
  vfolderId,
  vfolderName,
  ...buttonProps
}: BAIVFolderDownloadButtonProps) => {
  const { token } = theme.useToken();
  const baiClient = useConnectedBAIClient();

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      try {
        const tokenResponse = await baiClient.vfolder.request_download_token(
          './',
          vfolderId,
          true,
        );
        const downloadParams = new URLSearchParams({
          token: tokenResponse.token,
          archive: 'true',
        });
        const downloadURL = `${tokenResponse.url}?${downloadParams.toString()}`;
        await initiateDownload(downloadURL, `${vfolderName}.zip`);
      } catch (error) {
        throw error;
      }
    },
  });

  return (
    <BAIButton
      icon={
        <DownloadIcon
          color={
            buttonProps.disabled ? token.colorTextDisabled : token.colorInfo
          }
        />
      }
      style={{
        color: buttonProps.disabled ? token.colorTextDisabled : token.colorInfo,
        background: buttonProps.disabled
          ? token.colorBgContainerDisabled
          : token.colorInfoBg,
      }}
      {...buttonProps}
      action={async () => {
        await mutateAsync();
        await buttonProps.action?.();
      }}
    />
  );
};

export default BAIVFolderDownloadButton;
