import { humanReadableDecimalSize } from '../helper/index';
import Flex from './Flex';
import ProjectResourcePolicySettingModal from './ProjectResourcePolicySettingModal';
import UserResourcePolicySettingModal from './UserResourcePolicySettingModal';
import { ResourcePolicyCardModifyProjectMutation } from './__generated__/ResourcePolicyCardModifyProjectMutation.graphql';
import { ResourcePolicyCardModifyUserMutation } from './__generated__/ResourcePolicyCardModifyUserMutation.graphql';
import { ResourcePolicyCard_project_resource_policy$key } from './__generated__/ResourcePolicyCard_project_resource_policy.graphql';
import { ResourcePolicyCard_user_resource_policy$key } from './__generated__/ResourcePolicyCard_user_resource_policy.graphql';
import {
  EditFilled,
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Button,
  Card,
  CardProps,
  Descriptions,
  Modal,
  message,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

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
  const { token } = theme.useToken();

  const [modal, contextHolder] = Modal.useModal();

  const [
    visibleProjectResourcePolicySettingModal,
    { toggle: toggleProjectResourcePolicySettingModal },
  ] = useToggle(false);
  const [
    visibleUserResourcePolicySettingModal,
    { toggle: toggleUserResourcePolicySettingModal },
  ] = useToggle(false);

  const project_resource_policy = useFragment(
    graphql`
      fragment ResourcePolicyCard_project_resource_policy on ProjectResourcePolicy {
        id
        name
        max_quota_scope_size
        ...ProjectResourcePolicySettingModalFragment
      }
    `,
    projectResourcePolicyFrgmt,
  );
  const user_resource_policy = useFragment(
    graphql`
      fragment ResourcePolicyCard_user_resource_policy on UserResourcePolicy {
        id
        name
        max_quota_scope_size
        ...UserResourcePolicySettingModalFragment
      }
    `,
    userResourcePolicyFrgmt,
  );

  const [
    commitModifyProjectResourcePolicy,
    // isInFlightCommitModifyProjectResourcePolicy,
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
    // isInFlightCommitModifyUserResourcePolicy,
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

  const confirmUnsetResourcePolicy = () => {
    modal.confirm({
      title: t('storageHost.UnsetResourcePolicy'),
      content: t('storageHost.DoYouWantToUseDefaultValue'),
      icon: <ExclamationCircleOutlined />,
      okText: t('button.Confirm'),
      onOk() {
        if (project_resource_policy) {
          commitModifyProjectResourcePolicy({
            variables: {
              name: project_resource_policy.name,
              props: {
                // max_vfolder_count: 0,
                max_quota_scope_size: -1,
              },
            },
            onCompleted(response) {
              if (!response?.modify_project_resource_policy?.ok) {
                message.error(response?.modify_project_resource_policy?.msg);
              } else {
                onChangePolicy();
                message.success(
                  t('storageHost.ResourcePolicySuccessfullyUpdated'),
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
                // max_vfolder_count: 0,
                max_quota_scope_size: -1,
              },
            },
            onCompleted(response) {
              if (!response?.modify_user_resource_policy?.ok) {
                message.error(response?.modify_user_resource_policy?.msg);
              } else {
                onChangePolicy();
                message.success(
                  t('storageHost.ResourcePolicySuccessfullyUpdated'),
                );
              }
            },
            onError(error) {
              message.error(error?.message);
            },
          });
        } else {
          message.error(t('storageHost.SelectProjectOrUserFirst'));
        }
      },
    });
  };

  return (
    <>
      <Card
        extra={
          project_resource_policy || user_resource_policy ? (
            <Flex gap={token.marginXS}>
              <Button
                icon={<EditFilled />}
                type="text"
                onClick={() => {
                  project_resource_policy
                    ? toggleProjectResourcePolicySettingModal()
                    : toggleUserResourcePolicySettingModal();
                }}
              >
                {t('button.Edit')}
              </Button>
              <Button
                type="text"
                icon={<CloseOutlined />}
                danger
                onClick={() => confirmUnsetResourcePolicy()}
              >
                {t('button.Unset')}
              </Button>
            </Flex>
          ) : null
        }
        title={t('storageHost.ResourcePolicy')}
        // bordered={false}
        headStyle={{ borderBottom: 'none' }}
        style={{ marginBottom: 10 }}
      >
        {project_resource_policy || user_resource_policy ? (
          <Descriptions size="small">
            <Descriptions.Item label={t('storageHost.MaxFolderSize')}>
              {project_resource_policy
                ? project_resource_policy &&
                  project_resource_policy?.max_quota_scope_size !== -1
                  ? humanReadableDecimalSize(
                      project_resource_policy?.max_quota_scope_size,
                    )
                  : '-'
                : user_resource_policy &&
                  user_resource_policy?.max_quota_scope_size !== -1
                ? humanReadableDecimalSize(
                    user_resource_policy?.max_quota_scope_size,
                  )
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
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
      {contextHolder}
    </>
  );
};

export default ResourcePolicyCard;
