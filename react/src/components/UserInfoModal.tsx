/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserInfoModalFragment$key } from '../__generated__/UserInfoModalFragment.graphql';
import { useTOTPSupported } from '../hooks/backendai';
import { theme } from '../theme-shim';
import { Badge } from '@astryxdesign/core/Badge';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Spinner } from '@astryxdesign/core/Spinner';
import {
  BAIFlex,
  BAIIconWithTooltip,
  BAIModal,
  BAIModalProps,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { TriangleAlert } from 'lucide-react';
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
          totpActivated
            @skipOnClient(if: $isNotSupportTotp)
            @skip(if: $isNotSupportTotp)
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

  // PILOT-DECISION: antd Descriptions `size="small"`, the responsive
  // `column` breakpoint map (all forced to 1), and `labelStyle` have no
  // MetadataList destination — MetadataList's single-column defaults already
  // match (defaults-first / simplicity policy); `label={{ width: '50%' }}`
  // reproduces the label column width.
  return (
    <BAIModal
      centered
      title={t('credential.UserDetail')}
      footer={null}
      onCancel={onRequestClose}
      {...baiModalProps}
    >
      <MetadataList
        title={t('credential.Information')}
        label={{ position: 'start', width: '50%' }}
      >
        <MetadataListItem label={t('credential.UserID')}>
          {user?.basicInfo.email}
        </MetadataListItem>
        <MetadataListItem label={t('credential.Description')}>
          {user?.basicInfo.description}
        </MetadataListItem>
        <MetadataListItem label={t('credential.UserName')}>
          {user?.basicInfo.username}
        </MetadataListItem>
        <MetadataListItem label={t('credential.FullName')}>
          {user?.basicInfo.fullName}
        </MetadataListItem>
        <MetadataListItem label={t('credential.MainAccessKey')}>
          {user?.organization.mainAccessKey}
        </MetadataListItem>
        <MetadataListItem label={t('credential.DescActiveUser')}>
          {user?.status.status === 'ACTIVE' ? t('button.Yes') : t('button.No')}
        </MetadataListItem>
        <MetadataListItem label={t('credential.DescRequirePasswordChange')}>
          {user?.status.needPasswordChange ? t('button.Yes') : t('button.No')}
        </MetadataListItem>
        <MetadataListItem label={t('credential.EnableSudoSession')}>
          {user?.security.sudoSessionEnabled ? t('button.Yes') : t('button.No')}
        </MetadataListItem>
        {isTOTPSupported && (
          <MetadataListItem label={t('webui.menu.TotpActivated')}>
            {/* PILOT-DECISION: antd `Spin spinning` overlays a dimmed
                spinner on top of existing content; Astryx `Spinner` has no
                wrap/overlay mode, so the loading state replaces the value
                outright instead of dimming it. */}
            {isLoadingManagerSupportingTOTP ? (
              <Spinner size="sm" />
            ) : user?.security.totpActivated ? (
              t('button.Yes')
            ) : (
              t('button.No')
            )}
          </MetadataListItem>
        )}
      </MetadataList>
      <MetadataList
        title={t('credential.Association')}
        label={{ position: 'start', width: '50%' }}
      >
        <MetadataListItem label={t('credential.Role')}>
          {user?.organization.role}
        </MetadataListItem>
        <MetadataListItem label={t('credential.Domain')}>
          {user?.organization.domainName}
        </MetadataListItem>
        <MetadataListItem label={t('credential.ResourcePolicy')}>
          {user?.organization.resourcePolicy}
        </MetadataListItem>
      </MetadataList>
      <MetadataList label={{ position: 'start', width: '50%' }}>
        <MetadataListItem label={t('credential.ProjectAndGroup')}>
          {user && !user.projects ? (
            <BAIIconWithTooltip
              content={t('credential.FailedToLoadProjects')}
              icon={
                <TriangleAlert style={{ color: token.colorError }} size="1em" />
              }
            />
          ) : (
            <BAIFlex gap="xs" wrap="wrap">
              {_.map(user?.projects?.edges, (edge) => {
                return (
                  <Badge
                    key={edge?.node?.id}
                    variant="neutral"
                    label={edge?.node?.basicInfo.name}
                  />
                );
              })}
            </BAIFlex>
          )}
        </MetadataListItem>
      </MetadataList>
    </BAIModal>
  );
};

export default UserInfoModal;
