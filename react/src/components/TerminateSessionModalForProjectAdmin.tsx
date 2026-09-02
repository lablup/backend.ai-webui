/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { TerminateSessionModalForProjectAdminFragment$key } from '../__generated__/TerminateSessionModalForProjectAdminFragment.graphql';
import { TerminateSessionModalForProjectAdminMutation } from '../__generated__/TerminateSessionModalForProjectAdminMutation.graphql';
import { App } from '../app-shim';
import { useCurrentUserRole } from '../hooks/backendai';
import { theme } from '../theme-shim';
import './TerminateSessionModalForProjectAdmin.css';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Text } from '@astryxdesign/core/Text';
import {
  BAICard,
  BAIFlex,
  BAIModal,
  type BAIModalProps,
  BAIText,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

// The antd `ModalProps` type import is replaced by BUI's own `BAIModalProps`
// — the modal this component actually renders. A type-only antd import still
// keeps the module in the antd import graph (P15/MAPPING §6).
export interface TerminateSessionModalForProjectAdminProps extends Omit<
  BAIModalProps,
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
        className="terminate-session-modal-admin-list"
        direction="column"
        align="stretch"
        gap={'xs'}
      >
        <Text>{t('userSettings.SessionTerminationDialog')}</Text>
        {/* `Typography.Text mark` is MAPPING §3.4 **NONE** in Astryx core, but
            BUI's `BAIText` already rebuilt the highlight chip in tokens
            (p3-a), so the frontier wrapper is the right home for this one
            prop rather than a second local reimplementation. */}
        <BAIText mark>
          {sessions.length === 1
            ? (sessions[0]?.metadata?.name ?? '')
            : `${sessions.length} sessions`}
        </BAIText>
        {/* MAPPING §4: `checked` -> `value`, `onChange(e)` ->
            `onChange(checked)`, children -> the required `label`. */}
        <CheckboxInput
          label={t('button.ForceTerminate')}
          value={isForce}
          onChange={(checked) => setIsForce(checked)}
        />
        {isForce && (
          <BAICard styles={{ body: { padding: token.padding } }}>
            {/* `Typography.Paragraph` -> `Text as="p" display="block"`; the
                `danger` type resolves through the brand theme's custom
                `color:danger` Text colour added in p3-a. */}
            <Text as="p" display="block" color="danger">
              {t('session.ForceTerminateWarningMsg')}
            </Text>
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
                          <BAIText copyable>
                            {kernel?.resource?.containerId ?? ''}
                          </BAIText>
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
