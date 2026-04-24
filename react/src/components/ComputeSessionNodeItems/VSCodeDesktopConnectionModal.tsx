/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import SourceCodeView from '../SourceCodeView';
import { ReloadOutlined } from '@ant-design/icons';
import { Descriptions, Skeleton, Typography } from 'antd';
import {
  BAIAlert,
  BAIButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIText,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { useSuspendedBackendaiClient } from 'src/hooks';
import { useTanQuery } from 'src/hooks/reactQueryAlias';

const PASSWORD_FILE_PATH = '/home/work/.password';

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
    status,
    refetch,
  } = useTanQuery<string>({
    queryKey: ['vscodePassword', sessionId],
    queryFn: async () => {
      const blob = await baiClient.download_single(
        sessionId,
        PASSWORD_FILE_PATH,
      );
      const rawText = await blob.text();
      return rawText;
    },
    enabled: !!sessionId && !!modalProps.open,
    retry: 2,
    retryDelay: 500,
    throwOnError: false,
    notifyOnChangeProps: ['status', 'data'],
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

        <BAIFlex direction="column" gap="xs" align="stretch">
          <Typography.Text strong>
            {t('session.ConnectionInformation')}
          </Typography.Text>
          {status === 'success' ? (
            <Descriptions
              column={1}
              bordered
              size="small"
              styles={{ label: { maxWidth: 210 } }}
            >
              <Descriptions.Item label={t('session.VSCodeRemotePasswordTitle')}>
                <BAIText copyable monospace>
                  {password}
                </BAIText>
              </Descriptions.Item>
            </Descriptions>
          ) : status === 'pending' ? (
            <Skeleton.Input active />
          ) : (
            <BAIAlert
              type="warning"
              showIcon
              title={t('session.VSCodeRemotePasswordFetchError')}
              description={t(
                'session.VSCodeRemotePasswordFetchErrorDescription',
              )}
              action={
                <BAIButton
                  size="small"
                  icon={<ReloadOutlined />}
                  action={async () => {
                    await refetch();
                  }}
                >
                  {t('button.Retry')}
                </BAIButton>
              }
            />
          )}
        </BAIFlex>

        <BAIFlex direction="column" gap="xs" align="stretch">
          <Typography.Text>
            {t('session.VSCodeRemotePasswordFallbackInstructions')}
          </Typography.Text>
          <SourceCodeView language="shell">
            {`cat ${PASSWORD_FILE_PATH}`}
          </SourceCodeView>
        </BAIFlex>

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
