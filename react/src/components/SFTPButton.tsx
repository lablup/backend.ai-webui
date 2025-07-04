import { SFTPButtonImageNodeFragment$key } from '../__generated__/SFTPButtonImageNodeFragment.graphql';
import { createSessionConfig } from '../helper';
import { useSuspendedBackendaiClient, useCurrentDomainValue } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import {
  useCurrentProjectValue,
  useResourceGroupsForCurrentProject,
} from '../hooks/useCurrentProject';
import { generateSessionId } from '../pages/SessionLauncherPage';
import SFTPInfoModal from './SFTPInfoModal';
import { Image, App, Button, Grid, Tooltip } from 'antd';
import _ from 'lodash';
import { LegacyRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SFTPButtonProps {
  vfolderName: string;
  folderExplorerRef: LegacyRef<HTMLDivElement>;
  imageNodeFrgmt?: SFTPButtonImageNodeFragment$key | null;
}

const SFTPButton: React.FC<SFTPButtonProps> = ({
  vfolderName,
  folderExplorerRef,
  imageNodeFrgmt,
}) => {
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const { lg } = Grid.useBreakpoint();
  const { allSftpScalingGroups } = useResourceGroupsForCurrentProject();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const imageNode = useFragment(
    graphql`
      fragment SFTPButtonImageNodeFragment on ImageNode {
        id
        name @deprecatedSince(version: "24.12.0")
        namespace @since(version: "24.12.0")
        registry
        tag
        architecture
        resource_limits {
          key
          min
        }
        labels {
          key
          value
        }
      }
    `,
    imageNodeFrgmt,
  );

  const sftpConfig = useMemo(() => {
    const resourceLimits = _.get(imageNode, 'resource_limits', []);
    const [defaultSSHImage, architecture] = _.split(
      baiClient._config?.systemSSHImage,
      '@',
    );
    const SFTPImage = defaultSSHImage
      ? defaultSSHImage
      : `${_.get(imageNode, 'registry')}/${_.get(imageNode, 'namespace') ?? _.get(imageNode, 'name')}:${_.get(imageNode, 'tag')}`;

    return {
      imageNode,
      resourceLimits,
      SFTPImage,
      architecture:
        architecture || _.get(imageNode, 'architecture', 'x86_64') || 'x86_64',
    };
  }, [imageNode, baiClient._config?.systemSSHImage]);

  const sessionName = useMemo(() => generateSessionId(), []);

  const resources = useMemo(
    () =>
      createSessionConfig(
        vfolderName,
        currentDomain,
        currentProject?.name,
        _.toArray(sftpConfig.resourceLimits ?? []),
        sftpConfig.architecture,
        _.get(sftpConfig.imageNode, 'labels', {}),
        {
          type: 'system',
          config: {
            // TODO: SFTP scaling group should be selected by user
            scaling_group: allSftpScalingGroups?.[0],
          },
        },
      ),
    [
      vfolderName,
      currentDomain,
      currentProject?.name,
      sftpConfig.resourceLimits,
      sftpConfig.architecture,
      allSftpScalingGroups,
      sftpConfig.imageNode,
    ],
  );

  const executeSFTP = async () => {
    if (!sftpConfig.SFTPImage) {
      message.error(t('data.explorer.SFTPSessionNotAvailable'));
      return;
    }

    const sessionPromise = baiClient
      .createIfNotExists(sftpConfig.SFTPImage, sessionName, resources, 10000)
      .then((res: { created: boolean; status: string }) => {
        // When session is already created with the same name, the status code
        // is 200, but the response body has 'created' field as false. For better
        // user experience, we show the notification message.
        if (!res?.created) {
          // message.warning(t('session.launcher.SessionAlreadyExists'));
          throw new Error(t('session.launcher.SessionAlreadyExists'));
        }
        if (res?.status === 'CANCELLED') {
          // Case about failed to start new session kind of "docker image not found" or etc.
          throw new Error(
            t('data.explorer.NumberOfSFTPSessionsExceededTitle'),
            {
              cause: t('data.explorer.NumberOfSFTPSessionsExceededBody'),
            },
          );
        }
        return res;
      })
      .catch((err: any) => {
        if (err?.message?.includes('The session already exists')) {
          throw new Error(t('session.launcher.SessionAlreadyExists'));
        } else {
          throw err;
        }
      });

    upsertNotification({
      key: 'session-launcher:' + sessionName,
      backgroundTask: {
        promise: sessionPromise,
        status: 'pending',
        onChange: {
          pending: t('session.PreparingSession'),
          resolved: t('eduapi.ComputeSessionPrepared'),
        },
      },
      duration: 0,
      message: t('general.Session') + ': ' + sessionName,
      open: true,
    });

    let backupTo = '';

    return await sessionPromise
      .then((res: { sessionId: string }) => {
        upsertNotification({
          key: 'session-launcher:' + sessionName,
          to: {
            pathname: '/session',
            search: new URLSearchParams({
              sessionDetail: res.sessionId,
            }).toString(),
          },
        });
        backupTo = `/session?sessionDetail=${res.sessionId}`;
        setSessionId(res.sessionId);
      })
      .catch(() => {
        upsertNotification({
          key: 'session-launcher:' + sessionName,
          to: backupTo,
          toText: t('button.Edit'),
        });
      });
  };

  return (
    <>
      <Tooltip title={!lg && t('data.explorer.RunSSH/SFTPserver')}>
        <Button
          icon={
            <Image
              width="18px"
              src="/resources/icons/sftp.png"
              alt="SSH / SFTP"
              preview={false}
            />
          }
          onClick={() => {
            // baiClient.isManagerVersionCompatibleWith('25.11.0')
            baiClient.isManagerVersionCompatibleWith('24.11.0')
              ? executeSFTP()
              : // @ts-ignore
                folderExplorerRef.current?._executeSSHProxyAgent();
          }}
        >
          {lg && t('data.explorer.RunSSH/SFTPserver')}
        </Button>
      </Tooltip>
      {sessionId && (
        <SFTPInfoModal
          sessionId={sessionId}
          mountedVfolderName={vfolderName}
          open={!!sessionId}
          onCancel={() => setSessionId(null)}
        />
      )}
    </>
  );
};

export default SFTPButton;
