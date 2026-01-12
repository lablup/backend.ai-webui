import SourceCodeView from '../SourceCodeView';
import { Descriptions, Skeleton, Typography } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIText,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { useSuspendedBackendaiClient } from 'src/hooks';
import { useTanQuery } from 'src/hooks/reactQueryAlias';

interface VSCodeDesktopConnectionModalProps extends BAIModalProps {
  sessionId: string;
  host?: string;
  port: number;
}

const VSCodeDesktopConnectionModal: React.FC<
  VSCodeDesktopConnectionModalProps
> = ({ sessionId, host = '127.0.0.1', port, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const {
    data: password,
    isLoading,
    isError,
  } = useTanQuery<string>({
    queryKey: ['vscodePassword', sessionId],
    queryFn: async () => {
      const file = '/home/work/.password';
      const blob = await baiClient.download_single(sessionId, file);
      const rawText = await blob.text();
      return rawText;
    },
    enabled: !!sessionId && !!modalProps.open,
    retry: false,
    throwOnError: false,
  });

  const vscodeUri = `vscode://vscode-remote/ssh-remote+work@${host}%3A${port}/home/work`;

  const sshConfig = `Host bai-vscode
 User work
 Hostname ${host}
 Port ${port}
 StrictHostKeyChecking no
 UserKnownHostsFile /dev/null`;

  return (
    <BAIModal
      width={600}
      title={t('session.VSCodeRemoteConnection')}
      footer={null}
      {...modalProps}
    >
      <BAIFlex direction="column" gap="md" align="stretch">
        <Typography.Paragraph>
          {t('session.VSCodeRemoteDescription')}
        </Typography.Paragraph>

        <Descriptions
          column={1}
          bordered
          size="small"
          title={t('session.ConnectionInformation')}
          styles={{
            label: {
              maxWidth: 210,
            },
          }}
        >
          <Descriptions.Item label={t('session.VSCodeRemotePasswordTitle')}>
            {isLoading ? (
              <Skeleton.Input />
            ) : isError ? (
              <BAIText type="secondary">-</BAIText>
            ) : (
              <BAIText copyable monospace>
                {password}
              </BAIText>
            )}
          </Descriptions.Item>
        </Descriptions>

        <Typography.Text>
          {t('session.VSCodeRemoteNoticeSSHConfig')}
        </Typography.Text>
        <SourceCodeView language="shell">{sshConfig}</SourceCodeView>

        <BAIButton href={vscodeUri} target="_blank" type="primary" size="large">
          {t('session.appLauncher.OpenVSCodeRemote')}
        </BAIButton>
      </BAIFlex>
    </BAIModal>
  );
};

export default VSCodeDesktopConnectionModal;
