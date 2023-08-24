import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import { useQuery } from 'react-query';
import { useLazyLoadQuery } from 'react-relay';
import { UserInfoModalQuery } from './__generated__/UserInfoModalQuery.graphql';

import { Descriptions, DescriptionsProps, Button, Tag, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useWebComponentInfo } from './DefaultProviders';
import { useSuspendedBackendaiClient } from '../hooks';
import _ from 'lodash';
import BAIModal, { BAIModalProps } from './BAIModal';

interface Props extends BAIModalProps {}

const UserInfoModal: React.FC<Props> = ({ ...baiModalProps }) => {
  const { t } = useTranslation();

  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    open: boolean;
    userEmail: string;
  };
  try {
    parsedValue = JSON.parse(value || '');
  } catch (error) {
    parsedValue = {
      open: false,
      userEmail: '',
    };
  }
  const { open, userEmail } = parsedValue;

  const baiClient = useSuspendedBackendaiClient();
  let totpSupported = false;
  let {
    data: isManagerSupportingTOTP,
    isLoading: isLoadingManagerSupportingTOTP,
  } = useQuery(
    'isManagerSupportingTOTP',
    () => {
      return baiClient.isManagerSupportingTOTP();
    },
    {
      // for to render even this fail query failed
      suspense: false,
    },
  );
  totpSupported = baiClient?.supports('2FA') && isManagerSupportingTOTP;

  const { user } = useLazyLoadQuery<UserInfoModalQuery>(
    graphql`
      query UserInfoModalQuery($email: String, $isTOTPSupported: Boolean!) {
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
          totp_activated @include(if: $isTOTPSupported)
        }
      }
    `,
    {
      email: userEmail,
      isTOTPSupported: totpSupported ?? false,
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
      open={open}
      onCancel={() => {
        dispatchEvent('cancel', null);
      }}
      centered
      title={t('credential.UserDetail')}
      footer={[
        <Button
          key="ok"
          type="primary"
          onClick={() => {
            dispatchEvent('cancel', null);
          }}
        >
          {t('button.OK')}
        </Button>,
      ]}
      {...baiModalProps}
    >
      <br />
      <Descriptions
        size="small"
        column={columnSetting}
        title={t('credential.Information')}
        labelStyle={{ width: '50%' }}
      >
        <Descriptions.Item label={t('credential.UserID')}>
          {user?.email}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.UserName')}>
          {user?.username}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.FullName')}>
          {user?.full_name}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.DescActiveUser')}>
          {user?.status === 'active' ? t('button.Yes') : t('button.No')}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.DescRequirePasswordChange')}>
          {user?.need_password_change ? t('button.Yes') : t('button.No')}
        </Descriptions.Item>
        {totpSupported && (
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
        <Descriptions.Item label={t('credential.Domain')}>
          {user?.domain_name}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.Role')}>
          {user?.role}
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
