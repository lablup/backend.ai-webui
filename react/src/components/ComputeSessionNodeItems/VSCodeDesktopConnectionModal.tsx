/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../../hooks';
import { useTanQuery } from '../../hooks/reactQueryAlias';
import SourceCodeView from '../SourceCodeView';
import BAISkeletonAstryx from '../astryx-bui/BAISkeletonAstryx';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex, BAIModal, BAIModalProps, BAIText } from 'backend.ai-ui';
import { RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
        <Text as="p" display="block">
          {t('session.VSCodeRemoteDescription')}
        </Text>

        <BAIFlex direction="column" gap="xs" align="stretch">
          <Text weight="semibold">{t('session.ConnectionInformation')}</Text>
          {status === 'success' ? (
            <MetadataList
              columns="single"
              label={{ position: 'start', width: 210 }}
            >
              <MetadataListItem label={t('session.VSCodeRemotePasswordTitle')}>
                <BAIText code copyable>
                  {password ?? ''}
                </BAIText>
              </MetadataListItem>
            </MetadataList>
          ) : status === 'pending' ? (
            <BAISkeletonAstryx variant="input" />
          ) : (
            <Banner
              status="warning"
              title={t('session.VSCodeRemotePasswordFetchError')}
              description={t(
                'session.VSCodeRemotePasswordFetchErrorDescription',
              )}
              endContent={
                <Button
                  size="sm"
                  icon={<RotateCw size="1em" />}
                  label={t('button.Retry')}
                  clickAction={async () => {
                    await refetch();
                  }}
                />
              }
            />
          )}
        </BAIFlex>

        <BAIFlex direction="column" gap="xs" align="stretch">
          <Text>{t('session.VSCodeRemotePasswordFallbackInstructions')}</Text>
          <SourceCodeView language="shell">
            {`cat ${PASSWORD_FILE_PATH}`}
          </SourceCodeView>
        </BAIFlex>

        <Text>{t('session.VSCodeRemoteNoticeSSHConfig')}</Text>
        <SourceCodeView language="shell">{sshConfig}</SourceCodeView>

        {/* PILOT-DECISION: antd Button `href`/`target` (anchor-button) has no
            Astryx Button equivalent; the vscode:// deep link opens via
            window.open instead. */}
        <Button
          variant="primary"
          size="lg"
          label={t('session.appLauncher.OpenVSCodeRemote')}
          onClick={() => {
            globalThis.open(vscodeUri, '_blank');
          }}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default VSCodeDesktopConnectionModal;
