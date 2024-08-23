import {
  baiSignedRequestWithPromise,
  localeCompare,
  useBaiSignedRequestWithPromise,
} from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import { App, Empty, Form, FormInstance, Select, Table } from 'antd';
import _ from 'lodash';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Invitee {
  perm: string;
  shared_to: {
    uuid: string;
    email: string;
  };
  vfolder_id: string;
}

interface InviteFolderPermissionSettingModalProps extends BAIModalProps {
  vfolderId: string | null;
  onRequestClose: () => void;
}

const InviteFolderPermissionSettingModal: React.FC<
  InviteFolderPermissionSettingModalProps
> = ({ vfolderId, onRequestClose, ...baiModalProps }) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance>(null);
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();

  const {
    data: shared,
    isFetching,
    refetch,
  } = useTanQuery({
    queryKey: [
      'baiClient.vfolder.list_invitees',
      baiModalProps.open,
      vfolderId,
    ],
    queryFn: () =>
      baiModalProps.open
        ? baiRequestWithPromise({
            method: 'GET',
            url: `/folders/_/shared${vfolderId ? `?vfolder_id=${vfolderId}` : ''}`,
          }).then((res: { shared: Invitee }) =>
            _.sortBy(res.shared, 'shared_to.email'),
          )
        : null,
    staleTime: 0,
  });

  useEffect(() => {
    if (baiModalProps.open) {
      refetch();
      formRef.current?.setFieldsValue(
        _.fromPairs(
          _.map(shared, (item) => [`perm-${item.shared_to.uuid}`, item.perm]),
        ),
      );
    }
  }, [baiModalProps.open, refetch, shared]);

  const updatePermissions = useTanMutation({
    mutationFn: (
      userPermList: Array<{
        user: string;
        perm: string;
      }>,
    ) => {
      const body = {
        vfolder_id: vfolderId,
        user_perm_list: userPermList,
      };
      if (_.isEmpty(userPermList)) {
        return Promise.reject({ message: t('data.permission.NoChanges') });
      }
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/folders/_/sharing',
        body,
        client: baiClient,
      });
    },
  });

  const handleOk = () => {
    formRef.current?.validateFields().then((values) => {
      updatePermissions.mutate(
        _.map(
          _.filter(
            shared,
            (item) => values[`perm-${item.shared_to.uuid}`] !== item.perm,
          ),
          (item) => ({
            user: item.shared_to.uuid,
            perm: formRef.current?.getFieldValue(`perm-${item.shared_to.uuid}`),
          }),
        ),
        {
          onSuccess: () => {
            message.success(t('data.permission.PermissionModified'));
            onRequestClose();
          },
          onError: (err) => {
            message.error(
              err?.message || t('data.permission.FailedToModifyPermission'),
            );
          },
        },
      );
    });
  };

  return (
    <BAIModal
      {...baiModalProps}
      title={t('data.explorer.ModifyPermissions')}
      onCancel={onRequestClose}
      onOk={handleOk}
      confirmLoading={updatePermissions.isPending}
      okText={t('button.Save')}
    >
      {_.isEmpty(shared) ? (
        <Empty
          description={t('data.explorer.NoSharedFolders')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Form
          ref={formRef}
          initialValues={_.fromPairs(
            _.map(shared, (item) => [`perm-${item.shared_to.uuid}`, item.perm]),
          )}
        >
          <Table
            pagination={false}
            showSorterTooltip={false}
            loading={isFetching}
            sortDirections={['descend', 'ascend', 'descend']}
            dataSource={shared || []}
            scroll={{ x: 'max-content' }}
            rowKey={(record) => record.shared_to.uuid}
            columns={[
              {
                title: '#',
                fixed: 'left',
                render: (text, record, index) => {
                  ++index;
                  return index;
                },
                showSorterTooltip: false,
                rowScope: 'row',
              },
              {
                title: t('data.explorer.InviteeEmail'),
                dataIndex: ['shared_to', 'email'],
                sorter: (a, b) =>
                  localeCompare(a.shared_to.email, b.shared_to.email),
              },
              {
                title: t('data.explorer.Permission'),
                dataIndex: 'perm',
                render: (text, record) => {
                  return (
                    <Form.Item name={`perm-${record.shared_to.uuid}`} noStyle>
                      <Select
                        style={{ minWidth: 130 }}
                        options={[
                          { label: t('data.folders.View'), value: 'ro' },
                          { label: t('data.folders.Edit'), value: 'rw' },
                          { label: t('data.folders.EditDelete'), value: 'wd' },
                          {
                            label: t('data.folders.KickOut'),
                            value: null,
                          },
                        ]}
                      />
                    </Form.Item>
                  );
                },
              },
            ]}
          />
        </Form>
      )}
    </BAIModal>
  );
};

export default InviteFolderPermissionSettingModal;
