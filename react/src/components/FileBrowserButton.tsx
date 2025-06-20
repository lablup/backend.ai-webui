import {
  FileBrowserButtonImageNodeFragment$key,
  FileBrowserButtonImageNodeFragment$data,
} from '../__generated__/FileBrowserButtonImageNodeFragment.graphql';
import { addNumberWithUnits } from '../helper';
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

type ResourceLimits = NonNullable<
  NonNullable<FileBrowserButtonImageNodeFragment$data>[number]['resource_limits']
>;

const RESOURCE_DEFAULTS = {
  CPU: 1,
  MEMORY: '256m',
  SHMEM: '64m',
  FALLBACK_MEMORY: '320m',
} as const;

const calculateResources = (
  resourceLimits: ResourceLimits | null,
  labels: any,
) => {
  const limits = resourceLimits || [];
  const cpu =
    limits.find((r) => r?.key === 'cpu')?.min || RESOURCE_DEFAULTS.CPU;
  const shmem =
    labels?.['ai.backend.resource.preferred.shmem'] || RESOURCE_DEFAULTS.SHMEM;
  const baseMem =
    limits.find((r) => r?.key === 'mem')?.min || RESOURCE_DEFAULTS.MEMORY;

  return {
    cpu: cpu as number,
    mem:
      addNumberWithUnits(baseMem, shmem, 'm') ||
      RESOURCE_DEFAULTS.FALLBACK_MEMORY,
  };
};

const createSessionConfig = (
  vfolderName: string,
  domain: string,
  projectName: string,
  resourceLimits: ResourceLimits | null,
  architecture?: string,
): SessionResources => ({
  cluster_mode: 'single-node',
  cluster_size: 1,
  domain,
  group_name: projectName,
  ...(architecture && { architecture }),
  config: {
    mounts: [vfolderName],
    resources: {
      ..._.mapValues(_.keyBy(resourceLimits || [], 'key'), 'min'),
      ...calculateResources(resourceLimits, {}),
    },
  },
});

interface FileBrowserButtonProps {
  vfolderName: string;
  folderExplorerRef: LegacyRef<HTMLDivElement>;
  imageNodesFrgmt?: FileBrowserButtonImageNodeFragment$key | null;
}

const FileBrowserButton: React.FC<FileBrowserButtonProps> = ({
  vfolderName,
  folderExplorerRef,
  imageNodesFrgmt,
}) => {
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const { lg } = Grid.useBreakpoint();

  const imageNodes = useFragment(
    graphql`
      fragment FileBrowserButtonImageNodeFragment on ImageNode
      @relay(plural: true) {
        id
        name @deprecatedSince(version: "24.12.0")
        namespace @since(version: "24.12.0")
        # installed @since(version: "25.11.0")
        installed @since(version: "24.11.0")
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
    imageNodesFrgmt,
  );

  const installedFilebrowserImage = _.find(imageNodes, (node) =>
    _.get(node, 'installed', false),
  );

  const filebrowserConfig = useMemo(() => {
    const resourceLimits = _.get(
      installedFilebrowserImage,
      'resource_limits',
      [],
    );
    const { cpu, mem } = calculateResources(
      _.toArray(resourceLimits ?? []),
      _.get(installedFilebrowserImage, 'labels', {}),
    );
    const [defaultFileBrowserImage, architecture] = _.split(
      baiClient._config?.defaultFileBrowserImage,
      '@',
    );
    const filebrowserImage = defaultFileBrowserImage
      ? defaultFileBrowserImage
      : `${_.get(installedFilebrowserImage, 'registry')}/${_.get(installedFilebrowserImage, 'namespace') ?? _.get(installedFilebrowserImage, 'name')}:${_.get(installedFilebrowserImage, 'tag')}`;

    return {
      installedFilebrowserImage,
      resourceLimits,
      cpu,
      mem,
      filebrowserImage,
      architecture,
    };
  }, [installedFilebrowserImage, baiClient._config?.defaultFileBrowserImage]);

  const sessionName = useMemo(() => generateSessionId(), []);

  const resources = useMemo(
    () =>
      createSessionConfig(
        vfolderName,
        currentDomain,
        currentProject?.name,
        _.toArray(filebrowserConfig.resourceLimits ?? []),
        filebrowserConfig.architecture,
      ),
    [vfolderName, currentDomain, currentProject?.name, filebrowserConfig],
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
        30000,
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
          // baiClient.isManagerVersionCompatibleWith('25.11.0')
          baiClient.isManagerVersionCompatibleWith('24.11.0')
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
