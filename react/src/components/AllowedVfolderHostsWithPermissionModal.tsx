import Flex from './Flex';
import { AllowedVfolderHostsWithPermissionModalQuery } from './__generated__/AllowedVfolderHostsWithPermissionModalQuery.graphql';
import { CheckCircleFilled, StopFilled } from '@ant-design/icons';
import { Modal, ModalProps, Table, Tag, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface AllowedVfolderHostsWithPermissionModalProps extends ModalProps {
  allowedVfolderHosts: {
    [key: string]: Array<string>;
  };
}

const AllowedVfolderHostsWithPermissionModal: React.FC<
  AllowedVfolderHostsWithPermissionModalProps
> = ({ allowedVfolderHosts }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [storageHost, setStorageHost] = React.useState<string | null>();

  const { vfolder_host_permissions } =
    useLazyLoadQuery<AllowedVfolderHostsWithPermissionModalQuery>(
      graphql`
        query AllowedVfolderHostsWithPermissionModalQuery {
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
      return;
    }
  };

  return (
    <>
      {_.map(_.keys(allowedVfolderHosts), (storageHost) => (
        <Tag
          key={storageHost}
          color={getColor(storageHost)}
          onClick={() => {
            setStorageHost(storageHost);
          }}
          style={{ cursor: 'pointer' }}
        >
          {storageHost}
        </Tag>
      ))}
      <Modal
        title={`${storageHost} ${t('data.explorer.Permission')}`}
        open={!_.isEmpty(storageHost)}
        onCancel={() => setStorageHost(null)}
        footer={null}
      >
        <Table
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
                <Flex justify="center">
                  <CheckCircleFilled
                    style={{
                      color: token.colorSuccess,
                      fontSize: token.fontSizeLG,
                    }}
                  />
                </Flex>
              ) : (
                <Flex justify="center">
                  <StopFilled
                    style={{
                      color: token.colorError,
                      fontSize: token.fontSizeLG,
                    }}
                  />
                </Flex>
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
      </Modal>
    </>
  );
};

export default AllowedVfolderHostsWithPermissionModal;
