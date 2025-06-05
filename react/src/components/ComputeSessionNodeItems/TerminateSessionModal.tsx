import {
  TerminateSessionModalFragment$data,
  TerminateSessionModalFragment$key,
} from '../../__generated__/TerminateSessionModalFragment.graphql';
import { TerminateSessionModalRefetchQuery } from '../../__generated__/TerminateSessionModalRefetchQuery.graphql';
import { filterEmptyItem } from '../../helper';
import { BackendAIClient, useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useSetBAINotification } from '../../hooks/useBAINotification';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { usePainKiller } from '../../hooks/usePainKiller';
import { usePromiseTracker } from '../../usePromiseTracker';
import BAIModal from '../BAIModal';
import Flex from '../Flex';
import { Card, Checkbox, ModalProps, Typography } from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchQuery, useFragment, useRelayEnvironment } from 'react-relay';

interface TerminateSessionModalProps
  extends Omit<ModalProps, 'onOk' | 'onCancel'> {
  sessionFrgmts?: TerminateSessionModalFragment$key;
  onRequestClose: (success: boolean) => void;
}

// Cannot destroy sessions in scheduled/preparing/pulling/prepared/creating/terminating/error status

const useStyle = createStyles(({ css, token }) => {
  return {
    custom: css`
      ul {
        list-style-type: circle;
        padding-left: ${token.paddingMD}px;
      }
    `,
  };
});

type KernelType = NonNullableNodeOnEdges<
  NonNullable<TerminateSessionModalFragment$data[number]>['kernel_nodes']
>;

type SessionForTerminateModal = NonNullable<
  TerminateSessionModalFragment$data[number]
>;

const sendRequest = async (
  rqst: {
    uri: string;
  } & RequestInit,
) => {
  let resp;
  let body;
  try {
    if (rqst.method === 'GET') {
      rqst.body = undefined;
    }
    resp = await fetch(rqst.uri, rqst);
    const contentType = resp.headers.get('Content-Type');
    if (contentType === null) {
      body = resp.ok;
      if (!resp.ok) {
        // @ts-ignore
        throw new Error(resp);
      }
    } else if (
      contentType.startsWith('application/json') ||
      contentType.startsWith('application/problem+json')
    ) {
      body = await resp.json();
    } else if (contentType.startsWith('text/')) {
      body = await resp.text();
    } else {
      body = await resp.blob();
    }
    if (!resp.ok) {
      throw body;
    }
  } catch (e) {
    return resp;
  }
  return body;
};

const getWSProxyVersion = async (
  resourceGroupIdOfSession: string,
  projectId: string,
  baiClient: BackendAIClient,
) => {
  // TODO: remove globalThis.appLauncher(backend-ai-app-launcher) dependency after migration to React
  if (baiClient.debug === true) {
    // @ts-ignore
    if (globalThis.appLauncher?.forceUseV1Proxy?.checked) return 'v1';
    // @ts-ignore
    else if (globalThis.appLauncher?.forceUseV2Proxy?.checked) return 'v2';
  }

  // @ts-ignore
  if (globalThis.isElectron) {
    return 'v1';
  }
  return baiClient.scalingGroup
    .getWsproxyVersion(resourceGroupIdOfSession, projectId)
    .then((result: { wsproxy_version: string }) => {
      return result.wsproxy_version;
    });
};

const getProxyURL = async (
  resourceGroupIdOfSession: string,
  projectId: string,
  baiClient: BackendAIClient,
) => {
  let url = 'http://127.0.0.1:5050/';
  if (
    // @ts-ignore
    globalThis.__local_proxy !== undefined &&
    // @ts-ignore
    globalThis.__local_proxy.url !== undefined
  ) {
    // @ts-ignore
    url = globalThis.__local_proxy.url;
  } else if (baiClient._config.proxyURL !== undefined) {
    url = baiClient._config.proxyURL;
  }
  if (resourceGroupIdOfSession !== undefined && projectId !== undefined) {
    const wsproxyVersion = await getWSProxyVersion(
      resourceGroupIdOfSession,
      projectId,
      baiClient,
    );
    if (wsproxyVersion !== 'v1') {
      url = new URL(`${wsproxyVersion}/`, url).href;
    }
  }
  return url;
};

const terminateApp = async (
  session: SessionForTerminateModal,
  accessKey: string,
  currentProjectId: string,
  baiClient: BackendAIClient,
) => {
  const proxyURL = await getProxyURL(
    session.scaling_group,
    currentProjectId,
    baiClient,
  );

  const rqst = {
    method: 'GET',
    uri: new URL(`proxy/${accessKey}/${session.row_id}`, proxyURL).href,
  };

  return sendRequest(rqst).then((response) => {
    let uri = new URL(`proxy/${accessKey}/${session.row_id}/delete`, proxyURL);
    if (localStorage.getItem('backendaiwebui.appproxy-permit-key')) {
      uri.searchParams.set(
        'permit_key',
        localStorage.getItem('backendaiwebui.appproxy-permit-key') || '',
      );
      uri = new URL(uri.href);
    }
    if (response !== undefined && response.code !== 404) {
      return sendRequest({
        method: 'GET',
        uri: uri.href,
        credentials: 'include',
        mode: 'cors',
      });
    }
    return true;
  });
};

