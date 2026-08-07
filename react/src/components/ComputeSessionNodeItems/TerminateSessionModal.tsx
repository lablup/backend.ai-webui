/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  TerminateSessionModalFragment$data,
  TerminateSessionModalFragment$key,
} from '../../__generated__/TerminateSessionModalFragment.graphql';
import { TerminateSessionModalRefetchQuery } from '../../__generated__/TerminateSessionModalRefetchQuery.graphql';
import { App } from '../../app-shim';
import { requestLocalProxyToken } from '../../helper/localProxyToken';
import { BackendAIClient, useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useSetBAINotification } from '../../hooks/useBAINotification';
import { usePainKiller } from '../../hooks/usePainKiller';
import { usePromiseTracker } from '../../usePromiseTracker';
import { Card, Checkbox, type ModalProps, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { filterOutEmpty, BAIFlex, BAIModal } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  fetchQuery,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

interface TerminateSessionModalProps extends Omit<
  ModalProps,
  'onOk' | 'onCancel'
> {
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

// Budget for the best-effort wsproxy cleanup performed before a session is
// deleted. A proxy that accepts the TCP connection but never returns an HTTP
// response would otherwise leave these requests pending forever (FR-3398).
const WSPROXY_CLEANUP_TIMEOUT_MS = 10_000;

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
    resp = await fetch(rqst.uri, {
      ...rqst,
      // Abort an unresponsive proxy instead of hanging. The rejection is
      // caught below and reported as "no response", which the caller already
      // treats as "nothing to clean up".
      signal: rqst.signal ?? AbortSignal.timeout(WSPROXY_CLEANUP_TIMEOUT_MS),
    });
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
  } catch {
    return resp;
  }
  return body;
};

