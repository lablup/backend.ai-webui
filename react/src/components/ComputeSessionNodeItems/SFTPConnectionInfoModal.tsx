/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SFTPConnectionInfoModalFragment$key } from '../../__generated__/SFTPConnectionInfoModalFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useTanQuery } from '../../hooks/reactQueryAlias';
import SourceCodeView from '../SourceCodeView';
import { Banner } from '@astryxdesign/core/Banner';
import { Heading } from '@astryxdesign/core/Heading';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import {
  BAIFlex,
  BAIMetadataList,
  BAIModal,
  BAIModalProps,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation, Trans } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

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
  const baiClient = useSuspendedBackendaiClient();

  const session = useFragment(
    graphql`
      fragment SFTPConnectionInfoModalFragment on ComputeSessionNode {
        row_id @required(action: NONE)
        # TODO(needs-backend): pagination args are not supported here. The
        # backend resolve_vfolder_nodes resolver rejects first/last
        # (unexpected keyword argument) even though the schema declares them,
        # so we fetch all edges and take the first one in JS. Migrate to the
        # V2 VFolder connection once ComputeSessionNode exposes it (see FR-2619).
        #
        # @since matches the other vfolder_nodes usages so it merges cleanly on
        # the shared ComputeSessionNode selection (this project targets >= 26,
        # so the field is always present and needs no vfolder_mounts fallback).
        vfolder_nodes @since(version: "25.4.0") {
          edges {
            node {
              name
            }
          }
        }
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
  // `vfolder_mounts` returns the UUID, so use the resolved vfolder name instead.
  const mountFolderName = session?.vfolder_nodes?.edges?.[0]?.node?.name ?? '';

  return (
    <BAIModal
      width={800}
      title={t('session.SFTPConnection')}
      {...modalProps}
      okText={t('session.appLauncher.DownloadSSHKey')}
      onOk={readAndDownloadSSHKey}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Banner
          status="info"
          title={<Trans i18nKey="session.SFTPDescription" />}
        />
        <Banner
          status="warning"
          title={
            <>
              <Trans i18nKey="session.SFTPExtraNotification" />
              &nbsp;{t('session.SFTPSessionManagementDesc')}
            </>
          }
        />

        <BAIMetadataList
          title={t('session.ConnectionInformation')}
          columns="single"
          label={{ position: 'start', width: 60 }}
        >
          <MetadataListItem label={t('session.User')}>work</MetadataListItem>
          <MetadataListItem label={t('session.Host')}>
            {displayHost}
          </MetadataListItem>
          <MetadataListItem label={t('session.Port')}>
            {displayPorts}
          </MetadataListItem>
        </BAIMetadataList>
        <BAIFlex
          direction="column"
          align="stretch"
          gap="sm"
          style={{ width: '100%' }}
        >
          <Heading level={5}>{t('session.ConnectionExample')}</Heading>
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xs"
            style={{ width: '100%' }}
          >
            <SourceCodeView
              language={'shell'}
            >{`sftp -i ./id_container -P ${firstSshdPort} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null work@${displayHost}`}</SourceCodeView>
            <SourceCodeView
              language={'shell'}
            >{`scp -i ./id_container -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -P ${firstSshdPort} -rp /path/to/source work@${displayHost}:~/${mountFolderName}`}</SourceCodeView>
            <SourceCodeView
              language={'shell'}
            >{`rsync -av -e "ssh -i ./id_container -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p ${firstSshdPort}" /path/to/source/ work@${displayHost}:~/${mountFolderName ? `${mountFolderName}/` : ''}`}</SourceCodeView>
          </BAIFlex>
        </BAIFlex>
      </BAIFlex>
    </BAIModal>
  );
};

export default SFTPConnectionInfoModal;
