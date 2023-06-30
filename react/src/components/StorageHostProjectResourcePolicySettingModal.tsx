import React, { useEffect } from "react";
import { useFragment, useMutation } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { StorageHostProjectResourcePolicySettingModalFragment$key } from "./__generated__/StorageHostProjectResourcePolicySettingModalFragment.graphql";
import { StorageHostProjectResourcePolicySettingModalCreateMutation } from "./__generated__/StorageHostProjectResourcePolicySettingModalCreateMutation.graphql";
import { StorageHostProjectResourcePolicySettingModalModifyMutation } from "./__generated__/StorageHostProjectResourcePolicySettingModalModifyMutation.graphql";

import {
  Modal,
  ModalProps,
  Form,
  Input,
  InputNumber,
  message,
} from "antd";
import { useTranslation } from "react-i18next";

interface Props extends ModalProps {
  projectName: string;
  resourcePolicyFrgmt: StorageHostProjectResourcePolicySettingModalFragment$key | null;
  onRequestClose: (
    type?: "update" | "create" | "delete",
    max_vfolder_size?: string,
  ) => void;
  children?: React.ReactNode;
}

const StorageHostProjectResourcePolicySettingModal: React.FC<Props> = ({
  projectName,
  resourcePolicyFrgmt,
  onRequestClose,
  children,
  ...props
}) =>  {
  const { t } = useTranslation();

  const [form] = Form.useForm();

  const projectResourcePolicy = useFragment(
    graphql`
      fragment StorageHostProjectResourcePolicySettingModalFragment on ProjectResourcePolicy {
        id
        name
        created_at
        max_vfolder_size
      }
    `, resourcePolicyFrgmt
  );

  const [commitCreateProjectResourcePolicy, isInFlightCommitCreateProjectResourcePolicy] =
    useMutation<StorageHostProjectResourcePolicySettingModalCreateMutation>(graphql`
      mutation StorageHostProjectResourcePolicySettingModalCreateMutation(
        $name: String!,
        $props: CreateProjectResourcePolicyInput!
      ) {
        create_project_resource_policy(name: $name, props: $props) {
          ok
          msg
          resource_policy {
            max_vfolder_size
          }
        }
      }
    `);
  
  const [commitModifyProjectResourcePolicy, isInFlightCommitModifyProjectResourcePolicy] =
    useMutation<StorageHostProjectResourcePolicySettingModalModifyMutation>(graphql`
      mutation StorageHostProjectResourcePolicySettingModalModifyMutation(
        $name: String!,
        $props: ModifyProjectResourcePolicyInput!
      ) {
        modify_project_resource_policy(name: $name, props: $props) {
          ok
          msg
        }
      }
    `);

  
  const _onOk = (e: React.MouseEvent<HTMLElement>) => {
    form.validateFields().then((values) => {
      if (projectResourcePolicy?.name && projectResourcePolicy?.max_vfolder_size) {
        commitModifyProjectResourcePolicy({
          variables: {
            name: projectResourcePolicy?.name,
            props: {
              max_vfolder_size: values.max_vfolder_size,
            }
          },
          onCompleted(response) {
            if (response.modify_project_resource_policy?.ok) {
              onRequestClose("update");
            } else {
              message.error(response.modify_project_resource_policy?.msg);
            }
          },
          onError(error) {
            console.log(error);
            message.error(error.message);
          }
        });
      } else {
        commitCreateProjectResourcePolicy({
          variables: {
            // TODO: Apply multiple resource policy
            // Create a project resource policy with the same name as the project name
            name: projectName || "",
            props: {
              max_vfolder_size: values.max_vfolder_size,
            }
          },
          onCompleted(response) {
            if (response.create_project_resource_policy?.ok) {
              onRequestClose("create", response.create_project_resource_policy.resource_policy?.max_vfolder_size);
            } else {
              message.error(response.create_project_resource_policy?.msg);
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
          projectResourcePolicy ? {
            id: projectResourcePolicy.id,
            name: projectResourcePolicy.name,
            created_at: projectResourcePolicy.created_at,
            max_vfolder_size: projectResourcePolicy.max_vfolder_size,
          } : {
            name: projectName
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
};

export default StorageHostProjectResourcePolicySettingModal;
