import {
  CreateUserResourcePolicyInput,
  UserResourcePolicySettingModalCreateMutation,
} from '../__generated__/UserResourcePolicySettingModalCreateMutation.graphql';
import { UserResourcePolicySettingModalFragment$key } from '../__generated__/UserResourcePolicySettingModalFragment.graphql';
import {
  ModifyUserResourcePolicyInput,
  UserResourcePolicySettingModalModifyMutation,
} from '../__generated__/UserResourcePolicySettingModalModifyMutation.graphql';
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
import _ from 'lodash';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface Props extends BAIModalProps {
  existingPolicyNames?: string[];
  userResourcePolicyFrgmt: UserResourcePolicySettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const UserResourcePolicySettingModal: React.FC<Props> = ({
  existingPolicyNames,
  userResourcePolicyFrgmt = null,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const formRef = useRef<FormInstance>(null);

  const userResourcePolicy = useFragment(
    graphql`
      fragment UserResourcePolicySettingModalFragment on UserResourcePolicy {
        id
        name
        # follows version of https://github.com/lablup/backend.ai/pull/1993
        # --------------- START --------------------
        max_vfolder_count @since(version: "23.09.6")
        max_session_count_per_model_session @since(version: "23.09.10")
        max_quota_scope_size @since(version: "23.09.2")
        # ---------------- END ---------------------
        max_customized_image_count @since(version: "24.03.0")
      }
    `,
    userResourcePolicyFrgmt,
  );

  const [
    commitCreateUserResourcePolicy,
    isInFlightCommitCreateUserResourcePolicy,
  ] = useMutation<UserResourcePolicySettingModalCreateMutation>(graphql`
    mutation UserResourcePolicySettingModalCreateMutation(
      $name: String!
      $props: CreateUserResourcePolicyInput!
    ) {
      create_user_resource_policy(name: $name, props: $props) {
        ok
        msg
      }
    }
  `);

  const [
    commitModifyUserResourcePolicy,
    isInFlightCommitModifyUserResourcePolicy,
  ] = useMutation<UserResourcePolicySettingModalModifyMutation>(graphql`
    mutation UserResourcePolicySettingModalModifyMutation(
      $name: String!
      $props: ModifyUserResourcePolicyInput!
    ) {
      modify_user_resource_policy(name: $name, props: $props) {
        ok
        msg
      }
    }
  `);

  const initialValues = useMemo(() => {
    let unlimitedValues = {};
    if (userResourcePolicy === null) {
      // Initialize unlimited values as a default when creating a new policy.
      unlimitedValues = {
        max_vfolder_count: 0,
        max_quota_scope_size: -1,
      };
    }
    let maxQuotaScopeSize = userResourcePolicy?.max_quota_scope_size;
    maxQuotaScopeSize =
      _.isUndefined(maxQuotaScopeSize) || maxQuotaScopeSize === -1
        ? -1
        : bytesToGB(maxQuotaScopeSize);
    return {
      ...unlimitedValues,
      ...userResourcePolicy,
      max_quota_scope_size: maxQuotaScopeSize,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userResourcePolicy,
    userResourcePolicy?.max_vfolder_count,
    userResourcePolicy?.max_quota_scope_size,
  ]);

  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    return formRef?.current
      ?.validateFields()
      .then((values) => {
        const props:
          | CreateUserResourcePolicyInput
          | ModifyUserResourcePolicyInput = {
          max_vfolder_count: values?.max_vfolder_count || 0,
          max_quota_scope_size:
            values?.max_quota_scope_size === -1
              ? -1
              : GBToBytes(values?.max_quota_scope_size),
          max_session_count_per_model_session:
            values?.max_session_count_per_model_session,
          max_customized_image_count: values?.max_customized_image_count,
        };
        if (userResourcePolicy === null) {
          commitCreateUserResourcePolicy({
            variables: {
              name: values?.name,
              props: props as CreateUserResourcePolicyInput,
            },
            onCompleted(res, errors) {
              if (!res?.create_user_resource_policy?.ok || errors) {
                message.error(
                  res?.create_user_resource_policy?.msg ||
                    t('resourcePolicy.CannotCreateResourcePolicy'),
                );
                onRequestClose();
              } else {
                message.success(
                  t('storageHost.ResourcePolicySuccessfullyUpdated'),
                );
                onRequestClose(true);
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
          commitModifyUserResourcePolicy({
            variables: {
              name: values?.name,
              props: props as ModifyUserResourcePolicyInput,
            },
            onCompleted(res, errors) {
              if (!res?.modify_user_resource_policy?.ok || errors) {
                message.error(
                  res?.modify_user_resource_policy?.msg ||
                    t('resourcePolicy.CannotUpdateResourcePolicy'),
                );
                onRequestClose();
              } else {
                message.success(
                  t('storageHost.ResourcePolicySuccessfullyUpdated'),
                );
                onRequestClose(true);
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
          ? t('resourcePolicy.CreateResourcePolicy')
          : t('resourcePolicy.UpdateResourcePolicy')
      }
      onOk={handleOk}
      onCancel={() => onRequestClose()}
      destroyOnClose
      confirmLoading={
        isInFlightCommitCreateUserResourcePolicy ||
        isInFlightCommitModifyUserResourcePolicy
      }
      {...baiModalProps}
    >
      <Alert
        message={t('storageHost.BeCarefulToSetUserResourcePolicy')}
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
            {
              validator: (_, value) => {
                if (
                  !userResourcePolicy &&
                  existingPolicyNames?.includes(value)
                ) {
                  return Promise.reject(
                    t('resourcePolicy.ResourcePolicyNameAlreadyExists'),
                  );
                }
                return Promise.resolve();
              },
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
              addonAfter="GB"
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

export default UserResourcePolicySettingModal;
