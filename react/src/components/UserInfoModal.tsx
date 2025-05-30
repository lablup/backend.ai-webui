import { UserInfoModalQuery } from '../__generated__/UserInfoModalQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTOTPSupported } from '../hooks/backendai';
import BAIModal, { BAIModalProps } from './BAIModal';
import { Descriptions, DescriptionsProps, Tag, Spin } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface Props extends BAIModalProps {
  userEmail: string;
  onRequestClose: () => void;
}

const UserInfoModal: React.FC<Props> = ({
  userEmail,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const sudoSessionEnabledSupported = baiClient?.supports(
    'sudo-session-enabled',
  );

  const { isTOTPSupported, isLoading: isLoadingManagerSupportingTOTP } =
    useTOTPSupported();

  const { user } = useLazyLoadQuery<UserInfoModalQuery>(
    graphql`
      query UserInfoModalQuery(
        $email: String
        $isNotSupportSudoSessionEnabled: Boolean!
        $isTOTPSupported: Boolean!
      ) {
        user(email: $email) {
          email
          username
          need_password_change
          full_name
          description
          status
          domain_name
          role
          groups {
            id
            name
          }
          resource_policy
          # TODO: reflect https://github.com/lablup/backend.ai-webui/pull/1999
          # support from 23.09.0b1
          # https://github.com/lablup/backend.ai/pull/1530
          sudo_session_enabled
            @skipOnClient(if: $isNotSupportSudoSessionEnabled)
          totp_activated @include(if: $isTOTPSupported)
          main_access_key @since(version: "23.09.7")
        }
      }
    `,
    {
      email: userEmail,
      isNotSupportSudoSessionEnabled: !sudoSessionEnabledSupported,
      isTOTPSupported: isTOTPSupported ?? false,
    },
  );

  const columnSetting: DescriptionsProps['column'] = {
    xxl: 1,
    xl: 1,
    lg: 1,
    md: 1,
    sm: 1,
    xs: 1,
  };

  return (
    <BAIModal
      centered
      title={t('credential.UserDetail')}
      footer={null}
      onCancel={onRequestClose}
      {...baiModalProps}
    >
      <Descriptions
        size="small"
        column={columnSetting}
        title={t('credential.Information')}
        labelStyle={{ width: '50%' }}
      >
        <Descriptions.Item label={t('credential.UserID')}>
          {user?.email}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.Description')}>
          {user?.description}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.UserName')}>
          {user?.username}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.FullName')}>
          {user?.full_name}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.MainAccessKey')}>
          {user?.main_access_key}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.DescActiveUser')}>
          {user?.status === 'active' ? t('button.Yes') : t('button.No')}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.DescRequirePasswordChange')}>
          {user?.need_password_change ? t('button.Yes') : t('button.No')}
        </Descriptions.Item>
        {sudoSessionEnabledSupported && (
          <Descriptions.Item label={t('credential.EnableSudoSession')}>
            {user?.sudo_session_enabled ? t('button.Yes') : t('button.No')}
          </Descriptions.Item>
        )}
        {isTOTPSupported && (
          <Descriptions.Item label={t('webui.menu.TotpActivated')}>
            <Spin spinning={isLoadingManagerSupportingTOTP}>
              {user?.totp_activated ? t('button.Yes') : t('button.No')}
            </Spin>
          </Descriptions.Item>
        )}
      </Descriptions>
      <br />
      <Descriptions
        size="small"
        column={columnSetting}
        title={t('credential.Association')}
        labelStyle={{ width: '50%' }}
      >
        <Descriptions.Item label={t('credential.Role')}>
          {user?.role}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.Domain')}>
          {user?.domain_name}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.ResourcePolicy')}>
          {user?.resource_policy}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <Descriptions
        title={t('credential.ProjectAndGroup')}
        labelStyle={{ width: '50%' }}
      >
        <Descriptions.Item>
          {_.map(user?.groups, (group) => {
            return <Tag key={group?.id}>{group?.name}</Tag>;
          })}
        </Descriptions.Item>
      </Descriptions>
    </BAIModal>
  );
};

export default UserInfoModal;
