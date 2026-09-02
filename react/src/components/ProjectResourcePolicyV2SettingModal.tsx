/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CreateProjectResourcePolicyInputV2,
  ProjectResourcePolicyV2SettingModalCreateMutation,
} from '../__generated__/ProjectResourcePolicyV2SettingModalCreateMutation.graphql';
import { ProjectResourcePolicyV2SettingModalFragment$key } from '../__generated__/ProjectResourcePolicyV2SettingModalFragment.graphql';
import {
  UpdateProjectResourcePolicyInput,
  ProjectResourcePolicyV2SettingModalModifyMutation,
} from '../__generated__/ProjectResourcePolicyV2SettingModalModifyMutation.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import { GBToBytes, bytesToGB } from '../helper';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import BAIFormItem from './BAIFormItem';
import FormItemWithUnlimited from './FormItemWithUnlimited';
import {
  AstryxFormNumberInput,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIModal, BAIModalProps, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface ProjectResourcePolicyV2SettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  projectResourcePolicyFrgmt: ProjectResourcePolicyV2SettingModalFragment$key | null;
  onOk: () => void;
  onCancel: () => void;
}

const ProjectResourcePolicyV2SettingModal: React.FC<
  ProjectResourcePolicyV2SettingModalProps
> = ({
  projectResourcePolicyFrgmt = null,
  onOk,
  onCancel,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const { message } = App.useApp();

  const formRef = useRef<FormInstance>(null);

  const projectResourcePolicy = useFragment(
    graphql`
      fragment ProjectResourcePolicyV2SettingModalFragment on ProjectResourcePolicyV2 {
        id
        name
        maxVfolderCount
        maxQuotaScopeSize {
          expr
        }
        maxNetworkCount
      }
    `,
    projectResourcePolicyFrgmt,
  );

  const [
    commitCreateProjectResourcePolicy,
    isInFlightCommitCreateProjectResourcePolicy,
  ] = useMutation<ProjectResourcePolicyV2SettingModalCreateMutation>(graphql`
    mutation ProjectResourcePolicyV2SettingModalCreateMutation(
      $input: CreateProjectResourcePolicyInputV2!
    ) {
      adminCreateProjectResourcePolicyV2(input: $input) {
        projectResourcePolicy {
          id
        }
      }
    }
  `);

  const [
    commitModifyProjectResourcePolicy,
    isInFlightCommitModifyProjectResourcePolicy,
  ] = useMutation<ProjectResourcePolicyV2SettingModalModifyMutation>(graphql`
    mutation ProjectResourcePolicyV2SettingModalModifyMutation(
      $name: String!
      $input: UpdateProjectResourcePolicyInput!
    ) {
      adminUpdateProjectResourcePolicyV2(name: $name, input: $input) {
        projectResourcePolicy {
          id
          name
          createdAt
          maxVfolderCount
          maxQuotaScopeSize {
            expr
          }
          maxNetworkCount
        }
      }
    }
  `);

  // `expr` is the exact byte count as a decimal string ('-1' = unlimited).
  const rawMaxQuotaScopeSize = projectResourcePolicy?.maxQuotaScopeSize.expr;
  const initialMaxQuotaScopeSize =
    _.isUndefined(rawMaxQuotaScopeSize) || rawMaxQuotaScopeSize === '-1'
      ? -1
      : Number(bytesToGB(Number(rawMaxQuotaScopeSize)));
  const initialValues = {
    name: projectResourcePolicy?.name,
    max_vfolder_count: projectResourcePolicy?.maxVfolderCount ?? 0,
    max_quota_scope_size: initialMaxQuotaScopeSize,
    max_network_count: projectResourcePolicy?.maxNetworkCount ?? -1,
  };

  const handleOk = () => {
    return formRef?.current
      ?.validateFields()
      .then((values) => {
        const maxQuotaScopeSizeExpr =
          values?.max_quota_scope_size === -1
            ? '-1'
            : String(GBToBytes(values?.max_quota_scope_size));
        const commonInput = {
          maxVfolderCount: values?.max_vfolder_count || 0,
          maxQuotaScopeSize: { expr: maxQuotaScopeSizeExpr },
          maxNetworkCount: values?.max_network_count ?? -1,
        };
        if (projectResourcePolicy === null) {
          const input: CreateProjectResourcePolicyInputV2 = {
            name: values?.name,
            ...commonInput,
          };
          commitCreateProjectResourcePolicy({
            variables: { input },
            onCompleted(res, errors) {
              if (!res?.adminCreateProjectResourcePolicyV2 || errors) {
                message.error(
                  errors?.[0]?.message ||
                    t('resourcePolicy.CannotCreateResourcePolicy'),
                );
                onCancel();
              } else {
                message.success(t('resourcePolicy.ResourcePolicyCreated'));
                onOk();
              }
            },
            onError(error) {
              message.error(
                error?.message ||
                  t('resourcePolicy.CannotCreateResourcePolicy'),
              );
            },
          });
        } else {
          const input: UpdateProjectResourcePolicyInput = commonInput;
          commitModifyProjectResourcePolicy({
            variables: { name: values?.name, input },
            onCompleted(res, errors) {
              if (!res?.adminUpdateProjectResourcePolicyV2 || errors) {
                message.error(
                  errors?.[0]?.message ||
                    t('resourcePolicy.CannotUpdateResourcePolicy'),
                );
                onCancel();
              } else {
                message.success(t('resourcePolicy.ResourcePolicyUpdated'));
                onOk();
              }
            },
            onError(error) {
              message.error(
                error?.message ||
                  t('resourcePolicy.CannotUpdateResourcePolicy'),
              );
            },
          });
        }
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      title={
        projectResourcePolicy === null
          ? t('resourcePolicy.CreateProjectResourcePolicy')
          : t('resourcePolicy.UpdateProjectResourcePolicy')
      }
      okText={
        projectResourcePolicy === null ? t('button.Create') : t('button.Save')
      }
      onOk={handleOk}
      onCancel={() => onCancel()}
      destroyOnHidden
      confirmLoading={
        isInFlightCommitCreateProjectResourcePolicy ||
        isInFlightCommitModifyProjectResourcePolicy
      }
      {...baiModalProps}
    >
      <Banner
        title={t('storageHost.BeCarefulToSetProjectResourcePolicy')}
        status="warning"
        style={{ marginBottom: token('--spacing-5') }}
      />
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={initialValues}
        preserve={false}
      >
        <BAIFormItem
          label={t('resourcePolicy.Name')}
          name="name"
          required
          rules={[
            {
              required: true,
              message: t('data.explorer.ValueRequired'),
            },
            {
              max: 255,
            },
          ]}
        >
          <AstryxFormTextInput
            label={t('resourcePolicy.Name')}
            disabled={!!projectResourcePolicy}
          />
        </BAIFormItem>
        <BAIFlex
          direction="column"
          align="stretch"
          gap={'md'}
          style={{ marginBottom: token('--spacing-5') }}
        >
          <FormItemWithUnlimited
            name={'max_vfolder_count'}
            unlimitedValue={0}
            label={t('resourcePolicy.MaxFolderCount')}
            style={{ width: '100%', margin: 0 }}
          >
            <AstryxFormNumberInput
              label={t('resourcePolicy.MaxFolderCount')}
              min={0}
              max={SIGNED_32BIT_MAX_INT}
            />
          </FormItemWithUnlimited>
          <FormItemWithUnlimited
            name={'max_quota_scope_size'}
            unlimitedValue={-1}
            label={t('storageHost.MaxFolderSize')}
            style={{ width: '100%', margin: 0 }}
          >
            <AstryxFormNumberInput
              label={t('storageHost.MaxFolderSize')}
              min={0}
              // Maximum safe integer divided by 10^9 to prevent overflow when converting GB to bytes
              max={Math.floor(Number.MAX_SAFE_INTEGER / Math.pow(10, 9))}
              units="GB"
            />
          </FormItemWithUnlimited>
          <FormItemWithUnlimited
            name={'max_network_count'}
            unlimitedValue={-1}
            label={t('resourcePolicy.MaxNetworkCount')}
            style={{ width: '100%', margin: 0 }}
          >
            <AstryxFormNumberInput
              label={t('resourcePolicy.MaxNetworkCount')}
              min={0}
              max={SIGNED_32BIT_MAX_INT}
            />
          </FormItemWithUnlimited>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default ProjectResourcePolicyV2SettingModal;
