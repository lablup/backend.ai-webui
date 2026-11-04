/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ClientIpMaskingPolicySettingModalFragment$key } from '../../../__generated__/ClientIpMaskingPolicySettingModalFragment.graphql';
import { ClientIpMaskingPolicySettingModalTargetCheckQuery } from '../../../__generated__/ClientIpMaskingPolicySettingModalTargetCheckQuery.graphql';
import {
  ClientIPMaskingMode,
  ClientIPMaskingTarget,
  ClientIpMaskingPolicySettingModalUpsertMutation,
} from '../../../__generated__/ClientIpMaskingPolicySettingModalUpsertMutation.graphql';
import { App } from '../../../app-shim';
import { Form, FormInstance } from '../../../form-engine';
import {
  BAIFlex,
  BAILink,
  BAIModal,
  BAIModalProps,
  BAINumberInput,
  BAIQuestionIconWithTooltip,
  BAISelect,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useFragment,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';

export const CLIENT_IP_MASKING_TARGETS: ReadonlyArray<ClientIPMaskingTarget> = [
  'DEFAULT',
  'LOGIN_HISTORY',
  'AUDIT_LOGS',
];

export const CLIENT_IP_MASKING_MODES: ReadonlyArray<ClientIPMaskingMode> = [
  'NONE',
  'TRUNCATE',
  'DROP',
];

// Upper bounds and built-in widths the manager applies to a TRUNCATE policy.
export const MAX_IPV4_PREFIX = 32;
export const MAX_IPV6_PREFIX = 128;
export const DEFAULT_IPV4_PREFIX = 24;
export const DEFAULT_IPV6_PREFIX = 48;

type ClientIpMaskingPolicyFormValues = {
  targetType: ClientIPMaskingTarget;
  mode: ClientIPMaskingMode;
  ipv4Prefix?: number | null;
  ipv6Prefix?: number | null;
};

interface ClientIpMaskingPolicySettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  policyFrgmt?: ClientIpMaskingPolicySettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
  onViewExistingPolicy: (targetType: ClientIPMaskingTarget) => void;
}

const labelWithTooltip = (label: string, tooltip: React.ReactNode) => (
  <BAIFlex gap="xxs" align="center">
    {label}
    <BAIQuestionIconWithTooltip title={tooltip} />
  </BAIFlex>
);

// Mounted inside the Form, so the watch is fresh on every open of the modal.
const MaskingModeFormItems: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const form = Form.useFormInstance<ClientIpMaskingPolicyFormValues>();
  const watchedMode = Form.useWatch('mode', form);

  return (
    <>
      <Form.Item
        label={labelWithTooltip(
          t('clientIpMasking.Mode'),
          <BAIFlex direction="column" align="start" gap="xxs">
            {_.map(CLIENT_IP_MASKING_MODES, (mode) => (
              <span key={mode}>
                {t(`clientIpMasking.modes.${mode}`, { defaultValue: mode })}:{' '}
                {t(`clientIpMasking.modeDescriptions.${mode}`)}
              </span>
            ))}
          </BAIFlex>,
        )}
        name="mode"
        rules={[{ required: true, message: t('clientIpMasking.ModeRequired') }]}
      >
        <BAISelect
          placeholder={t('clientIpMasking.Mode')}
          options={_.map(CLIENT_IP_MASKING_MODES, (mode) => ({
            value: mode,
            label: t(`clientIpMasking.modes.${mode}`, { defaultValue: mode }),
          }))}
        />
      </Form.Item>
      {watchedMode === 'TRUNCATE' && (
        <>
          <Form.Item
            label={labelWithTooltip(
              t('clientIpMasking.IPv4Prefix'),
              t('clientIpMasking.PrefixExtra', {
                max: MAX_IPV4_PREFIX,
                defaultPrefix: DEFAULT_IPV4_PREFIX,
              }),
            )}
            name="ipv4Prefix"
            rules={[
              {
                type: 'number',
                min: 0,
                max: MAX_IPV4_PREFIX,
                message: t('clientIpMasking.PrefixRange', {
                  max: MAX_IPV4_PREFIX,
                }),
              },
            ]}
          >
            <BAINumberInput
              width="100%"
              aria-label={t('clientIpMasking.IPv4Prefix')}
              min={0}
              max={MAX_IPV4_PREFIX}
              step={1}
              isIntegerOnly
              placeholder={String(DEFAULT_IPV4_PREFIX)}
            />
          </Form.Item>
          <Form.Item
            label={labelWithTooltip(
              t('clientIpMasking.IPv6Prefix'),
              t('clientIpMasking.PrefixExtra', {
                max: MAX_IPV6_PREFIX,
                defaultPrefix: DEFAULT_IPV6_PREFIX,
              }),
            )}
            name="ipv6Prefix"
            rules={[
              {
                type: 'number',
                min: 0,
                max: MAX_IPV6_PREFIX,
                message: t('clientIpMasking.PrefixRange', {
                  max: MAX_IPV6_PREFIX,
                }),
              },
            ]}
          >
            <BAINumberInput
              width="100%"
              aria-label={t('clientIpMasking.IPv6Prefix')}
              min={0}
              max={MAX_IPV6_PREFIX}
              step={1}
              isIntegerOnly
              placeholder={String(DEFAULT_IPV6_PREFIX)}
            />
          </Form.Item>
        </>
      )}
    </>
  );
};

