import { GBToBytes, bytesToGB } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import FormItemWithUnlimited from './FormItemWithUnlimited';
import {
  CreateUserResourcePolicyInput,
  UserResourcePolicySettingModalCreateMutation,
} from './__generated__/UserResourcePolicySettingModalCreateMutation.graphql';
import { UserResourcePolicySettingModalFragment$key } from './__generated__/UserResourcePolicySettingModalFragment.graphql';
import {
  ModifyUserResourcePolicyInput,
  UserResourcePolicySettingModalModifyMutation,
} from './__generated__/UserResourcePolicySettingModalModifyMutation.graphql';
import { Form, Input, Alert, App, InputNumber, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

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
  const [form] = Form.useForm();

  const baiClient = useSuspendedBackendaiClient();
  const supportMaxVfolderCount = baiClient?.supports(
    'max-vfolder-count-in-user-and-project-resource-policy',
  );
  const supportMaxQuotaScopeSize = baiClient?.supports('max-quota-scope-size');
  const supportMaxSessionCountPerModelSession = baiClient?.supports(
    'max-session-count-per-model-session',
  );
  const supportMaxCustomizedImageCount = baiClient?.supports(
    'max-customized-image-count',
  );

  const userResourcePolicy = useFragment(
    graphql`
      fragment UserResourcePolicySettingModalFragment on UserResourcePolicy {
        id
        name
        max_vfolder_count @since(version: "23.09.6")
        max_quota_scope_size @since(version: "24.03.1")
        max_session_count_per_model_session @since(version: "23.09.10")
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
    return form
      .validateFields()
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
                message.error(res?.create_user_resource_policy?.msg);
                onRequestClose();
              } else {
                message.success(
                  t('storageHost.ResourcePolicySuccessfullyUpdated'),
                );
                onRequestClose(true);
              }
            },
            onError(error) {
              message.error(error?.message);
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
                message.error(res?.modify_user_resource_policy?.msg);
                onRequestClose();
              } else {
                message.success(
                  t('storageHost.ResourcePolicySuccessfullyUpdated'),
                );
                onRequestClose(true);
              }
            },
            onError(error) {
              message.error(error?.message);
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
        style={{ marginTop: token.marginMD, marginBottom: token.marginMD }}
      />
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
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
        <Flex
          direction="column"
          align="stretch"
          gap={'md'}
          style={{ marginBottom: token.marginMD }}
        >
          {supportMaxVfolderCount ? (
            <FormItemWithUnlimited
              name={'max_vfolder_count'}
              unlimitedValue={0}
              label={t('resourcePolicy.MaxFolderCount')}
              formItemProps={{
                style: { width: '100%', margin: 0 },
              }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </FormItemWithUnlimited>
          ) : null}
          {supportMaxQuotaScopeSize ? (
            <FormItemWithUnlimited
              name={'max_quota_scope_size'}
              unlimitedValue={-1}
              label={t('storageHost.MaxFolderSize')}
              formItemProps={{
                style: { width: '100%', margin: 0 },
              }}
            >
              <InputNumber min={0} addonAfter="GB" style={{ width: '100%' }} />
            </FormItemWithUnlimited>
          ) : null}
        </Flex>
        {supportMaxSessionCountPerModelSession ? (
          <Form.Item
            name={'max_session_count_per_model_session'}
            label={t('resourcePolicy.MaxSessionCountPerModelSession')}
            rules={[
              { required: true, message: t('data.explorer.ValueRequired') },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        ) : null}
        {supportMaxCustomizedImageCount ? (
          <Form.Item
            name={'max_customized_image_count'}
            label={t('resourcePolicy.MaxCustomizedImageCount')}
            rules={[
              { required: true, message: t('data.explorer.ValueRequired') },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        ) : null}
      </Form>
    </BAIModal>
  );
};

export default UserResourcePolicySettingModal;