const getWSProxyVersion = async (
  resourceGroupIdOfSession: string,
  projectId: string,
  baiClient: BackendAIClient,
) => {
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
  wsproxyVersion?: string,
) => {
  let url = 'http://127.0.0.1:5050/';
  // The `_config.proxyURL` branch uses a truthy check, which covers undefined,
  // null, and empty string. The Backend.AI client initializes
  // `_config._proxyURL = null` by default, and `config.toml` can ship
  // `wsproxy.proxyURL = ""`. Both must fall through to the default URL above
  // instead of overwriting it with a non-string value (which would later throw
  // in `new URL(...)`). Mirrors the same guard in `useBackendAIAppLauncher`'s
  // `getProxyURL`.
  if (
    // @ts-ignore
    globalThis.__local_proxy !== undefined &&
    // @ts-ignore
    globalThis.__local_proxy.url !== undefined
  ) {
    // @ts-ignore
    url = globalThis.__local_proxy.url;
  } else if (baiClient._config.proxyURL) {
    url = baiClient._config.proxyURL;
  }
  if (resourceGroupIdOfSession !== undefined && projectId !== undefined) {
    const version =
      wsproxyVersion ??
      (await getWSProxyVersion(resourceGroupIdOfSession, projectId, baiClient));
    if (version !== 'v1') {
      url = new URL(`${version}/`, url).href;
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
  const wsproxyVersion = await getWSProxyVersion(
    session.scaling_group,
    currentProjectId,
    baiClient,
  );
  const proxyURL = await getProxyURL(
    session.scaling_group,
    currentProjectId,
    baiClient,
    wsproxyVersion,
  );
  // The local v1 proxy now requires the per-instance secret token returned by
  // /conf for the check and /delete routes (FR-3227). The v2 remote App Proxy
  // keeps using the access key. If the token cannot be obtained (e.g. /conf is
  // rejected), skip the wsproxy cleanup entirely — the session must still be
  // terminable (mirrors the "even if wsproxy address is invalid, session must
  // be deleted" invariant in terminateSession).
  let token: string;
  try {
    token =
      wsproxyVersion === 'v1'
        ? await requestLocalProxyToken(baiClient, proxyURL)
        : accessKey;
  } catch {
    return true;
  }

  const rqst = {
    method: 'GET',
    uri: new URL(`proxy/${token}/${session.row_id}`, proxyURL).href,
  };

  return sendRequest(rqst).then((response) => {
    let uri = new URL(`proxy/${token}/${session.row_id}/delete`, proxyURL);
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
  'use memo';
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
        project_id @required(action: THROW)
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

  const { pendingCount, trackPromise } = usePromiseTracker();

  // The wsproxy cleanup is best-effort: it releases a leftover app-proxy route
  // for the session. It must never prevent the deletion the user actually asked
  // for — an unreachable, misconfigured, or unresponsive proxy is not a reason
  // to keep a session alive (FR-3398). The previous guard only let `destroy()`
  // run for a 404/500 cleanup failure and re-threw everything else, so a
  // network-level failure silently skipped the deletion.
  //
  // The step is also time-boxed as a whole, not just at the `fetch` level:
  // `getWSProxyVersion` goes through the Backend.AI client, which applies no
  // request timeout of its own.
  const terminateSession = async (session: SessionForTerminateModal) => {
    await Promise.race([
      terminateApp(
        session,
        baiClient._config.accessKey,
        session.project_id,
        baiClient,
      ).catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, WSPROXY_CLEANUP_TIMEOUT_MS)),
    ]);
    // BAI client destroy try to request 3times as default
    return baiClient.destroy(session.row_id, session.access_key, isForce);
  };

  const relayEvn = useRelayEnvironment();
  const painKiller = usePainKiller();
  const { upsertNotification } = useSetBAINotification();
  const { message } = App.useApp();

  return (
    <BAIModal
      centered
      title={t('session.TerminateSession')}
      open={openTerminateModal}
      confirmLoading={pendingCount > 0}
      onOk={() => {
        const targetSessions = filterOutEmpty(_.castArray(sessions));
        const promises = _.map(targetSessions, (session) => {
          return terminateSession(session)
            .catch((err) => {
              upsertNotification({
                message: painKiller.relieve(err?.title),
                description: err?.description,
                open: true,
              });
              // Re-throw so Promise.allSettled below reports this session as
              // rejected and the success/partial-failure message can be derived
              // from the settled results.
              throw err;
            })
            .finally(() => {
              // refetch session node
              return (
                fetchQuery<TerminateSessionModalRefetchQuery>(
                  relayEvn,
                  graphql`
                    query TerminateSessionModalRefetchQuery(
                      $id: GlobalIDField!
                      $scope_id: ScopeField
                    ) {
                      compute_session_node(id: $id, scope_id: $scope_id) {
                        id
                        status
                      }
                    }
                  `,
                  {
                    id: session.id,
                    scope_id: `project:${session.project_id}`,
                  },
                )
                  .toPromise()
                  // Swallow refetch errors so the summary toast reflects only the
                  // termination outcome, not a failed post-termination refetch.
                  .catch(() => {})
              );
            });
        });
        promises.map(trackPromise);
        Promise.allSettled(promises).then((results) => {
          const rejectedCount = results.filter(
            (result) => result.status === 'rejected',
          ).length;
          const succeededCount = targetSessions.length - rejectedCount;
          if (rejectedCount > 0) {
            message.warning(t('session.SomeSessionsNotTerminated'));
          } else if (succeededCount > 0) {
            message.success(
              succeededCount === 1
                ? t('session.SessionTerminated')
                : t('session.SessionsTerminated'),
            );
          }
          setIsForce(false);
          onRequestClose(true);
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
      <BAIFlex
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
                  {_.map(
                    _.groupBy(
                      _.compact(
                        _.map(sessions, (s) => s?.kernel_nodes?.edges)
                          .map((edges) => edges?.map((e) => e?.node))
                          .flat(),
                      ),
                      'agent_id',
                    ),
                    (kernels: Array<KernelType>, agentId: string) => {
                      return (
                        <React.Fragment key={agentId}>
                          {agentId}
                          <ul>
                            {kernels.map((k) => (
                              <li key={k.container_id}>
                                <Typography.Text copyable>
                                  {k.container_id}
                                </Typography.Text>
                              </li>
                            ))}
                          </ul>
                        </React.Fragment>
                      );
                    },
                  )}
                </Card>
              </>
            )}
          </Card>
        )}
      </BAIFlex>
    </BAIModal>
  );
};

export default TerminateSessionModal;
