import React, { useEffect } from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { StorageHostCustomQuotaAddingModalQuery } from "./__generated__/StorageHostCustomQuotaAddingModalQuery.graphql";

import { Modal, ModalProps, Form, FormProps } from "antd";
import { useTranslation } from "react-i18next";
import ProjectSelector from "./ProjectSelector";
import UserMultiSelector from "./UserMultiSelector";

interface CustomQuotaAddingFormProps extends FormProps {
  onRequestClose: () => void;
  currentMode: string;
  limit?: number;
  currentPage?: number;
  pageSize?: number;
  isActive?: boolean;
}
const CustomQuotaAddingVarForm: React.FC<CustomQuotaAddingFormProps> = ({
  onRequestClose,
  currentMode,
  limit = 50,
  currentPage = 1,
  pageSize = 50,
  isActive,
  ...props
}) => {
  const { groups, user_list } =
    useLazyLoadQuery<StorageHostCustomQuotaAddingModalQuery>(
      graphql`
        query StorageHostCustomQuotaAddingModalQuery(
          $limit: Int!
          $offset: Int!
          $is_active: Boolean
        ) {
          groups {
            id
            # ...ProjectMultiSelectorFragment
          }
          user_list(limit: $limit, offset: $offset, is_active: $is_active) {
            items {
              id
              # ...UserMultiSelectorFragment
            }
          }
        }
      `,
      {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        is_active: isActive,
      }
    );
  return (
    <Form
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      preserve={false}
      {...props}
      validateTrigger={["onChange", "onBlur"]}
    >
      {/* {currentMode === 'project' ? (
        <ProjectMultiSelector projectsFrgmt={groups} />
      ) : (
        <UserMultiSelector usersFrgmt={user_list} />
      )} */}
    </Form>
  );
};

interface Props extends ModalProps {
  onRequestClose: () => void;
  currentMode: string;
}
const StorageHostCustomQuotaAddingModal: React.FC<Props> = ({
  onRequestClose,
  currentMode,
  ...props
}) => {
  const { t } = useTranslation();

  const [form] = Form.useForm();

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
      onCancel={() => {
        onRequestClose();
      }}
      title={
        currentMode === "project"
          ? t("storageHost.quotaSettings.AddProject")
          : t("storageHost.quotaSettings.AddUser")
      }
    >
      <CustomQuotaAddingVarForm
        onRequestClose={onRequestClose}
        form={form}
        currentMode={currentMode}
      />
    </Modal>
  );
};

export default StorageHostCustomQuotaAddingModal;
