/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { TerminateSessionModalForProjectAdminFragment$key } from '../../../__generated__/TerminateSessionModalForProjectAdminFragment.graphql';
import { TerminateSessionModalForProjectAdminMutation } from '../../../__generated__/TerminateSessionModalForProjectAdminMutation.graphql';
import { App } from '../../../app-shim';
import { useCurrentUserRole } from '../../../hooks/backendai';
import './TerminateSessionModalForProjectAdmin.css';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBulkErrorModal,
  BAICard,
  type BAIColumnsType,
  BAIFlex,
  BAIModal,
  BAIText,
  filterOutNullAndUndefined,
  type BAIModalProps,
  BAICheckboxInput,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface TerminateFailure {
  key: string;
  name: string;
  message: string;
}

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
  /** `success` is true once any session was terminated; `failedSessionIds`
   *  holds the `entityId`s of the sessions that were not, for a retry. */
  onRequestClose: (
    success: boolean,
    failedSessionIds?: ReadonlyArray<string>,
  ) => void;
}

/**
 * Terminate confirmation modal for the project-admin session list. Mirrors the
 * v1 `TerminateSessionModal` UI (message + highlighted name(s) + force-terminate
 * checkbox + per-agent container cleanup list), but drives the scope-agnostic
 * `partialBulkTerminateSessionsV2` mutation, which accepts an id array — so the
 * same modal handles single and bulk terminate. The mutation answers for each
 * session; the ones that failed are listed in `BAIBulkErrorModal`.
 */
const TerminateSessionModalForProjectAdmin: React.FC<
  TerminateSessionModalForProjectAdminProps
> = ({ sessionsFrgmt, onRequestClose, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const { message } = App.useApp();
  const userRole = useCurrentUserRole();
  const [isForce, setIsForce] = useState(false);
  // Per-session failures of the last request; `terminatedCount` decides
  // whether dismissing the report also closes this modal.
  const [failureReport, setFailureReport] = useState<{
    failures: TerminateFailure[];
    total: number;
    terminatedCount: number;
  } | null>(null);

  const sessions = filterOutNullAndUndefined(
    useFragment(
      graphql`
        fragment TerminateSessionModalForProjectAdminFragment on SessionV2
        @relay(plural: true) {
          id
          entityId
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
        $input: PartialBulkTerminateSessionsInput!
      ) {
        partialBulkTerminateSessionsV2(input: $input) {
          successes {
            id
          }
          failed {
            id
            message
          }
        }
      }
    `);

  const handleClose = (
    success: boolean,
    failedSessionIds?: ReadonlyArray<string>,
  ) => {
    setIsForce(false);
    onRequestClose(success, failedSessionIds);
  };

  const reportFailures = (
    failures: TerminateFailure[],
    terminatedCount: number,
  ) => {
    const description = t(
      'session.TerminateSessionsPartialFailureDescription',
      {
        failed: failures.length,
        total: sessions.length,
      },
    );
    message.error(description);
    setFailureReport({ failures, total: sessions.length, terminatedCount });
  };

  // A rejected request counts every requested session as failed.
  const reportAllFailed = (reason: string) => {
    reportFailures(
      sessions.map((session) => ({
        key: session.entityId,
        name: session.metadata?.name ?? session.entityId,
        message: reason,
      })),
      0,
    );
  };

  const failureColumns: BAIColumnsType<TerminateFailure> = [
    { key: 'name', title: t('session.SessionName'), dataIndex: 'name' },
    { key: 'message', title: t('dialog.error.Error'), dataIndex: 'message' },
  ];

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
    <>
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
              input: {
                ids: sessions.map((session) => session.entityId),
                forced: isForce,
              },
            },
            onCompleted: (response, errors) => {
              if (errors && errors.length > 0) {
                reportAllFailed(
                  errors[0]?.message ?? t('general.ErrorOccurred'),
                );
                return;
              }
              const { successes, failed } =
                response.partialBulkTerminateSessionsV2;
              if (failed.length === 0) {
                message.success(t('session.SessionTerminated'));
                handleClose(true);
                return;
              }
              const nameById = _.fromPairs(
                sessions.map((session) => [
                  session.entityId,
                  session.metadata?.name,
                ]),
              );
              reportFailures(
                failed.map((failure) => ({
                  key: failure.id,
                  name: nameById[failure.id] ?? failure.id,
                  message: failure.message,
                })),
                successes.length,
              );
            },
            onError: (error) => {
              reportAllFailed(error.message);
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
          <BAICheckboxInput
            value={isForce}
            onChange={(checked) => setIsForce(checked)}
          >
            {t('button.ForceTerminate')}
          </BAICheckboxInput>
          {isForce && (
            <BAICard styles={{ body: { padding: token('--spacing-4') } }}>
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
      <BAIBulkErrorModal<TerminateFailure>
        open={!!failureReport}
        alertDescription={t(
          'session.TerminateSessionsPartialFailureDescription',
          {
            failed: failureReport?.failures.length ?? 0,
            total: failureReport?.total ?? 0,
          },
        )}
        columns={failureColumns}
        dataSource={failureReport?.failures ?? []}
        onRequestClose={() => {
          setFailureReport(null);
          // A partial success closes the confirm and refreshes the list; the
          // failed sessions stay selected. A full failure keeps it open.
          if (failureReport && failureReport.terminatedCount > 0) {
            handleClose(
              true,
              failureReport.failures.map((failure) => failure.key),
            );
          }
        }}
      />
    </>
  );
};

export default TerminateSessionModalForProjectAdmin;
