/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { TerminateSessionModalForProjectAdminFragment$key } from '../__generated__/TerminateSessionModalForProjectAdminFragment.graphql';
import { TerminateSessionModalForProjectAdminMutation } from '../__generated__/TerminateSessionModalForProjectAdminMutation.graphql';
import { useCurrentUserRole } from '../hooks/backendai';
import { App, Checkbox, type ModalProps, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import {
  BAICard,
  BAIFlex,
  BAIModal,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

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

export interface TerminateSessionModalForProjectAdminProps extends Omit<
  ModalProps,
  'onOk' | 'onCancel'
> {
  /** Sessions to terminate. A single-element list terminates one session;
   *  multiple elements perform a bulk terminate via the same mutation. */
  sessionsFrgmt?: TerminateSessionModalForProjectAdminFragment$key;
  onRequestClose: (success: boolean) => void;
}

/**
 * Terminate confirmation modal for the project-admin session list. Mirrors the
 * v1 `TerminateSessionModal` UI (message + highlighted name(s) + force-terminate
 * checkbox + per-agent container cleanup list), but drives the scope-agnostic
 * `terminateSessionsV2` mutation, which accepts an id array — so the same modal
 * handles single and bulk terminate. Per-session RBAC permission is enforced by
 * the backend bulk validator; any denial fails the whole request.
 */
const TerminateSessionModalForProjectAdmin: React.FC<
  TerminateSessionModalForProjectAdminProps
> = ({ sessionsFrgmt, onRequestClose, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyle();
  const { message } = App.useApp();
  const userRole = useCurrentUserRole();
  const [isForce, setIsForce] = useState(false);

  const sessions = filterOutNullAndUndefined(
    useFragment(
      graphql`
        fragment TerminateSessionModalForProjectAdminFragment on SessionV2
        @relay(plural: true) {
          id
          metadata {
            name
          }
          kernels {
            edges {
              node {
                id
                resource {
                  agentId
                  containerId
                }
              }
            }
          }
        }
      `,
      sessionsFrgmt,
    ),
  );

  const [commitTerminate, isInFlight] =
    useMutation<TerminateSessionModalForProjectAdminMutation>(graphql`
      mutation TerminateSessionModalForProjectAdminMutation(
        $sessionIds: [ID!]!
        $forced: Boolean!
      ) {
        terminateSessionsV2(sessionIds: $sessionIds, forced: $forced) {
          cancelled
          terminating
          forceTerminated
          skipped
        }
      }
    `);

  const handleClose = (success: boolean) => {
    setIsForce(false);
    onRequestClose(success);
  };

  // Kernels (container_id + agent_id) of all target sessions, grouped by agent,
  // for the force-terminate cleanup hint (superadmin only) — mirrors v1.
  const kernelsByAgent = _.groupBy(
    _.compact(
      _.flatMap(sessions, (session) =>
        session.kernels?.edges?.map((edge) => edge?.node),
      ),
    ),
    (kernel) => kernel?.resource?.agentId ?? '-',
  );

  return (
    <BAIModal
      centered
      title={t('session.TerminateSession')}
      okText={isForce ? t('button.ForceTerminate') : t('session.Terminate')}
      okType="danger"
      okButtonProps={{ type: isForce ? 'primary' : 'default' }}
      confirmLoading={isInFlight}
      onOk={() => {
        if (sessions.length === 0) {
          handleClose(false);
          return;
        }
        commitTerminate({
          variables: {
            sessionIds: sessions.map((session) => toLocalId(session.id)),
            forced: isForce,
          },
          onCompleted: (_response, errors) => {
            if (errors && errors.length > 0) {
              message.error(errors[0]?.message ?? t('general.ErrorOccurred'));
              return;
            }
            message.success(t('session.SessionTerminated'));
            handleClose(true);
          },
          onError: (error) => {
            message.error(error.message);
          },
        });
      }}
      onCancel={() => handleClose(false)}
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
          {sessions.length === 1
            ? (sessions[0]?.metadata?.name ?? '')
            : `${sessions.length} sessions`}
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
          <BAICard styles={{ body: { padding: token.padding } }}>
            <Typography.Paragraph type="danger">
              {t('session.ForceTerminateWarningMsg')}
            </Typography.Paragraph>
            <ul>
              <li>{t('session.ForceTerminateWarningMsg2')}</li>
              <li>{t('session.ForceTerminateWarningMsg3')}</li>
            </ul>
            {userRole === 'superadmin' && (
              <BAICard type="inner" title={t('session.ContainerToCleanUp')}>
                {_.map(kernelsByAgent, (kernels, agentId) => (
                  <React.Fragment key={agentId}>
                    {agentId}
                    <ul>
                      {kernels.map((kernel) => (
                        <li key={kernel?.id}>
                          <Typography.Text copyable>
                            {kernel?.resource?.containerId}
                          </Typography.Text>
                        </li>
                      ))}
                    </ul>
                  </React.Fragment>
                ))}
              </BAICard>
            )}
          </BAICard>
        )}
      </BAIFlex>
    </BAIModal>
  );
};

export default TerminateSessionModalForProjectAdmin;
