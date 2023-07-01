import React, { useEffect } from "react";
import { useFragment, useMutation } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { QuotaSettingModalFragment$key } from "./__generated__/QuotaSettingModalFragment.graphql";
import { QuotaSettingModalSetMutation } from "./__generated__/QuotaSettingModalSetMutation.graphql";

import {
  Modal,
  ModalProps,
  Form,
  InputNumber,
} from "antd";
import { useTranslation } from "react-i18next";

interface Props extends ModalProps {
  folderQuotaFrgmt: QuotaSettingModalFragment$key | null;
  children?: React.ReactNode;
}

const QuotaSettingModal: React.FC<Props> = ({
  folderQuotaFrgmt,
  children,
  ...props
}) =>  {
  const { t } = useTranslation();

  const [form] = Form.useForm();

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
        set_folder_quota(
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
      console.log(folderQuota?.quota_scope_id, folderQuota?.storage_host_name, values);
      commitSetFolderQuota({
        variables: {
          quota_scope_id: folderQuota?.quota_scope_id || "",
          storage_host_name: folderQuota?.storage_host_name || "",
          props: {
            hard_limit_bytes: values.hard_limit_bytes,
          },
        },
        onCompleted(response) {
          console.log( response);
        },
        onError(error) {
          console.log(error);
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
      {folderQuota?.details.hard_limit_bytes} {folderQuota?.details.hard_limit_bytes} asdf
      <Form
        form={form}
        preserve={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        validateTrigger={["onChange", "onBlur"]}
      >
        <Form.Item name="hard_limit_bytes" label={t('storageHost.HardLimit')}>
          <InputNumber
            min={0}
            addonAfter="bytes"
            style={{ width: '70%' }}
            defaultValue={folderQuota?.details.hard_limit_bytes}
            />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuotaSettingModal;
