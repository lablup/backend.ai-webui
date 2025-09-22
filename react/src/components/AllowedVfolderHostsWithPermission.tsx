import { AllowedVfolderHostsWithPermissionFragment$key } from '../__generated__/AllowedVfolderHostsWithPermissionFragment.graphql';
import { AllowedVfolderHostsWithPermissionQuery } from '../__generated__/AllowedVfolderHostsWithPermissionQuery.graphql';
import BAIModal from './BAIModal';
import { CheckCircleFilled, StopFilled } from '@ant-design/icons';
import { Badge, theme } from 'antd';
import { BAITable, BAIFlex, BAILink } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface AllowedVfolderHostsWithPermissionProps {
  allowedVfolderHostsWithPermissionFrgmt: AllowedVfolderHostsWithPermissionFragment$key;
}

const AllowedVfolderHostsWithPermission: React.FC<
  AllowedVfolderHostsWithPermissionProps
> = ({ allowedVfolderHostsWithPermissionFrgmt }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [storageHost, setStorageHost] = React.useState<string | null>();

  const keypairResourcePolicy = useFragment(
    graphql`
      fragment AllowedVfolderHostsWithPermissionFragment on KeyPairResourcePolicy {
        allowed_vfolder_hosts
      }
    `,
    allowedVfolderHostsWithPermissionFrgmt,
  );

  const allowedVfolderHosts = JSON.parse(
    keypairResourcePolicy?.allowed_vfolder_hosts || '{}',
  );

  const { vfolder_host_permissions } =
    useLazyLoadQuery<AllowedVfolderHostsWithPermissionQuery>(
      graphql`
        query AllowedVfolderHostsWithPermissionQuery {
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
        title={`${storageHost} ${t('data.explorer.Permission')}`}
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
              title: t('data.explorer.Permission'),
              dataIndex: 'permission',
              key: 'permission',
            },
            {
              title: t('data.explorer.Allowed'),
              dataIndex: 'isAllowed',
              key: 'isAllowed',
            },
          ]}
        />
      </BAIModal>
    </>
  );
};

export default AllowedVfolderHostsWithPermission;
