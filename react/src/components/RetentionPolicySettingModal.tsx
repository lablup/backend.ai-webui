/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RetentionPolicySettingModalCategoryCheckQuery } from '../__generated__/RetentionPolicySettingModalCategoryCheckQuery.graphql';
import {
  RetentionCategory,
  RetentionPolicySettingModalCreateMutation,
} from '../__generated__/RetentionPolicySettingModalCreateMutation.graphql';
import { RetentionPolicySettingModalFragment$key } from '../__generated__/RetentionPolicySettingModalFragment.graphql';
import { RetentionPolicySettingModalUpdateMutation } from '../__generated__/RetentionPolicySettingModalUpdateMutation.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import {
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormSwitch,
} from './astryxFormControls';
import { BAILink, BAIModal, BAIModalProps, useBAILogger } from 'backend.ai-ui';
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

export const RETENTION_CATEGORIES: ReadonlyArray<RetentionCategory> = [
  'LOGS',
  'LOGIN',
  'RECONCILE_HISTORY',
  'ROLES_INVITATIONS',
  'DEPLOYMENTS',
  'SESSIONS',
  'USAGE_RECORDS',
  'USAGE_BUCKETS',
];

export const useRetentionCategoryLabel = () => {
  'use memo';
  const { t } = useTranslation();
  const labels: Record<RetentionCategory, string> = {
    LOGS: t('retentionPolicy.CategoryLogs'),
    LOGIN: t('retentionPolicy.CategoryLogin'),
    RECONCILE_HISTORY: t('retentionPolicy.CategoryReconcileHistory'),
    ROLES_INVITATIONS: t('retentionPolicy.CategoryRolesInvitations'),
    DEPLOYMENTS: t('retentionPolicy.CategoryDeployments'),
    SESSIONS: t('retentionPolicy.CategorySessions'),
    USAGE_RECORDS: t('retentionPolicy.CategoryUsageRecords'),
    USAGE_BUCKETS: t('retentionPolicy.CategoryUsageBuckets'),
    '%future added value': '',
  };
  return (category: string) =>
    labels[category as RetentionCategory] || category;
};

type RetentionPolicyFormValues = {
  category: RetentionCategory;
  retentionPeriodDays: number;
  enabled: boolean;
};

interface RetentionPolicySettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  policyFrgmt?: RetentionPolicySettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
  onViewExistingPolicy: (category: RetentionCategory) => void;
}

