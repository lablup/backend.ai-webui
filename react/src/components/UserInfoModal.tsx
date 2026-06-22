/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserInfoModalFragment$key } from '../__generated__/UserInfoModalFragment.graphql';
import { useTOTPSupported } from '../hooks/backendai';
import { WarningOutlined } from '@ant-design/icons';
import {
  Descriptions,
  type DescriptionsProps,
  Tag,
  Spin,
  Tooltip,
  theme,
} from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface Props extends BAIModalProps {
  userInfoFrgmt: UserInfoModalFragment$key | null | undefined;
  onRequestClose: () => void;
}

const UserInfoModal: React.FC<Props> = ({
  userInfoFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { isTOTPSupported, isLoading: isLoadingManagerSupportingTOTP } =
    useTOTPSupported();

  const user = useFragment(
    graphql`
      fragment UserInfoModalFragment on UserV2 {
        basicInfo {
          email
          username
          fullName
          description
        }
        status {
          status
          needPasswordChange
        }
        security {
          totpActivated @skipOnClient(if: $isNotSupportTotp)
          sudoSessionEnabled
        }
        organization {
          domainName
          role
          resourcePolicy
          mainAccessKey
        }
        projects {
          edges {
            node {
              id
              basicInfo {
                name
              }
            }
          }
        }
      }
    `,
    userInfoFrgmt ?? null,
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
          {user?.basicInfo.email}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.Description')}>
          {user?.basicInfo.description}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.UserName')}>
          {user?.basicInfo.username}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.FullName')}>
          {user?.basicInfo.fullName}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.MainAccessKey')}>
          {user?.organization.mainAccessKey}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.DescActiveUser')}>
          {user?.status.status === 'ACTIVE' ? t('button.Yes') : t('button.No')}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.DescRequirePasswordChange')}>
          {user?.status.needPasswordChange ? t('button.Yes') : t('button.No')}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.EnableSudoSession')}>
          {user?.security.sudoSessionEnabled ? t('button.Yes') : t('button.No')}
        </Descriptions.Item>
        {isTOTPSupported && (
          <Descriptions.Item label={t('webui.menu.TotpActivated')}>
            <Spin spinning={isLoadingManagerSupportingTOTP}>
              {user?.security.totpActivated ? t('button.Yes') : t('button.No')}
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
          {user?.organization.role}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.Domain')}>
          {user?.organization.domainName}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.ResourcePolicy')}>
          {user?.organization.resourcePolicy}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <Descriptions
        title={t('credential.ProjectAndGroup')}
        labelStyle={{ width: '50%' }}
      >
        <Descriptions.Item>
          {user && !user.projects ? (
            <Tooltip title={t('credential.FailedToLoadProjects')}>
              <WarningOutlined style={{ color: token.colorError }} />
            </Tooltip>
          ) : (
            <BAIFlex gap="xs" wrap="wrap">
              {_.map(user?.projects?.edges, (edge) => {
                return (
                  <Tag key={edge?.node?.id}>{edge?.node?.basicInfo.name}</Tag>
                );
              })}
            </BAIFlex>
          )}
        </Descriptions.Item>
      </Descriptions>
    </BAIModal>
  );
};

export default UserInfoModal;
