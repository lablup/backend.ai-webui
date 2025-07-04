import { FileBrowserButtonImageNodeFragment$key } from '../__generated__/FileBrowserButtonImageNodeFragment.graphql';
import { createSessionConfig } from '../helper';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  generateSessionId,
  SessionResources,
} from '../pages/SessionLauncherPage';
import { Button, Tooltip, Image, Grid, App } from 'antd';
import _ from 'lodash';
import React, { LegacyRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface FileBrowserButtonProps {
  vfolderName: string;
  folderExplorerRef: LegacyRef<HTMLDivElement>;
  imageNodeFrgmt?: FileBrowserButtonImageNodeFragment$key | null;
}

const FileBrowserButton: React.FC<FileBrowserButtonProps> = ({
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

  const imageNode = useFragment(
    graphql`
      fragment FileBrowserButtonImageNodeFragment on ImageNode {
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

  const filebrowserConfig = useMemo(() => {
    const resourceLimits = _.get(imageNode, 'resource_limits', []);
    const [defaultFileBrowserImage, architecture] = _.split(
      baiClient._config?.defaultFileBrowserImage,
      '@',
    );
    const filebrowserImage = defaultFileBrowserImage
      ? defaultFileBrowserImage
      : `${_.get(imageNode, 'registry')}/${_.get(imageNode, 'namespace') ?? _.get(imageNode, 'name')}:${_.get(imageNode, 'tag')}`;

    return {
      imageNode,
      resourceLimits,
      filebrowserImage,
      architecture:
        architecture || _.get(imageNode, 'architecture', 'x86_64') || 'x86_64',
    };
  }, [imageNode, baiClient._config?.defaultFileBrowserImage]);

  const sessionName = useMemo(() => generateSessionId(), []);

  const resources = useMemo(
    () =>
      createSessionConfig(
        vfolderName,
        currentDomain,
        currentProject?.name,
        _.toArray(filebrowserConfig.resourceLimits ?? []),
        filebrowserConfig.architecture,
        _.get(imageNode, 'labels', {}),
      ),
    [
      vfolderName,
      currentDomain,
      currentProject?.name,
      filebrowserConfig.resourceLimits,
      filebrowserConfig.architecture,
    ],
  );

  const executeFileBrowser = async () => {
    if (!filebrowserConfig.filebrowserImage) {
      message.error(t('data.explorer.NoImagesSupportingFileBrowser'));
      return;
    }

    const sessionPromise = baiClient
      .createIfNotExists(
        filebrowserConfig.filebrowserImage,
        sessionName,
        resources,
        10000,
      )
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
          throw new Error(t('session.launcher.FailedToStartNewSession'));
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
      .then(
        (res: {
          servicePorts: Array<{
            name: string;
          }>;
          sessionId: string;
        }) => {
          // After the session is created, add a "See Details" button to navigate to the session page.
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
          const servicePorts = res?.servicePorts;
          const appOptions = {
            'session-uuid': res.sessionId,
            'session-name': sessionName,
            'access-key': '',
            runtime: 'filebrowser',
            arguments: { '--root': '/home/work/' + vfolderName },
          };
          // only launch filebrowser app when it has valid service ports
          if (
            servicePorts?.length &&
            _.filter(servicePorts, (el) => el?.name === 'filebrowser').length
          ) {
            // @ts-ignore
            globalThis.appLauncher.showLauncher(appOptions);
          }
        },
      )
      .catch(() => {
        upsertNotification({
          key: 'session-launcher:' + sessionName,
          to: backupTo,
          toText: t('button.Edit'),
        });
      });
  };

  // Make sure to return the JSX element
  return (
    <Tooltip title={!lg && t('data.explorer.ExecuteFileBrowser')}>
      <Button
        icon={
          <Image
            width="18px"
            src="/resources/icons/filebrowser.svg"
            alt="File Browser"
            preview={false}
          />
        }
        onClick={() => {
          baiClient.isManagerVersionCompatibleWith('25.11.0')
            ? executeFileBrowser()
            : // @ts-ignore
              folderExplorerRef.current?._executeFileBrowser();
        }}
      >
        {lg && t('data.explorer.ExecuteFileBrowser')}
      </Button>
    </Tooltip>
  );
};

export default FileBrowserButton;
