/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RetentionCategory,
  RetentionPolicySettingModalCreateMutation,
} from '../__generated__/RetentionPolicySettingModalCreateMutation.graphql';
import { RetentionPolicySettingModalFragment$key } from '../__generated__/RetentionPolicySettingModalFragment.graphql';
import { RetentionPolicySettingModalUpdateMutation } from '../__generated__/RetentionPolicySettingModalUpdateMutation.graphql';
import { App } from '../app-shim';
import { Form } from '../form-engine';
import {
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormSwitch,
} from './astryxFormControls';
import { BAIModal, BAIModalProps, useBAILogger } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

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

type MutationError = { message: string; extensions?: unknown };

// A create answers with RetentionPolicyConflict; an update that moves onto a
// taken category hits the table's unique constraint instead.
const DUPLICATE_CATEGORY_CODES = [
  'retention-policy_create_conflict',
  'database_generic_already-exists',
];
const isDuplicateCategoryError = (error: MutationError) =>
  _.includes(DUPLICATE_CATEGORY_CODES, _.get(error, 'extensions.code')) ||
  /already exists|uq_retention_policies_category|duplicate key|unique constraint/i.test(
    error.message ?? '',
  );

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
}

const RetentionPolicySettingModal: React.FC<
  RetentionPolicySettingModalProps
> = ({ policyFrgmt, onRequestClose, ...baiModalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const getCategoryLabel = useRetentionCategoryLabel();
  const [form] = Form.useForm<RetentionPolicyFormValues>();

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

  const [commitCreate, isInflightCreate] =
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
  const [commitUpdate, isInflightUpdate] =
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

  // The modal stays open on failure so the user can correct the input and retry.
  const showFailure = (
    errors: ReadonlyArray<MutationError>,
    category: RetentionCategory,
    mayConflict: boolean,
  ) => {
    if (mayConflict && _.some(errors, isDuplicateCategoryError)) {
      const conflictMessage = t('retentionPolicy.CategoryAlreadyHasPolicy', {
        category: getCategoryLabel(category),
      });
      form.setFields([{ name: 'category', errors: [conflictMessage] }]);
      message.error(conflictMessage);
      return;
    }
    _.forEach(errors, (err) =>
      message.error(err.message || t('general.ErrorOccurred')),
    );
  };

  // Relay hands a failed mutation's GraphQL errors to onError under `source`.
  const errorsOf = (error: Error): ReadonlyArray<MutationError> => {
    const sourceErrors = (
      error as { source?: { errors?: ReadonlyArray<MutationError> } }
    ).source?.errors;
    return sourceErrors && sourceErrors.length > 0 ? sourceErrors : [error];
  };

  const handleResult = (
    errors: ReadonlyArray<MutationError> | null | undefined,
    successMessage: string,
    category: RetentionCategory,
    mayConflict: boolean,
  ) => {
    if (errors && errors.length > 0) {
      showFailure(errors, category, mayConflict);
      return;
    }
    message.success(successMessage);
    onRequestClose(true);
  };

  const handleOk = () =>
    form
      .validateFields()
      .then((values) => {
        if (policy) {
          const isCategoryChanged = values.category !== policy.category;
          commitUpdate({
            variables: {
              input: {
                id: policy.entityId,
                ...(isCategoryChanged && {
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
            onCompleted: (_res, errors) =>
              handleResult(
                errors,
                t('retentionPolicy.SuccessfullyUpdated'),
                values.category,
                isCategoryChanged,
              ),
            onError: (error) =>
              showFailure(errorsOf(error), values.category, isCategoryChanged),
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
          onCompleted: (_res, errors) =>
            handleResult(
              errors,
              t('retentionPolicy.SuccessfullyCreated'),
              values.category,
              true,
            ),
          onError: (error) =>
            showFailure(errorsOf(error), values.category, true),
        });
      })
      .catch((err) => logger.error(err));

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
      confirmLoading={isInflightCreate || isInflightUpdate}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
    >
      <Form
        form={form}
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
