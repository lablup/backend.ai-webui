/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import SourceCodeView from '../SourceCodeView';
import { Alert, Descriptions } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { SFTPConnectionInfoModalFragment$key } from 'src/__generated__/SFTPConnectionInfoModalFragment.graphql';
import { useSuspendedBackendaiClient } from 'src/hooks';
import { useTanQuery } from 'src/hooks/reactQueryAlias';

const useStyles = createStyles(({ css, token }) => ({
  description: css`
    .ant-descriptions-header {
      margin-bottom: ${token.marginSM}px !important;
    }
    .ant-descriptions-item {
      padding-bottom: ${token.paddingXXS}px !important;
    }
  `,
}));

type DirectAccessInfo = {
  kernel_role: string;
  public_host: string;
  session_type: 'interactive' | 'batch' | 'inference' | 'system';
  sshd_ports: number[];
};

interface SFTPConnectionInfoModalProps extends BAIModalProps {
  sessionFrgmt: SFTPConnectionInfoModalFragment$key;
  host?: string;
  port?: number;
}

const SFTPConnectionInfoModal: React.FC<SFTPConnectionInfoModalProps> = ({
  sessionFrgmt,
  host,
  port,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const baiClient = useSuspendedBackendaiClient();

  const session = useFragment(
    graphql`
      fragment SFTPConnectionInfoModalFragment on ComputeSessionNode {
        row_id @required(action: NONE)
        vfolder_mounts
      }
    `,
    sessionFrgmt,
  );

  const { data: directAccessInfo } = useTanQuery<DirectAccessInfo>({
    queryKey: ['directAccessInfo', session?.row_id],
    queryFn: () => {
      return baiClient
        .get_direct_access_info(session?.row_id)
        .then((res: DirectAccessInfo) => ({
          ...res,
          public_host: res.public_host.replace(/^https?:\/\//, ''),
        }));
    },
    enabled: _.isEmpty(host) || _.isEmpty(port),
  });

  const readAndDownloadSSHKey = async () => {
    const path = '/home/work/id_container';
    const blob = await baiClient?.download_single(session?.row_id, path);
    const rawText = await blob?.text();
    // The raw text may contain some extra characters before the key start.
    // So find the start point and slice it.
    const index = rawText?.indexOf('-----');
    const cleanedKey = rawText?.slice(index);
    const element = document.createElement('a');
    const file = new Blob([cleanedKey || ''], {
      type: 'application/octet-stream',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'id_container';
    document.body.appendChild(element);
    element.click();
  };

  const displayHost = host || directAccessInfo?.public_host;
  const displayPorts = port || directAccessInfo?.sshd_ports.join(', ');
  const firstSshdPort = port || directAccessInfo?.sshd_ports[0];

  return (
    <BAIModal
      width={800}
      title={t('session.SFTPConnection')}
      {...modalProps}
      okText={t('session.appLauncher.DownloadSSHKey')}
      onOk={readAndDownloadSSHKey}
    >
      <BAIFlex className={styles.description} direction="column" gap="md">
        <Alert
          showIcon
          type="info"
          title={<Trans i18nKey="session.SFTPDescription" />}
        />
        <Alert
          showIcon
          type="warning"
          title={
            <>
              <Trans i18nKey="session.SFTPExtraNotification" />
              &nbsp;{t('session.SFTPSessionManagementDesc')}
            </>
          }
        />

        <Descriptions
          title={t('session.ConnectionInformation')}
          column={1}
          labelStyle={{ minWidth: 60 }}
        >
          <Descriptions.Item label={t('session.User')}>work</Descriptions.Item>
          <Descriptions.Item label={t('session.Host')}>
            {displayHost}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.Port')}>
            {displayPorts}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions title={t('session.ConnectionExample')} column={1}>
          <Descriptions.Item>
            <BAIFlex direction="column" gap="xs" style={{ width: '100%' }}>
              <SourceCodeView
                language={'shell'}
              >{`sftp -i ./id_container -P ${firstSshdPort} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null work@${displayHost}`}</SourceCodeView>
              <SourceCodeView
                language={'shell'}
              >{`scp -i ./id_container -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -P ${firstSshdPort} -rp /path/to/source work@${displayHost}:~/${session?.vfolder_mounts?.[0] ?? ''}`}</SourceCodeView>
              <SourceCodeView
                language={'shell'}
              >{`rsync -av -e "ssh -i ./id_container -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p ${directAccessInfo?.sshd_ports[0]}" /path/to/source/ work@${directAccessInfo?.public_host}:~/${session?.vfolder_mounts?.[0] ? `${session?.vfolder_mounts?.[0]}/` : ''}`}</SourceCodeView>
            </BAIFlex>
          </Descriptions.Item>
        </Descriptions>
      </BAIFlex>
    </BAIModal>
  );
};

export default SFTPConnectionInfoModal;
