import { BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key } from '../../__generated__/BAIAllowedVfolderHostsWithPermissionFromGroupFragment.graphql';
import { BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key } from '../../__generated__/BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment.graphql';
import { BAIAllowedVfolderHostsWithPermissionQuery } from '../../__generated__/BAIAllowedVfolderHostsWithPermissionQuery.graphql';
import BAIFlex from '../BAIFlex';
import BAILink from '../BAILink';
import BAIModal from '../BAIModal';
import { BAITable } from '../Table';
import { CheckCircleFilled, StopFilled } from '@ant-design/icons';
import { Badge, theme } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

export type BAIAllowedVfolderHostsWithPermissionProps =
  | {
      allowedHostPermissionFrgmtFromKeyPair: BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key;
      allowedHostPermissionFrgmtFromGroup?: never;
    }
  | {
      allowedHostPermissionFrgmtFromKeyPair?: never;
      allowedHostPermissionFrgmtFromGroup: BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key;
    };

const BAIAllowedVfolderHostsWithPermission: React.FC<
  BAIAllowedVfolderHostsWithPermissionProps
> = ({
  allowedHostPermissionFrgmtFromKeyPair,
  allowedHostPermissionFrgmtFromGroup,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [storageHost, setStorageHost] = React.useState<string | null>();

  const keypairResourcePolicy =
    useFragment<BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key>(
      graphql`
        fragment BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment on KeyPairResourcePolicy {
          allowed_vfolder_hosts
        }
      `,
      allowedHostPermissionFrgmtFromKeyPair,
    );

  const groupNode =
    useFragment<BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key>(
      graphql`
        fragment BAIAllowedVfolderHostsWithPermissionFromGroupFragment on GroupNode {
          allowed_vfolder_hosts
        }
      `,
      allowedHostPermissionFrgmtFromGroup,
    );

  const allowedVfolderHosts = JSON.parse(
    keypairResourcePolicy?.allowed_vfolder_hosts ||
      groupNode?.allowed_vfolder_hosts ||
      '{}',
  );

  const { vfolder_host_permissions } =
    useLazyLoadQuery<BAIAllowedVfolderHostsWithPermissionQuery>(
      graphql`
        query BAIAllowedVfolderHostsWithPermissionQuery {
          vfolder_host_permissions {
            vfolder_host_permission_list
          }
        }
      `,
      {},
    );

  const getColor = (vfolderHost: string) => {
    if (
      _.isEqual(
        new Set(allowedVfolderHosts[vfolderHost]),
        new Set(vfolder_host_permissions?.vfolder_host_permission_list || null),
      )
    ) {
      return 'green';
    } else if (allowedVfolderHosts[vfolderHost]?.length > 0) {
      return 'gold';
    } else {
      return 'red';
    }
  };

  return (
    <>
      <BAIFlex gap="xs" wrap="wrap">
        {_.map(_.keys(allowedVfolderHosts), (storageHost) => (
          <BAILink
            key={storageHost}
            onClick={() => {
              setStorageHost(storageHost);
            }}
            type="hover"
          >
            <Badge color={getColor(storageHost)} />
            &nbsp;{storageHost}
          </BAILink>
        ))}
      </BAIFlex>
      <BAIModal
        centered
        title={`${storageHost} ${t('comp:AllowedVfolderHostsWithPermission.Permission')}`}
        open={!_.isEmpty(storageHost)}
        onCancel={() => setStorageHost(null)}
        footer={null}
      >
        <BAITable
          pagination={false}
          size="small"
          dataSource={_.map(
            vfolder_host_permissions?.vfolder_host_permission_list,
            (permission) => ({
              key: permission,
              permission,
              isAllowed: _.includes(
                _.get(allowedVfolderHosts, storageHost || ''),
                permission,
              ) ? (
                <BAIFlex justify="center">
                  <CheckCircleFilled
                    style={{
                      color: token.green5,
                      fontSize: token.fontSizeLG,
                    }}
                  />
                </BAIFlex>
              ) : (
                <BAIFlex justify="center">
                  <StopFilled
                    style={{
                      color: token.red5,
                      fontSize: token.fontSizeLG,
                    }}
                  />
                </BAIFlex>
              ),
            }),
          )}
          columns={[
            {
              title: t('comp:AllowedVfolderHostsWithPermission.Permission'),
              dataIndex: 'permission',
              key: 'permission',
            },
            {
              title: t('comp:AllowedVfolderHostsWithPermission.Allowed'),
              dataIndex: 'isAllowed',
              key: 'isAllowed',
            },
          ]}
        />
      </BAIModal>
    </>
  );
};

export default BAIAllowedVfolderHostsWithPermission;