const RetentionPolicySettingModal: React.FC<
  RetentionPolicySettingModalProps
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
  const getCategoryLabel = useRetentionCategoryLabel();
  const formRef = useRef<FormInstance<RetentionPolicyFormValues>>(null);
  // A counter, so a re-select during an in-flight check does not end loading early.
  const [pendingCategoryChecks, setPendingCategoryChecks] = useState(0);

  const policy = useFragment(
    graphql`
      fragment RetentionPolicySettingModalFragment on RetentionPolicy {
        id
        entityId
        category
        retentionPeriodDays
        enabled
      }
    `,
    policyFrgmt ?? null,
  );

  const [commitCreate, isInFlightCreate] =
    useMutation<RetentionPolicySettingModalCreateMutation>(graphql`
      mutation RetentionPolicySettingModalCreateMutation(
        $input: CreateRetentionPolicyInput!
      ) {
        adminCreateRetentionPolicy(input: $input) {
          policy {
            id
          }
        }
      }
    `);
  const [commitUpdate, isInFlightUpdate] =
    useMutation<RetentionPolicySettingModalUpdateMutation>(graphql`
      mutation RetentionPolicySettingModalUpdateMutation(
        $input: UpdateRetentionPolicyInput!
      ) {
        adminUpdateRetentionPolicy(input: $input) {
          policy {
            id
            category
            retentionPeriodDays
            enabled
            updatedAt
          }
        }
      }
    `);

  // A failed check resolves: the server's error on submit stays the final guard.
  const validateCategoryIsFree = async (_rule: unknown, value: unknown) => {
    const category = value as RetentionCategory | undefined;
    if (!category || category === policy?.category) return;
    setPendingCategoryChecks((n) => n + 1);
    const result =
      await fetchQuery<RetentionPolicySettingModalCategoryCheckQuery>(
        relayEnv,
        graphql`
          query RetentionPolicySettingModalCategoryCheckQuery(
            $filter: RetentionPolicyFilter
          ) {
            adminRetentionPolicies(filter: $filter, limit: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
        { filter: { category } },
        { fetchPolicy: 'network-only' },
      )
        .toPromise()
        .catch((error) => {
          logger.error(error);
          return undefined;
        })
        .finally(() => setPendingCategoryChecks((n) => n - 1));
    const existingId = result?.adminRetentionPolicies?.edges[0]?.node?.id;
    if (existingId && existingId !== policy?.id) {
      throw (
        <Trans
          i18nKey="retentionPolicy.PolicyAlreadyExistsView"
          components={{
            viewLink: (
              <BAILink onClick={() => onViewExistingPolicy(category)} />
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
        if (policy) {
          commitUpdate({
            variables: {
              input: {
                id: policy.entityId,
                ...(values.category !== policy.category && {
                  category: values.category,
                }),
                ...(values.retentionPeriodDays !==
                  policy.retentionPeriodDays && {
                  retentionPeriodDays: values.retentionPeriodDays,
                }),
                ...(values.enabled !== policy.enabled && {
                  enabled: values.enabled,
                }),
              },
            },
            onCompleted: (_res, errors) => {
              if (errors && errors.length > 0) {
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                return;
              }
              message.success(t('retentionPolicy.SuccessfullyUpdated'));
              onRequestClose(true);
            },
            onError: (error) => {
              message.error(error?.message || t('general.ErrorOccurred'));
            },
          });
          return;
        }
        commitCreate({
          variables: {
            input: {
              category: values.category,
              retentionPeriodDays: values.retentionPeriodDays,
              enabled: values.enabled,
            },
          },
          onCompleted: (_res, errors) => {
            if (errors && errors.length > 0) {
              message.error(errors[0]?.message || t('general.ErrorOccurred'));
              return;
            }
            message.success(t('retentionPolicy.SuccessfullyCreated'));
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
      title={
        policy
          ? t('retentionPolicy.EditPolicy')
          : t('retentionPolicy.CreatePolicy')
      }
      okText={policy ? t('button.Save') : t('button.Create')}
      confirmLoading={
        pendingCategoryChecks > 0 || isInFlightCreate || isInFlightUpdate
      }
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={
          policy
            ? {
                category: policy.category,
                retentionPeriodDays: policy.retentionPeriodDays,
                enabled: policy.enabled,
              }
            : { enabled: true }
        }
      >
        <Form.Item
          label={t('retentionPolicy.Category')}
          name="category"
          rules={[
            { required: true, message: t('retentionPolicy.CategoryRequired') },
            { validator: validateCategoryIsFree },
          ]}
          extra={t('retentionPolicy.OnePolicyPerCategory')}
        >
          <AstryxFormSelector
            label={t('retentionPolicy.Category')}
            options={_.map(RETENTION_CATEGORIES, (category) => ({
              value: category,
              label: getCategoryLabel(category),
            }))}
          />
        </Form.Item>
        <Form.Item
          label={t('retentionPolicy.RetentionPeriodDays')}
          name="retentionPeriodDays"
          rules={[
            {
              required: true,
              type: 'number',
              min: 1,
              message: t('retentionPolicy.RetentionPeriodRequired'),
            },
          ]}
        >
          <AstryxFormNumberInput
            label={t('retentionPolicy.RetentionPeriodDays')}
            min={1}
            step={1}
            isIntegerOnly
          />
        </Form.Item>
        <Form.Item
          label={t('general.Enabled')}
          name="enabled"
          valuePropName="checked"
        >
          <AstryxFormSwitch label={t('general.Enabled')} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default RetentionPolicySettingModal;