const ClientIpMaskingPolicySettingModal: React.FC<
  ClientIpMaskingPolicySettingModalProps
> = ({
  policyFrgmt,
  onRequestClose,
  onViewExistingPolicy,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const relayEnv = useRelayEnvironment();
  const formRef = useRef<FormInstance<ClientIpMaskingPolicyFormValues>>(null);
  const [pendingTargetChecks, setPendingTargetChecks] = useState(0);

  const policy = useFragment(
    graphql`
      fragment ClientIpMaskingPolicySettingModalFragment on ClientIPMaskingPolicy {
        id
        entityId
        targetType
        mode
        ipv4Prefix
        ipv6Prefix
      }
    `,
    policyFrgmt ?? null,
  );

  const [commitUpsert, isInFlightUpsert] =
    useMutation<ClientIpMaskingPolicySettingModalUpsertMutation>(graphql`
      mutation ClientIpMaskingPolicySettingModalUpsertMutation(
        $input: UpsertClientIPMaskingPolicyInput!
      ) {
        upsertClientIpMaskingPolicy(input: $input) {
          policy {
            id
            entityId
            targetType
            mode
            ipv4Prefix
            ipv6Prefix
            updatedAt
          }
        }
      }
    `);

  const validateTargetIsFree = async (_rule: unknown, value: unknown) => {
    const targetType = value as ClientIPMaskingTarget | undefined;
    if (!targetType || targetType === policy?.targetType) return;
    setPendingTargetChecks((n) => n + 1);
    const result =
      await fetchQuery<ClientIpMaskingPolicySettingModalTargetCheckQuery>(
        relayEnv,
        graphql`
          query ClientIpMaskingPolicySettingModalTargetCheckQuery(
            $filter: ClientIPMaskingPolicyFilter
          ) {
            adminClientIpMaskingPolicies(filter: $filter, limit: 1) {
              edges {
                node {
                  id
                  entityId
                }
              }
            }
          }
        `,
        { filter: { targetType } },
        { fetchPolicy: 'network-only' },
      )
        .toPromise()
        .catch((error) => {
          logger.error(error);
          return undefined;
        })
        .finally(() => setPendingTargetChecks((n) => n - 1));
    const existingEntityId =
      result?.adminClientIpMaskingPolicies?.edges[0]?.node?.entityId;
    if (existingEntityId && existingEntityId !== policy?.entityId) {
      throw (
        <Trans
          i18nKey="retentionPolicy.PolicyAlreadyExistsView"
          components={{
            viewLink: (
              <BAILink onClick={() => onViewExistingPolicy(targetType)} />
            ),
          }}
        />
      );
    }
  };

  const handleOk = () =>
    formRef.current
      ?.validateFields()
      .then((values) => {
        const isTruncate = values.mode === 'TRUNCATE';
        commitUpsert({
          variables: {
            input: {
              targetType: values.targetType,
              mode: values.mode,
              ipv4Prefix: isTruncate ? (values.ipv4Prefix ?? null) : null,
              ipv6Prefix: isTruncate ? (values.ipv6Prefix ?? null) : null,
            },
          },
          onCompleted: (_res, errors) => {
            if (errors && errors.length > 0) {
              message.error(errors[0]?.message || t('general.ErrorOccurred'));
              return;
            }
            message.success(t('clientIpMasking.SuccessfullySaved'));
            onRequestClose(true);
          },
          onError: (error) => {
            message.error(error?.message || t('general.ErrorOccurred'));
          },
        });
      })
      .catch(() => {});

  return (
    <BAIModal
      {...baiModalProps}
      centered
      unmountOnClose
      title={
        policy
          ? t('clientIpMasking.EditPolicy')
          : t('clientIpMasking.CreatePolicy')
      }
      okText={policy ? t('button.Save') : t('button.Create')}
      confirmLoading={pendingTargetChecks > 0 || isInFlightUpsert}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={
          policy
            ? {
                targetType: policy.targetType,
                mode: policy.mode,
                ipv4Prefix: policy.ipv4Prefix,
                ipv6Prefix: policy.ipv6Prefix,
              }
            : { mode: 'TRUNCATE' }
        }
      >
        <Form.Item
          label={t('clientIpMasking.Target')}
          name="targetType"
          extra={t('clientIpMasking.OnePolicyPerTarget')}
          rules={[
            { required: true, message: t('clientIpMasking.TargetRequired') },
            { validator: validateTargetIsFree },
          ]}
        >
          <BAISelect
            disabled={!!policy}
            placeholder={t('clientIpMasking.Target')}
            options={_.map(CLIENT_IP_MASKING_TARGETS, (target) => ({
              value: target,
              label: t(`clientIpMasking.targets.${target}`, {
                defaultValue: target,
              }),
            }))}
          />
        </Form.Item>
        <MaskingModeFormItems />
      </Form>
    </BAIModal>
  );
};

export default ClientIpMaskingPolicySettingModal;
