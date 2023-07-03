import React, { useDeferredValue } from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment, useLazyLoadQuery, useMutation } from "react-relay";
import { ResourcePolicyCardDeleteProjectResourcePolicyMutation } from "./__generated__/ResourcePolicyCardDeleteProjectResourcePolicyMutation.graphql";
import { ResourcePolicyCardDeleteUserResourcePolicyMutation } from "./__generated__/ResourcePolicyCardDeleteUserResourcePolicyMutation.graphql";
import { ResourcePolicyCardModifyProjectMutation } from "./__generated__/ResourcePolicyCardModifyProjectMutation.graphql";
import { ResourcePolicyCardModifyUserMutation } from "./__generated__/ResourcePolicyCardModifyUserMutation.graphql";

import {
  Card,
  CardProps,
  Descriptions,
  Dropdown,
  Empty,
  Modal,
  message,
} from "antd";
import {
  EditFilled,
  EllipsisOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import ProjectResourcePolicySettingModal from "./ProjectResourcePolicySettingModal";
import UserResourcePolicySettingModal from "./UserResourcePolicySettingModal";

import { _humanReadableDecimalSize } from "../helper/index";
import { useTranslation } from "react-i18next";
import { useToggle } from "ahooks";
import { useDateISOState, useUpdatableState } from "../hooks";
import { QuotaScopeType } from "../helper/index";
import { ResourcePolicyCard_project_resource_policy$key } from "./__generated__/ResourcePolicyCard_project_resource_policy.graphql";
import { ResourcePolicyCard_user_resource_policy$key } from "./__generated__/ResourcePolicyCard_user_resource_policy.graphql";

interface Props extends CardProps {
  projectResourcePolicyFrgmt: ResourcePolicyCard_project_resource_policy$key | null;
  userResourcePolicyFrgmt: ResourcePolicyCard_user_resource_policy$key | null;
  onChangePolicy: () => void;
}
const ResourcePolicyCard: React.FC<Props> = ({
  projectResourcePolicyFrgmt,
  userResourcePolicyFrgmt,
  onChangePolicy,
  ...props
}) => {
  const { t } = useTranslation();

  const [
    visibleProjectResourcePolicySettingModal,
    { toggle: toggleProjectResourcePolicySettingModal },
  ] = useToggle(false);
  const [
    visibleUserResourcePolicySettingModal,
    { toggle: toggleUserResourcePolicySettingModal },
  ] = useToggle(false);

  // const [fetchKey, onChangePolicy] = useUpdatableState();

  const project_resource_policy = useFragment(
    graphql`
      fragment ResourcePolicyCard_project_resource_policy on ProjectResourcePolicy {
        id
        name
        max_vfolder_size
        ...ProjectResourcePolicySettingModalFragment
      }
    `,
    projectResourcePolicyFrgmt
  );
  const user_resource_policy = useFragment(
    graphql`
      fragment ResourcePolicyCard_user_resource_policy on UserResourcePolicy {
        id
        name
        max_vfolder_size
        ...UserResourcePolicySettingModalFragment
      }
    `,
    userResourcePolicyFrgmt
  );

  const [
    commitModifyProjectResourcePolicy,
    isInFlightCommitModifyProjectResourcePolicy,
  ] = useMutation<ResourcePolicyCardModifyProjectMutation>(graphql`
    mutation ResourcePolicyCardModifyProjectMutation(
      $name: String!
      $props: ModifyProjectResourcePolicyInput!
    ) {
      modify_project_resource_policy(name: $name, props: $props) {
        ok
        msg
      }
    }
  `);

  const [
    commitModifyUserResourcePolicy,
    isInFlightCommitModifyUserResourcePolicy,
  ] = useMutation<ResourcePolicyCardModifyUserMutation>(graphql`
    mutation ResourcePolicyCardModifyUserMutation(
      $name: String!
      $props: ModifyUserResourcePolicyInput!
    ) {
      modify_user_resource_policy(name: $name, props: $props) {
        ok
        msg
      }
    }
  `);

  const [
    commitDeleteProjectResourcePolicy,
    isInFlightCommitDeleteProjectResourcePolicy,
  ] =
    useMutation<ResourcePolicyCardDeleteProjectResourcePolicyMutation>(graphql`
      mutation ResourcePolicyCardDeleteProjectResourcePolicyMutation(
        $name: String!
      ) {
        delete_project_resource_policy(name: $name) {
          ok
          msg
        }
      }
    `);

  const [
    commitDeleteUserResourcePolicy,
    isInFlightCommitDeleteUserResourcePolicy,
  ] = useMutation<ResourcePolicyCardDeleteUserResourcePolicyMutation>(graphql`
    mutation ResourcePolicyCardDeleteUserResourcePolicyMutation(
      $name: String!
    ) {
      delete_user_resource_policy(name: $name) {
        ok
        msg
      }
    }
  `);

  const confirmDeleteResourcePolicy = () => {
    Modal.confirm({
      title: t("storageHost.DeleteResourcePolicy"),
      content: t("storageHost.AreYouSureYouWantToDelete"),
      icon: <ExclamationCircleOutlined />,
      okText: t("button.Confirm"),
      okType: "danger",
      onOk() {
        if (project_resource_policy) {
          commitDeleteProjectResourcePolicy({
            variables: {
              name: project_resource_policy.name,
            },
            onCompleted(response) {
              if (!response?.delete_project_resource_policy?.ok) {
                message.error(response?.delete_project_resource_policy?.msg);
              } else {
                onChangePolicy();
                message.success(
                  t("storageHost.ResourcePolicySuccessfullyDeleted")
                );
              }
            },
            onError(error) {
              console.log(error);
              message.error(error.message);
            },
          });
        } else if (user_resource_policy) {
          commitDeleteUserResourcePolicy({
            variables: {
              name: user_resource_policy.name,
            },
            onCompleted(response) {
              if (!response?.delete_user_resource_policy?.ok) {
                message.error(response?.delete_user_resource_policy?.msg);
              } else {
                onChangePolicy();
                message.success(
                  t("storageHost.ResourcePolicySuccessfullyDeleted")
                );
              }
            },
            onError(error) {
              console.log(error);
              message.error(error?.message);
            },
          });
        } else {
          message.error(t("storageHost.SelectProjectOrUserFirst"));
        }
      },
    });
  };

  const confirmUnsetResourcePolicy = () => {
    Modal.confirm({
      title: t("storageHost.UnsetResourcePolicy"),
      content: t("storageHost.DoYouWantToUseDefaultValue"),
      icon: <ExclamationCircleOutlined />,
      okText: t("button.Confirm"),
      onOk() {
        if (project_resource_policy) {
          commitModifyProjectResourcePolicy({
            variables: {
              name: project_resource_policy.name,
              props: {
                max_vfolder_size: -1,
              },
            },
            onCompleted(response) {
              if (!response?.modify_project_resource_policy?.ok) {
                message.error(response?.modify_project_resource_policy?.msg);
              } else {
                onChangePolicy();
                message.success(
                  t("storageHost.ResourcePolicySuccessfullyUpdated")
                );
              }
            },
            onError(error) {
              message.error(error?.message);
            },
          });
        } else if (user_resource_policy) {
          commitModifyUserResourcePolicy({
            variables: {
              name: user_resource_policy.name,
              props: {
                max_vfolder_size: -1,
              },
            },
            onCompleted(response) {
              if (!response?.modify_user_resource_policy?.ok) {
                message.error(response?.modify_user_resource_policy?.msg);
              } else {
                onChangePolicy();
                message.success(
                  t("storageHost.ResourcePolicySuccessfullyUpdated")
                );
              }
            },
            onError(error) {
              message.error(error?.message);
            },
          });
        } else {
          message.error(t("storageHost.SelectProjectOrUserFirst"));
        }
      },
    });
  };

  return (
    <>
      <Card
        extra={
          project_resource_policy || user_resource_policy ? (
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: "edit",
                    label: t("button.Edit"),
                    icon: <EditFilled />,
                    onClick: () => {
                      project_resource_policy
                        ? toggleProjectResourcePolicySettingModal()
                        : toggleUserResourcePolicySettingModal();
                    },
                  },
                  // {
                  //   key: "delete",
                  //   label: t("button.Delete"),
                  //   icon: <DeleteFilled />,
                  //   danger: true,
                  //   onClick: () => confirmDeleteResourcePolicy(),
                  // },
                  {
                    key: "unset",
                    label: t("button.Unset"),
                    icon: <UndoOutlined />,
                    danger: true,
                    onClick: () => confirmUnsetResourcePolicy(),
                  },
                ],
              }}
            >
              <EllipsisOutlined />
            </Dropdown>
          ) : null
        }
        title={t("storageHost.ResourcePolicy")}
        bordered={false}
        headStyle={{ borderBottom: "none" }}
        style={{ marginBottom: 10 }}
      >
        <Descriptions>
          {project_resource_policy || user_resource_policy ? (
            <Descriptions.Item label={t("storageHost.MaxFolderSize")}>
              {project_resource_policy
                ? project_resource_policy &&
                  project_resource_policy?.max_vfolder_size !== -1
                  ? _humanReadableDecimalSize(
                      project_resource_policy?.max_vfolder_size
                    )
                  : t("storageHost.NoConfigs")
                : user_resource_policy &&
                  user_resource_policy?.max_vfolder_size !== -1
                ? _humanReadableDecimalSize(
                    user_resource_policy?.max_vfolder_size
                  )
                : t("storageHost.NoConfigs")}
            </Descriptions.Item>
          ) : (
            <Descriptions.Item>
              <Empty
                style={{ width: "100%" }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>{t("storageHost.quotaSettings.SelectFirst")}</div>
                }
              />
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
      <ProjectResourcePolicySettingModal
        open={visibleProjectResourcePolicySettingModal}
        destroyOnClose={true}
        onCancel={toggleProjectResourcePolicySettingModal}
        onOk={toggleProjectResourcePolicySettingModal}
        onRequestClose={() => {
          onChangePolicy();
          toggleProjectResourcePolicySettingModal();
        }}
        // projectResourcePolicy={selectedProjectResourcePolicy || ""}
        projectResourcePolicyFrgmt={project_resource_policy || null}
      />
      <UserResourcePolicySettingModal
        open={visibleUserResourcePolicySettingModal}
        destroyOnClose={true}
        onCancel={toggleUserResourcePolicySettingModal}
        onOk={toggleUserResourcePolicySettingModal}
        userResourcePolicyFrgmt={user_resource_policy || null}
        onRequestClose={() => {
          onChangePolicy();
          toggleUserResourcePolicySettingModal();
        }}
      />
    </>
  );
};

export default ResourcePolicyCard;
