/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CreateUserResourcePolicyInputV2,
  UserResourcePolicyV2SettingModalCreateMutation,
} from '../__generated__/UserResourcePolicyV2SettingModalCreateMutation.graphql';
import { UserResourcePolicyV2SettingModalFragment$key } from '../__generated__/UserResourcePolicyV2SettingModalFragment.graphql';
import {
  UpdateUserResourcePolicyInput,
  UserResourcePolicyV2SettingModalModifyMutation,
} from '../__generated__/UserResourcePolicyV2SettingModalModifyMutation.graphql';
import { GBToBytes, bytesToGB } from '../helper';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import FormItemWithUnlimited from './FormItemWithUnlimited';
import {
  Form,
  Input,
  Alert,
  App,
  InputNumber,
  theme,
  FormInstance,
} from 'antd';
import { BAIModal, BAIModalProps, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface UserResourcePolicyV2SettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  userResourcePolicyFrgmt: UserResourcePolicyV2SettingModalFragment$key | null;
  onOk: () => void;
  onCancel: () => void;
}

const UserResourcePolicyV2SettingModal: React.FC<
  UserResourcePolicyV2SettingModalProps
> = ({ userResourcePolicyFrgmt = null, onOk, onCancel, ...baiModalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const formRef = useRef<FormInstance>(null);

  const userResourcePolicy = useFragment(
    graphql`
      fragment UserResourcePolicyV2SettingModalFragment on UserResourcePolicyV2 {
        id
        name
        maxVfolderCount
        maxConcurrentLogins
        maxSessionCountPerModelSession
        maxQuotaScopeSize {
          value
        }
        maxCustomizedImageCount
      }
    `,
    userResourcePolicyFrgmt,
  );

  const [
    commitCreateUserResourcePolicy,
    isInFlightCommitCreateUserResourcePolicy,
  ] = useMutation<UserResourcePolicyV2SettingModalCreateMutation>(graphql`
    mutation UserResourcePolicyV2SettingModalCreateMutation(
      $input: CreateUserResourcePolicyInputV2!
    ) {
      adminCreateUserResourcePolicyV2(input: $input) {
        userResourcePolicy {
          id
        }
      }
    }
  `);

  const [
    commitModifyUserResourcePolicy,
    isInFlightCommitModifyUserResourcePolicy,
  ] = useMutation<UserResourcePolicyV2SettingModalModifyMutation>(graphql`
    mutation UserResourcePolicyV2SettingModalModifyMutation(
      $name: String!
      $input: UpdateUserResourcePolicyInput!
    ) {
      adminUpdateUserResourcePolicyV2(name: $name, input: $input) {
        userResourcePolicy {
          id
          name
          createdAt
          maxVfolderCount
          maxConcurrentLogins
          maxSessionCountPerModelSession
          maxQuotaScopeSize {
            value
          }
          maxCustomizedImageCount
        }
      }
    }
  `);

  const rawMaxQuotaScopeSize = userResourcePolicy?.maxQuotaScopeSize.value;
  const initialMaxQuotaScopeSize =
    _.isUndefined(rawMaxQuotaScopeSize) || rawMaxQuotaScopeSize === -1
      ? -1
      : Number(bytesToGB(rawMaxQuotaScopeSize));
  const initialValues = {
    name: userResourcePolicy?.name,
    max_vfolder_count: userResourcePolicy?.maxVfolderCount ?? 0,
    max_concurrent_logins: userResourcePolicy?.maxConcurrentLogins ?? null,
    max_session_count_per_model_session:
      userResourcePolicy?.maxSessionCountPerModelSession,
    max_customized_image_count: userResourcePolicy?.maxCustomizedImageCount,
    max_quota_scope_size: initialMaxQuotaScopeSize,
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
          maxConcurrentLogins: values?.max_concurrent_logins ?? null,
          maxQuotaScopeSize: { expr: maxQuotaScopeSizeExpr },
          maxSessionCountPerModelSession:
            values?.max_session_count_per_model_session,
          maxCustomizedImageCount: values?.max_customized_image_count,
        };
        if (userResourcePolicy === null) {
          const input: CreateUserResourcePolicyInputV2 = {
            name: values?.name,
            ...commonInput,
          };
          commitCreateUserResourcePolicy({
            variables: { input },
            onCompleted(res, errors) {
              if (!res?.adminCreateUserResourcePolicyV2 || errors) {
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
          const input: UpdateUserResourcePolicyInput = commonInput;
          commitModifyUserResourcePolicy({
            variables: { name: values?.name, input },
            onCompleted(res, errors) {
              if (!res?.adminUpdateUserResourcePolicyV2 || errors) {
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
        userResourcePolicy === null
          ? t('resourcePolicy.CreateUserResourcePolicy')
          : t('resourcePolicy.UpdateUserResourcePolicy')
      }
      onOk={handleOk}
      onCancel={() => onCancel()}
      destroyOnHidden
      confirmLoading={
        isInFlightCommitCreateUserResourcePolicy ||
        isInFlightCommitModifyUserResourcePolicy
      }
      {...baiModalProps}
    >
      <Alert
        title={t('storageHost.BeCarefulToSetUserResourcePolicy')}
        type="warning"
        showIcon
        style={{ marginBottom: token.marginMD }}
      />
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={initialValues}
        preserve={false}
      >
        <Form.Item
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
          <Input disabled={!!userResourcePolicy} />
        </Form.Item>
        <BAIFlex
          direction="column"
          align="stretch"
          gap={'md'}
          style={{ marginBottom: token.marginMD }}
        >
          <FormItemWithUnlimited
            name={'max_vfolder_count'}
            unlimitedValue={0}
            label={t('resourcePolicy.MaxFolderCount')}
            style={{ width: '100%', margin: 0 }}
          >
            <InputNumber
              min={0}
              max={SIGNED_32BIT_MAX_INT}
              style={{ width: '100%' }}
            />
          </FormItemWithUnlimited>
          <FormItemWithUnlimited
            name={'max_quota_scope_size'}
            unlimitedValue={-1}
            label={t('storageHost.MaxFolderSize')}
            style={{ width: '100%', margin: 0 }}
          >
            <InputNumber
              min={0}
              // Maximum safe integer divided by 10^9 to prevent overflow when converting GB to bytes
              max={Math.floor(Number.MAX_SAFE_INTEGER / Math.pow(10, 9))}
              suffix="GB"
              style={{ width: '100%' }}
            />
          </FormItemWithUnlimited>
          <FormItemWithUnlimited
            name={'max_concurrent_logins'}
            unlimitedValue={null}
            label={t('resourcePolicy.MaxConcurrentLogins')}
            style={{ width: '100%', margin: 0 }}
          >
            <InputNumber
              min={0}
              max={SIGNED_32BIT_MAX_INT}
              style={{ width: '100%' }}
            />
          </FormItemWithUnlimited>
        </BAIFlex>
        <Form.Item
          name={'max_session_count_per_model_session'}
          label={t('resourcePolicy.MaxSessionCountPerModelSession')}
          rules={[
            { required: true, message: t('data.explorer.ValueRequired') },
          ]}
        >
          <InputNumber
            min={0}
            max={SIGNED_32BIT_MAX_INT}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          name={'max_customized_image_count'}
          label={t('resourcePolicy.MaxCustomizedImageCount')}
          rules={[
            { required: true, message: t('data.explorer.ValueRequired') },
          ]}
        >
          <InputNumber
            min={0}
            max={SIGNED_32BIT_MAX_INT}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default UserResourcePolicyV2SettingModal;
