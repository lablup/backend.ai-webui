/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ClientIpMaskingPolicySettingModalFragment$key } from '../__generated__/ClientIpMaskingPolicySettingModalFragment.graphql';
import {
  ClientIPMaskingMode,
  ClientIPMaskingTarget,
  ClientIpMaskingPolicySettingModalUpsertMutation,
} from '../__generated__/ClientIpMaskingPolicySettingModalUpsertMutation.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import {
  BAIModal,
  BAIModalProps,
  BAINumberInput,
  BAISelect,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

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
  // Targets a new policy may be created for; the edited policy keeps its own.
  availableTargets: ReadonlyArray<ClientIPMaskingTarget>;
  onRequestClose: (success?: boolean) => void;
}

// Mounted inside the Form, so the watch is fresh on every open of the modal.
const MaskingModeFormItems: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const form = Form.useFormInstance<ClientIpMaskingPolicyFormValues>();
  const watchedMode = Form.useWatch('mode', form);

  return (
    <>
      <Form.Item
        label={t('clientIpMasking.Mode')}
        name="mode"
        rules={[{ required: true, message: t('clientIpMasking.ModeRequired') }]}
        extra={
          watchedMode
            ? t(`clientIpMasking.modeDescriptions.${watchedMode}`, {
                defaultValue: '',
              })
            : undefined
        }
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
            label={t('clientIpMasking.IPv4Prefix')}
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
            extra={t('clientIpMasking.PrefixExtra', {
              max: MAX_IPV4_PREFIX,
              defaultPrefix: DEFAULT_IPV4_PREFIX,
            })}
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
            label={t('clientIpMasking.IPv6Prefix')}
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
            extra={t('clientIpMasking.PrefixExtra', {
              max: MAX_IPV6_PREFIX,
              defaultPrefix: DEFAULT_IPV6_PREFIX,
            })}
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
> = ({ policyFrgmt, availableTargets, onRequestClose, ...baiModalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<ClientIpMaskingPolicyFormValues>>(null);

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

  const targetOptions = policy
    ? [policy.targetType]
    : _.filter(CLIENT_IP_MASKING_TARGETS, (target) =>
        _.includes(availableTargets, target),
      );

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
      confirmLoading={isInFlightUpsert}
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
            : { targetType: targetOptions[0], mode: 'TRUNCATE' }
        }
      >
        <Form.Item
          label={t('clientIpMasking.Target')}
          name="targetType"
          rules={[
            { required: true, message: t('clientIpMasking.TargetRequired') },
          ]}
          extra={t('clientIpMasking.OnePolicyPerTarget')}
        >
          <BAISelect
            disabled={!!policy}
            placeholder={t('clientIpMasking.Target')}
            options={_.map(targetOptions, (target) => ({
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
