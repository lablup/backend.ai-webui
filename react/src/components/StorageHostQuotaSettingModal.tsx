import React, { useEffect } from "react";
import { useFragment } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { StorageHostQuotaSettingModalFragment$key } from "./__generated__/StorageHostQuotaSettingModalFragment.graphql";

import {
  Modal,
  ModalProps,
  Form,
  InputNumber,
} from "antd";
import { useTranslation } from "react-i18next";

interface Props extends ModalProps {
  folderQuotaFrgmt: StorageHostQuotaSettingModalFragment$key | null,
}

const StorageHostQuotaSettingModal: React.FC<Props> = ({
  folderQuotaFrgmt,
  ...props
}) =>  {
  const { t } = useTranslation();

  const [form] = Form.useForm();

  const folderQuota = useFragment(
    graphql`
      fragment StorageHostQuotaSettingModalFragment on FolderQuota {
        id
        quota_scope_id
        storage_host_name
        details {
          hard_limit_bytes
        }
      }
    `, folderQuotaFrgmt
  );

  useEffect(() => {
    if (props.open) {
    } else {
      form.resetFields();
    }
  }, [props.open]);

  return (
    <Modal
      {...props}
      style={{
        zIndex: 10000,
      }}
      destroyOnClose
      onOk={(e) => {
        form.submit();
      }}
      title={"Quota Settings"}
    >
      <Form
        form={form}
        preserve={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        validateTrigger={["onChange", "onBlur"]}
      >
        <div>{folderQuota && JSON.stringify(folderQuota)}</div>
        <Form.Item label={t('storageHost.HardLimit')}>
          <InputNumber
            min={0}
            addonAfter="bytes"
            style={{ width: '70%' }}
            />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StorageHostQuotaSettingModal;