const TerminateSessionModal: React.FC<TerminateSessionModalProps> = ({
  sessionFrgmts,
  onRequestClose,
  ...modalProps
}) => {
  const openTerminateModal = false;
  const { t } = useTranslation();
  const { styles } = useStyle();
  const sessions = useFragment(
    graphql`
      fragment TerminateSessionModalFragment on ComputeSessionNode
      @relay(plural: true) {
        id @required(action: THROW)
        row_id
        name
        scaling_group @required(action: NONE)
        access_key
        kernel_nodes {
          edges {
            node {
              container_id
              agent_id
            }
          }
        }
      }
    `,
    sessionFrgmts,
  );

  const [isForce, setIsForce] = useState(false);
  const userRole = useCurrentUserRole();

  const baiClient = useSuspendedBackendaiClient();

  const currentProject = useCurrentProjectValue();

  const { pendingCount, trackPromise } = usePromiseTracker();

  const terminiateSession = (session: SessionForTerminateModal) => {
    return terminateApp(
      session,
      baiClient._config.accessKey,
      currentProject.id,
      baiClient,
    )
      .catch((e) => {
        return {
          error: e,
        };
      })
      .then((result) => {
        const err = result?.error;
        if (
          err === undefined || //no error
          (err && // Even if wsproxy address is invalid, session must be deleted.
            err.message &&
            (err.statusCode === 404 || err.statusCode === 500))
        ) {
          // BAI client destroy try to request 3times as default
          return baiClient.destroy(session.row_id, session.access_key, isForce);
        } else {
          throw err;
        }
      });
  };

  const relayEvn = useRelayEnvironment();
  const painKiller = usePainKiller();
  const { upsertNotification } = useSetBAINotification();

  return (
    <BAIModal
      centered
      title={t('session.TerminateSession')}
      open={openTerminateModal}
      confirmLoading={pendingCount > 0}
      onOk={() => {
        const promises = _.map(
          filterEmptyItem(_.castArray(sessions)),
          (session) => {
            return terminiateSession(session)
              .catch((err) => {
                upsertNotification({
                  message: painKiller.relieve(err?.title),
                  description: err?.description,
                  open: true,
                });
              })
              .finally(() => {
                // refetch session node
                return fetchQuery<TerminateSessionModalRefetchQuery>(
                  relayEvn,
                  graphql`
                    query TerminateSessionModalRefetchQuery(
                      $id: GlobalIDField!
                      $project_id: UUID!
                    ) {
                      compute_session_node(id: $id, project_id: $project_id) {
                        id
                        status
                      }
                    }
                  `,
                  {
                    id: session.id,
                    project_id: currentProject.id,
                  },
                ).toPromise();
              });
          },
        );
        promises.map(trackPromise);
        Promise.allSettled(promises).then((results) => {
          setIsForce(false);
          onRequestClose(true);
          // TODO: remove below code after session list migration to React
          const event = new CustomEvent('backend-ai-session-list-refreshed', {
            detail: 'running',
          });
          document.dispatchEvent(event);
        });
      }}
      okText={isForce ? t('button.ForceTerminate') : t('session.Terminate')}
      okType="danger"
      okButtonProps={{
        type: isForce ? 'primary' : 'default',
      }}
      onCancel={() => {
        setIsForce(false);
        onRequestClose(false);
      }}
      {...modalProps}
    >
      <Flex
        className={styles.custom}
        direction="column"
        align="stretch"
        gap={'xs'}
      >
        <Typography.Text>
          {t('userSettings.SessionTerminationDialog')}
        </Typography.Text>
        <Typography.Text mark>
          {sessions?.length === 1
            ? sessions?.[0]?.name
            : `${sessions?.length} sessions`}
        </Typography.Text>
        <Checkbox
          checked={isForce}
          onChange={(e) => {
            setIsForce(e.target.checked);
          }}
        >
          {t('button.ForceTerminate')}
        </Checkbox>
        {isForce && (
          <Card>
            <Typography.Paragraph type="danger">
              {t('session.ForceTerminateWarningMsg')}
            </Typography.Paragraph>
            <ul>
              <li>{t('session.ForceTerminateWarningMsg2')}</li>
              <li>{t('session.ForceTerminateWarningMsg3')}</li>
            </ul>
            {userRole === 'superadmin' && (
              <>
                <Card type="inner" title={t('session.ContainerToCleanUp')}>
                  {_.chain(sessions)
                    .map((s) => s?.kernel_nodes?.edges)
                    .map((edges) => edges?.map((e) => e?.node))
                    .flatten()
                    .groupBy('agent_id')
                    .map((kernels: Array<KernelType>, agentId: string) => {
                      return (
                        <>
                          {agentId}
                          <ul key={agentId}>
                            {kernels.map((k) => (
                              <li key={k.container_id}>
                                <Typography.Text copyable>
                                  {k.container_id}
                                </Typography.Text>
                              </li>
                            ))}
                          </ul>
                        </>
                      );
                    })
                    .value()}
                </Card>
              </>
            )}
          </Card>
        )}
      </Flex>
    </BAIModal>
  );
};

export default TerminateSessionModal;
