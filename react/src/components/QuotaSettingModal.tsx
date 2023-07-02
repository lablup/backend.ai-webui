import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment, useMutation, useLazyLoadQuery } from "react-relay";
import { QuotaSettingModalQuery } from "./__generated__/QuotaSettingModalQuery.graphql";
import { QuotaSettingModalFragment$key } from "./__generated__/QuotaSettingModalFragment.graphql";
import { QuotaSettingModalSetMutation } from "./__generated__/QuotaSettingModalSetMutation.graphql";

import {
  Modal,
  ModalProps,
  Form,
  InputNumber,
  message,
} from "antd";
import { useTranslation } from "react-i18next";
import { QuotaScopeType, addQuotaScopeTypePrefix, _humanReadableDecimalSize } from "../helper/index";

interface Props extends ModalProps {
  quotaScopeId?: string,
  storageHostName?: string,
  currentSettingType: QuotaScopeType,
  selectedProjectResourcePolicy?: string;
  selectedUserResourcePolicy?: string;
  folderQuotaFrgmt?: QuotaSettingModalFragment$key | null;
  children?: React.ReactNode;
  onRequestClose: () => void;
}

const QuotaSettingModal: React.FC<Props> = ({
  quotaScopeId,
  storageHostName,
  currentSettingType,
  selectedProjectResourcePolicy,
  selectedUserResourcePolicy,
  folderQuotaFrgmt = null,
  children,
  onRequestClose,
  ...props
}) =>  {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  
  const { project_resource_policy, user_resource_policy } = useLazyLoadQuery<QuotaSettingModalQuery>(
    graphql`
      query QuotaSettingModalQuery(
        $project_resource_policy_name: String!,
        $user_resource_policy_name: String,
        $skipProjectResourcePolicy: Boolean!,
        $skipUserResourcePolicy: Boolean!,
      ) {
        project_resource_policy (
          name: $project_resource_policy_name,
        ) @skip(if: $skipProjectResourcePolicy) {
          max_vfolder_size
          ...ProjectResourcePolicySettingModalFragment
        }

        user_resource_policy (
          name: $user_resource_policy_name,
        ) @skip(if: $skipUserResourcePolicy) {
          max_vfolder_size
          ...UserResourcePolicySettingModalFragment
        }
    }
    `,
    {
      project_resource_policy_name: selectedProjectResourcePolicy || "",
      user_resource_policy_name: selectedUserResourcePolicy || "",
      skipProjectResourcePolicy: selectedProjectResourcePolicy === "" || selectedProjectResourcePolicy === undefined,
      skipUserResourcePolicy: selectedUserResourcePolicy === "" || selectedProjectResourcePolicy === undefined,
    }
  );

  const resourcePolicyMaxVFolderSize = currentSettingType === "project" ? project_resource_policy?.max_vfolder_size : user_resource_policy?.max_vfolder_size;

  const folderQuota = useFragment(
    graphql`
      fragment QuotaSettingModalFragment on FolderQuota {
        id
        quota_scope_id
        storage_host_name
        details {
          hard_limit_bytes
        }
      }
    `, folderQuotaFrgmt
  );

  const [commitSetFolderQuota, isInFlightCommitSetFolderQuota] =
    useMutation<QuotaSettingModalSetMutation>(graphql`
      mutation QuotaSettingModalSetMutation(
        $quota_scope_id: String!,
        $storage_host_name: String!,
        $props: FolderQuotaInput!,
      ) {
        set_folder_quota (
          quota_scope_id: $quota_scope_id,
          storage_host_name: $storage_host_name,
          props: $props,
        ) {
          folder_quota {
            id
            quota_scope_id
            storage_host_name
            details {
              hard_limit_bytes
            }
          }
        }
      }
    `);

  const _onOk = (e: React.MouseEvent<HTMLElement>) => {
    form.validateFields().then((values) => {
      const quotaScopeIdWithPrefix = addQuotaScopeTypePrefix(currentSettingType, folderQuota?.quota_scope_id || quotaScopeId || "");
      commitSetFolderQuota({
        variables: {
          quota_scope_id: quotaScopeIdWithPrefix,
          storage_host_name: folderQuota?.storage_host_name || storageHostName || "",
          props: {
            hard_limit_bytes: values.hard_limit_bytes,
          },
        },
        onCompleted(response) {
          if (response.set_folder_quota?.folder_quota?.details?.hard_limit_bytes) {
            message.success(t("storageHost.quotaSettings.FolderQuotaSuccessfullyUpdated"));
          } else {
            message.error(t('dialog.ErrorOccurred'));
          }
          onRequestClose();
        },
        onError(error) {
          console.log(error);
          message.error(error.message);
        }
      })
    });
  };

  return (
    <Modal
      {...props}
      style={{
        zIndex: 10000,
      }}
      destroyOnClose
      onOk={_onOk}
      title={t("storageHost.quotaSettings.QuotaSettings")}
    >
      <Form
        form={form}
        preserve={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 20 }}
        validateTrigger={["onChange", "onBlur"]}
        style={{ marginBottom: 40, marginTop: 20 }}
      >
        <Form.Item
          name="hard_limit_bytes"
          label={t('storageHost.HardLimit')}
          rules={[
            {
              validator: (_, value) => {
                if (resourcePolicyMaxVFolderSize && resourcePolicyMaxVFolderSize < value) {
                  return Promise.reject(
                    `${t("storageHost.quotaSettings.LessThanResourcePolicy")} (${_humanReadableDecimalSize(resourcePolicyMaxVFolderSize)})`
                    );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            min={0}
            addonAfter="bytes"
            style={{ width: '70%' }}
            defaultValue={folderQuota?.details?.hard_limit_bytes}
            />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuotaSettingModal;
