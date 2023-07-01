import React, { useDeferredValue } from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { ResourcePolicyCardQuery } from "./__generated__/ResourcePolicyCardQuery.graphql";
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
  ExclamationCircleOutlined
} from "@ant-design/icons";

import ProjectResourcePolicySettingModal from "./ProjectResourcePolicySettingModal";
import UserResourcePolicySettingModal from "./UserResourcePolicySettingModal";

import { _humanReadableDecimalSize } from "../helper/index";
import { useTranslation } from "react-i18next";
import { useToggle } from "ahooks";
import { useDateISOState } from "../hooks";
import { QuotaScopeType } from "../helper/index";

interface Props extends CardProps {
  quotaScopeId?: string;
  currentSettingType?: QuotaScopeType;
  selectedProjectId?: string;
  selectedUserId?: string;
  selectedProjectResourcePolicy?: string;
  selectedUserResourcePolicy?: string;
  extraFetchKey?: string;
}
const ResourcePolicyCard: React.FC<Props> = ({
  quotaScopeId,
  currentSettingType,
  selectedProjectId,
  selectedUserId,
  selectedProjectResourcePolicy,
  selectedUserResourcePolicy,
  extraFetchKey = "",
  ...props
}) => {
  const { t } = useTranslation();

  const [visibleProjectResourcePolicySettingModal, { toggle: toggleProjectResourcePolicySettingModal }] = useToggle(false);
  const [visibleUserResourcePolicySettingModal, { toggle: toggleUserResourcePolicySettingModal }] = useToggle(false);

  const [internalFetchKey, updateInternalFetchKey] = useDateISOState();
  const deferredMergedFetchKey = useDeferredValue(internalFetchKey + extraFetchKey);

  const { project_resource_policy, user_resource_policy } = useLazyLoadQuery<ResourcePolicyCardQuery>(
    graphql`
      query ResourcePolicyCardQuery(
        $project_resource_policy: String!,
        $user_resource_policy: String,
        $skipProjectResourcePolicy: Boolean!,
        $skipUserResourcePolicy: Boolean!,
      ) {
        project_resource_policy (
          name: $project_resource_policy,
        ) @skip(if: $skipProjectResourcePolicy) {
          max_vfolder_size
          ...ProjectResourcePolicySettingModalFragment
        }

        user_resource_policy (
          name: $user_resource_policy,
        ) @skip(if: $skipUserResourcePolicy) {
          max_vfolder_size
          ...UserResourcePolicySettingModalFragment
        }
    }
  `,
    {
      project_resource_policy: selectedProjectResourcePolicy || "",
      user_resource_policy: selectedUserResourcePolicy || "",
      skipProjectResourcePolicy: selectedProjectResourcePolicy === "",
      skipUserResourcePolicy: selectedUserResourcePolicy === "",
    },
    {
      fetchKey: deferredMergedFetchKey,
      fetchPolicy: "store-and-network",
    }
  );

  const [commitModifyProjectResourcePolicy, isInFlightCommitModifyProjectResourcePolicy] =
  useMutation<ResourcePolicyCardModifyProjectMutation>(graphql`
    mutation ResourcePolicyCardModifyProjectMutation(
      $name: String!,
      $props: ModifyProjectResourcePolicyInput!
    ) {
      modify_project_resource_policy(name: $name, props: $props) {
        ok
        msg
      }
    }
  `);

  const [commitModifyUserResourcePolicy, isInFlightCommitModifyUserResourcePolicy] =
  useMutation<ResourcePolicyCardModifyUserMutation>(graphql`
    mutation ResourcePolicyCardModifyUserMutation(
      $name: String!,
      $props: ModifyUserResourcePolicyInput!
    ) {
      modify_user_resource_policy(name: $name, props: $props) {
        ok
        msg
      }
    }
  `);

  const [commitDeleteProjectResourcePolicy, isInFlightCommitDeleteProjectResourcePolicy] =
    useMutation<ResourcePolicyCardDeleteProjectResourcePolicyMutation>(graphql`
      mutation ResourcePolicyCardDeleteProjectResourcePolicyMutation(
        $name: String!,
      ) {
        delete_project_resource_policy(name: $name) {
          ok
          msg
        }
      }
    `);

  const [commitDeleteUserResourcePolicy, isInFlightCommitDeleteUserResourcePolicy] =
    useMutation<ResourcePolicyCardDeleteUserResourcePolicyMutation>(graphql`
      mutation ResourcePolicyCardDeleteUserResourcePolicyMutation(
        $name: String!,
      ) {
        delete_user_resource_policy(name: $name) {
          ok
          msg
        }
      }
    `);

  const confirmDeleteResourcePolicy = () => {
    Modal.confirm({
      title: t('storageHost.DeleteResourcePolicy'),
      content: t('storageHost.AreYouSureYouWantToDelete'),
      icon: <ExclamationCircleOutlined />,
      okText: t('button.Confirm'),
      okType: 'danger',
      onOk() {
        if (currentSettingType === "project" && selectedProjectResourcePolicy) {
          commitDeleteProjectResourcePolicy({
            variables: {
              name: selectedProjectResourcePolicy,
            },
            onCompleted(response) {
              if (!response.delete_project_resource_policy?.ok) {
                message.error(response.delete_project_resource_policy?.msg);
              } else {
                updateInternalFetchKey();
                message.success(t("storageHost.ResourcePolicySuccessfullyDeleted"));
              }
            },
            onError(error) {
              console.log(error);
              message.error(error.message);
            },
          });
        } else if (currentSettingType === "user" && selectedUserResourcePolicy) {
          commitDeleteUserResourcePolicy({
            variables: {
              name: selectedUserResourcePolicy,
            },
            onCompleted(response) {
              if (!response.delete_user_resource_policy?.ok) {
                message.error(response.delete_user_resource_policy?.msg);
              } else {
                updateInternalFetchKey();
                message.success(t("storageHost.ResourcePolicySuccessfullyDeleted"));
              }
            },
            onError(error) {
              console.log(error);
              message.error(error.message);
            },
          });
        } else {
          message.error(t("storageHost.SelectProjectOrUserFirst"));
        }
      }
    });
  }

  const confirmUnsetResourcePolicy = () => {
    Modal.confirm({
      title: t('storageHost.UnsetResourcePolicy'),
      content: t('storageHost.DoYouWantToUseDefaultValue'),
      icon: <ExclamationCircleOutlined />,
      okText: t('button.Confirm'),
      onOk() {
        if (currentSettingType === "project" && selectedProjectResourcePolicy) {
          commitModifyProjectResourcePolicy ({
            variables: {
              name: selectedProjectResourcePolicy,
              props: {
                max_vfolder_size: -1,
              },
            },
            onCompleted(response) {
              if (!response.modify_project_resource_policy?.ok) {
                message.error(response.modify_project_resource_policy?.msg);
              } else {
                updateInternalFetchKey();
                message.success(t("storageHost.ResourcePolicySuccessfullyUpdated"));
              }
            },
            onError(error) {
              message.error(error.message);
            }
          });
        } else if (currentSettingType === "user" && selectedUserResourcePolicy) {
          commitModifyUserResourcePolicy({
            variables: {
              name: selectedUserResourcePolicy,
              props: {
                max_vfolder_size: -1,
              },
            },
            onCompleted(response) {
              if (!response.modify_user_resource_policy?.ok) {
                message.error(response.modify_user_resource_policy?.msg);
              } else {
                updateInternalFetchKey();
                message.success(t("storageHost.ResourcePolicySuccessfullyUpdated"));
              }
            },
            onError(error) {
              message.error(error.message);
            }
          });
        } else {
          message.error(t("storageHost.SelectProjectOrUserFirst"));
        }
      }
    });
  };

  return (
    <>
      <Card
        extra={ quotaScopeId &&
          <Dropdown
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "edit",
                  label: t("button.Edit"),
                  icon: <EditFilled />,
                  onClick: () => {
                    currentSettingType === "project" ?
                      toggleProjectResourcePolicySettingModal()
                      :
                      toggleUserResourcePolicySettingModal();
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
                }
              ],
            }}
          >
            <EllipsisOutlined />
          </Dropdown>
        }
        title={t("storageHost.ResourcePolicy")}
        bordered={false}
        headStyle={{ borderBottom: "none" }}
        style={{ marginBottom: 10 }}
      >
        <Descriptions>
          {(currentSettingType === "project" && selectedProjectId) || (currentSettingType === "user" && selectedUserId) ? (
            <Descriptions.Item label={t("storageHost.MaxFolderSize")}>
              {currentSettingType === "project" ? (
                  project_resource_policy && project_resource_policy?.max_vfolder_size !== -1 ? _humanReadableDecimalSize(project_resource_policy?.max_vfolder_size) : t('storageHost.NoConfigs')
                ) : (
                  user_resource_policy && user_resource_policy?.max_vfolder_size !== -1 ? _humanReadableDecimalSize(user_resource_policy?.max_vfolder_size) : t('storageHost.NoConfigs')
              )}
            </Descriptions.Item>
          ) : (
            <Descriptions.Item>
              <Empty
                style={{ width: '100%' }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    {t("storageHost.quotaSettings.SelectFirst")}
                  </div>
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
        projectResourcePolicy={selectedProjectResourcePolicy || ""}
        resourcePolicyFrgmt={project_resource_policy || null}
        onRequestClose={() => {
          updateInternalFetchKey();
          toggleProjectResourcePolicySettingModal();
        }}
      />
      <UserResourcePolicySettingModal
        open={visibleUserResourcePolicySettingModal}
        destroyOnClose={true}
        onCancel={toggleUserResourcePolicySettingModal}
        onOk={toggleUserResourcePolicySettingModal}
        userResourcePolicy={selectedUserResourcePolicy || ""}
        resourcePolicyFrgmt={user_resource_policy || null}
        onRequestClose={() => {
          updateInternalFetchKey();
          toggleUserResourcePolicySettingModal();
        }}
      />
    </>
    );
};

export default ResourcePolicyCard;
