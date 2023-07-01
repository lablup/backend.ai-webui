import React from "react";
import { useFragment, useMutation } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { UserResourcePolicySettingModalFragment$key } from "./__generated__/UserResourcePolicySettingModalFragment.graphql";
import { UserResourcePolicySettingModalCreateMutation } from "./__generated__/UserResourcePolicySettingModalCreateMutation.graphql";
import { UserResourcePolicySettingModalModifyMutation } from "./__generated__/UserResourcePolicySettingModalModifyMutation.graphql";

import {
  Modal,
  ModalProps,
  Form,
  InputNumber,
  message,
} from "antd";
import { useTranslation } from "react-i18next";

interface Props extends ModalProps {
  userResourcePolicy: string;
  resourcePolicyFrgmt: UserResourcePolicySettingModalFragment$key | null;
  onRequestClose: (
    type?: "update" | "create" | "delete",
    max_vfolder_size?: string,
  ) => void;
  children?: React.ReactNode;
}

const UserResourcePolicySettingModal: React.FC<Props> = ({
  userResourcePolicy,
  resourcePolicyFrgmt,
  onRequestClose,
  children,
  ...props
}) => {
  const { t } = useTranslation();

  const [form] = Form.useForm();

  const userResourcePolicyInfo = useFragment(
    graphql`
      fragment UserResourcePolicySettingModalFragment on UserResourcePolicy {
        id
        name
        created_at
        max_vfolder_size
      }
    `, resourcePolicyFrgmt
  );

  const [commitCreateUserResourcePolicy, isInFlightCommitCreateUserResourcePolicy] =
    useMutation<UserResourcePolicySettingModalCreateMutation>(graphql`
      mutation UserResourcePolicySettingModalCreateMutation(
        $name: String!,
        $props: CreateUserResourcePolicyInput!
      ) {
        create_user_resource_policy(name: $name, props: $props) {
          ok
          msg
          resource_policy {
            max_vfolder_size
          }
        }
      }
    `);

  const [commitModifyUserResourcePolicy, isInFlightCommitModifyUserResourcePolicy] =
    useMutation<UserResourcePolicySettingModalModifyMutation>(graphql`
      mutation UserResourcePolicySettingModalModifyMutation(
        $name: String!,
        $props: ModifyUserResourcePolicyInput!
      ) {
        modify_user_resource_policy(name: $name, props: $props) {
          ok
          msg
        }
      }
    `);


  const _onOk = (e: React.MouseEvent<HTMLElement>) => {
    form.validateFields().then((values) => {
      if (userResourcePolicyInfo?.name && userResourcePolicyInfo?.max_vfolder_size) {
        commitModifyUserResourcePolicy({
          variables: {
            name: userResourcePolicyInfo?.name,
            props: {
              max_vfolder_size: values.max_vfolder_size,
            }
          },
          onCompleted(response) {
            if (response.modify_user_resource_policy?.ok) {
              onRequestClose("update");
            } else {
              message.error(response.modify_user_resource_policy?.msg);
            }
          },
          onError(error) {
            console.log(error);
            message.error(error.message);
          }
        });
      } else {
        commitCreateUserResourcePolicy({
          variables: {
            // TODO: Apply multiple resource policy
            // Create a user resource policy with the same name as the user name
            name: userResourcePolicy || "",
            props: {
              max_vfolder_size: values.max_vfolder_size,
            }
          },
          onCompleted(response) {
            if (response.create_user_resource_policy?.ok) {
              onRequestClose("create", response.create_user_resource_policy.resource_policy?.max_vfolder_size);
            } else {
              message.error(response.create_user_resource_policy?.msg);
            }
          },
          onError(error) {
            console.log(error);
            message.error(error.message);
          }
        });
      }
    });
  };

  return (
    <Modal
      {...props}
      style={{
        zIndex: 10000,
      }}
      destroyOnClose
      title={t("storageHost.ResourcePolicySettings")}
      onOk={_onOk}
    >
      <Form
        form={form}
        preserve={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 20 }}
        validateTrigger={["onChange", "onBlur"]}
        initialValues={
          userResourcePolicyInfo ? {
            id: userResourcePolicyInfo.id,
            name: userResourcePolicyInfo.name,
            created_at: userResourcePolicyInfo.created_at,
            max_vfolder_size: (userResourcePolicyInfo.max_vfolder_size === -1 ? null : userResourcePolicyInfo.max_vfolder_size),
          } : {
            name: userResourcePolicy
          }
        }
      >
        <Form.Item
          name="max_vfolder_size" label={t('storageHost.MaxFolderSize')}>
          <InputNumber
            min={0}
            addonAfter="bytes"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default UserResourcePolicySettingModal;
