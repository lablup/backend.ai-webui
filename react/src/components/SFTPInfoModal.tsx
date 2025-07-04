import {
  useDownloadIDContainer,
  useSFTPDirectAccessInfo,
} from '../hooks/backendai';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { Button, Typography, Alert, theme } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SFTPInfoModalProps extends BAIModalProps {
  sessionId: string;
  mountedVfolderName: string;
}

const SFTPInfoModal: React.FC<SFTPInfoModalProps> = ({
  sessionId,
  mountedVfolderName,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { host, port } = useSFTPDirectAccessInfo(sessionId);
  const downloadIDContainer = useDownloadIDContainer(sessionId);
  const [expanded, setExpanded] = useState(false);

  const sftpCommand = `sftp -i ./id_container -P ${port} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null work@${host}`;

  const scpCommand = `scp -i ./id_container -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -P ${port} -rp /path/to/source work@${host}:~/${mountedVfolderName}`;

  const rsyncCommand = `rsync -av -e "ssh -i ./id_container -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p ${port}" /path/to/source/ work@${host}:~/${mountedVfolderName}/`;

  return (
    <BAIModal
      footer={null}
      title={t('session.SFTPConnection')}
      style={{ gap: token.sizeSM }}
    >
      <Typography.Paragraph
        ellipsis={{
          expandable: 'collapsible',
          rows: 3,
          expanded,
          onExpand: (_, info) => setExpanded(info.expanded),
        }}
      >
        {t('session.SFTPDescription')}
        <Alert
          type="info"
          showIcon
          message={t('session.ConnectionNotice')}
          description={t('session.SFTPExtraNotification')}
          style={{ marginTop: token.marginSM }}
        />
      </Typography.Paragraph>

      <Typography.Title level={5}>
        {t('session.ConnectionInformation')}
      </Typography.Title>
      <Flex direction="column" gap="sm">
        <Typography.Text copyable={{ text: 'work' }}>
          User: work
        </Typography.Text>
        <Typography.Text copyable={{ text: host }}>
          Host: {host}
        </Typography.Text>
        <Typography.Text copyable={{ text: String(port ?? '') }}>
          Port: {port}
        </Typography.Text>
      </Flex>

      <Typography.Title level={5}>
        {t('session.ConnectionExample')}
      </Typography.Title>
      <Flex align="start" justify="between" gap={'sm'}>
        <Typography.Paragraph>
          <pre style={{ margin: 0 }}>{sftpCommand}</pre>
        </Typography.Paragraph>
        <Typography.Text copyable={{ text: sftpCommand }} />
      </Flex>
      <Flex align="start" justify="between" gap={'sm'}>
        <Typography.Paragraph>
          <pre style={{ margin: 0 }}>{scpCommand}</pre>
        </Typography.Paragraph>
        <Typography.Text copyable={{ text: scpCommand }} />
      </Flex>
      <Flex align="start" justify="between" gap={'sm'}>
        <Typography.Paragraph>
          <pre style={{ margin: 0 }}>{rsyncCommand}</pre>
        </Typography.Paragraph>
        <Typography.Text copyable={{ text: rsyncCommand }} />
      </Flex>

      <Button
        type="primary"
        onClick={() => {
          downloadIDContainer();
        }}
        block
      >
        {t('session.appLauncher.DownloadSSHKey')}
      </Button>
    </BAIModal>
  );
};

export default SFTPInfoModal;
