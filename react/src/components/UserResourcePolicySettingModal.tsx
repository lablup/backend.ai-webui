import { GBToBytes, bytesToGB } from '../helper';
import BAIModal, { BAIModalProps } from './BAIModal';
import { UserResourcePolicySettingModalFragment$key } from './__generated__/UserResourcePolicySettingModalFragment.graphql';
// import { UserResourcePolicySettingModalCreateMutation } from "./__generated__/UserResourcePolicySettingModalCreateMutation.graphql";
import { UserResourcePolicySettingModalModifyMutation } from './__generated__/UserResourcePolicySettingModalModifyMutation.graphql';
import { Form, Input, message, Alert, FormInstance } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

interface Props extends BAIModalProps {
  // userResourcePolicy: string;
  userResourcePolicyFrgmt: UserResourcePolicySettingModalFragment$key | null;
  onRequestClose: () => void;
}

const UserResourcePolicySettingModal: React.FC<Props> = ({
  userResourcePolicyFrgmt: resourcePolicyFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();

  const formRef = useRef<FormInstance>(null);

  const userResourcePolicyInfo = useFragment(
    graphql`
      fragment UserResourcePolicySettingModalFragment on UserResourcePolicy {
        id
        name
        created_at
        # max_vfolder_count
        max_quota_scope_size
      }
    `,
    resourcePolicyFrgmt,
  );

  // const [
  //   commitCreateUserResourcePolicy,
  //   isInFlightCommitCreateUserResourcePolicy,
  // ] = useMutation<UserResourcePolicySettingModalCreateMutation>(graphql`
  //   mutation UserResourcePolicySettingModalCreateMutation(
  //     $name: String!
  //     $props: CreateUserResourcePolicyInput!
  //   ) {
  //     create_user_resource_policy(name: $name, props: $props) {
  //       ok
  //       msg
  //       resource_policy {
  //         max_vfolder_count
  //         max_quota_scope_size
  //       }
  //     }
  //   }
  // `);

  const [
    commitModifyUserResourcePolicy,
    // isInFlightCommitModifyUserResourcePolicy,
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

  const _onOk = (e: React.MouseEvent<HTMLElement>) => {
    formRef.current?.validateFields().then((values) => {
      if (userResourcePolicyInfo?.name) {
        commitModifyUserResourcePolicy({
          variables: {
            name: userResourcePolicyInfo?.name,
            props: {
              // max_vfolder_count: values?.max_vfolder_count,
              max_quota_scope_size: GBToBytes(values?.max_quota_scope_size),
            },
          },
          onCompleted(response) {
            if (response.modify_user_resource_policy?.ok) {
              message.success(
                t('storageHost.ResourcePolicySuccessfullyUpdated'),
              );
            } else {
              message.error(response?.modify_user_resource_policy?.msg);
            }
            onRequestClose();
          },
          onError(error) {
            console.log(error);
            message.error(error?.message);
          },
        });
      } else {
        // commitCreateUserResourcePolicy({
        //   variables: {
        //     // TODO: Apply multiple resource policy
        //     // Create a user resource policy with the same name as the user name
        //     name: userResourcePolicy || "",
        //     props: {
        //       max_vfolder_count: values?.max_vfolder_count,
        //       max_quota_scope_size: GBToBytes(values?.max_vfolmax_quota_scope_sizeder_count),
        //     },
        //   },
        //   onCompleted(response) {
        //     if (response?.create_user_resource_policy?.ok) {
        //       message.success(
        //         t("storageHost.ResourcePolicySuccessfullyCreated")
        //       );
        //     } else {
        //       message.error(response?.create_user_resource_policy?.msg);
        //     }
        //     onRequestClose();
        //   },
        //   onError(error) {
        //     console.log(error);
        //     message.error(error?.message);
        //   },
        // });
      }
    });
  };

  return (
    <BAIModal
      {...baiModalProps}
      style={{
        zIndex: 10000,
      }}
      destroyOnClose
      title={t('storageHost.ResourcePolicySettings')}
      onOk={_onOk}
    >
      <Alert
        message={t('storageHost.BeCarefulToSetUserResourcePolicy')}
        type="warning"
        showIcon
        style={{ marginTop: 20, marginBottom: 25 }}
      />
      <Form
        ref={formRef}
        preserve={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 20 }}
        validateTrigger={['onChange', 'onBlur']}
        initialValues={{
          id: userResourcePolicyInfo?.id,
          name: userResourcePolicyInfo?.name,
          created_at: userResourcePolicyInfo?.created_at,
          max_quota_scope_size:
            userResourcePolicyInfo?.max_quota_scope_size === -1
              ? null
              : bytesToGB(userResourcePolicyInfo?.max_quota_scope_size),
        }}
      >
        <Form.Item
          name="max_quota_scope_size"
          label={t('storageHost.MaxFolderSize')}
          rules={[
            {
              pattern: /^\d+(\.\d+)?$/,
              message:
                t('storageHost.quotaSettings.AllowNumberAndDot') ||
                'Allows numbers and .(dot) only',
            },
          ]}
        >
          <Input addonAfter="GB" type="number" step={0.25} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default UserResourcePolicySettingModal;
