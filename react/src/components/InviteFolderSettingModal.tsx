import { localeCompare, useBaiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import { usePainKiller } from '../hooks/usePainKiller';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Descriptions,
  Form,
  FormInstance,
  Input,
  Popconfirm,
  Select,
  Table,
  Tooltip,
  theme,
} from 'antd';
import _ from 'lodash';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Invitee {
  perm: string;
  shared_to: {
    uuid: string;
    email: string;
  };
  vfolder_id: string;
}

interface InviteFolderSettingModalProps extends BAIModalProps {
  vfolderId: string | null;
  onRequestClose: () => void;
}

const InviteFolderSettingModal: React.FC<InviteFolderSettingModalProps> = ({
  vfolderId,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const inviteFormRef = useRef<FormInstance>(null);
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const painKiller = usePainKiller();
  const { token } = theme.useToken();

  const {
    data: shared,
    isFetching,
    refetch,
  } = useTanQuery<Array<Invitee>>({
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
          }).then((res: { shared: Array<Invitee> }) =>
            _.sortBy(res.shared, 'shared_to.email'),
          )
        : null,
    staleTime: 0,
  });

  const modifyPermission = useTanMutation({
    mutationFn: ({
      perm,
      user,
      vfolder,
    }: {
      perm: string | null;
      user: string;
      vfolder: string;
    }) => {
      const input = { perm, user, vfolder };
      return baiClient.vfolder.modify_invitee_permission(input);
    },
  });

  const inviteUser = useTanMutation({
    mutationFn: ({
      perm,
      emails,
      id,
    }: {
      perm: string;
      emails: string[];
      id: string;
    }) => {
      return baiClient.vfolder.invite(perm, emails, id);
    },
  });

  const handleInvite = () => {
    inviteFormRef.current
      ?.validateFields()
      .then((values) => {
        const { emails, permission } = values;
        inviteUser.mutate(
          {
            perm: permission,
            emails: emails.split(',').map((email: string) => email.trim()),
            id: vfolderId ?? '',
          },
          {
            onSuccess: () => {
              message.success(t('data.invitation.Invited'));
              inviteFormRef.current?.resetFields();
              refetch();
            },
            onError: (err) => {
              message.error(
                painKiller.relieve(err?.message) ||
                  t('data.invitation.FolderSharingNotAvailableToUser'),
              );
            },
          },
        );
      })
      .catch(() => {});
  };

  const handlePermission = (user: string, perm?: string) => {
    modifyPermission.mutate(
      {
        perm: perm ?? null,
        user: user,
        vfolder: vfolderId ?? '',
      },
      {
        onSuccess: () => {
          message.success(t('data.permission.PermissionModified'));
          refetch();
        },
        onError: (err) => {
          message.error(
            painKiller.relieve(err?.message) ||
              t('data.permission.FailedToModifyPermission'),
          );
        },
      },
    );
    refetch();
  };

  return (
    <BAIModal
      {...baiModalProps}
      title={t('data.explorer.ModifyPermissions')}
      onCancel={onRequestClose}
      style={{ minWidth: 550 }}
      destroyOnClose
      footer={null}
    >
      <Flex direction="column" gap="xl">
        <Form
          ref={inviteFormRef}
          initialValues={{ name: undefined, permission: 'ro' }}
          requiredMark={false}
        >
          <Descriptions title={t('data.folders.InviteUsers')}>
            <Descriptions.Item>
              <Flex align="start" justify="between" style={{ width: '100%' }}>
                {/* TODO: support multi invitations */}
                <Form.Item
                  name="emails"
                  label={t('general.E-Mail')}
                  rules={[
                    {
                      type: 'email',
                      message: t('data.InvalidEmail'),
                    },
                    {
                      type: 'string',
                      max: 64,
                      message: t('maxLength.64chars'),
                    },
                    {
                      required: true,
                      message: t('webui.menu.InvalidBlankEmail'),
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder={t('data.explorer.EnterEmailAddress')} />
                </Form.Item>
                <Form.Item
                  name="permission"
                  label={t('data.Permission')}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    options={[
                      { label: t('data.ReadOnly'), value: 'ro' },
                      { label: t('data.ReadWrite'), value: 'rw' },
                    ]}
                    popupMatchSelectWidth={false}
                  />
                </Form.Item>
                <Button
                  type="primary"
                  onClick={() => {
                    handleInvite();
                  }}
                >
                  {t('general.Add')}
                </Button>
              </Flex>
            </Descriptions.Item>
          </Descriptions>
        </Form>
        <Descriptions
          title={
            <Flex gap={'xs'}>
              {t('data.folders.SharedUser')}
              <Tooltip title={t('data.folders.SharedUserDesc')}>
                <QuestionCircleOutlined
                  style={{ color: token.colorTextSecondary }}
                />
              </Tooltip>
            </Flex>
          }
        >
          <Descriptions.Item>
            <Table
              bordered
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
                  render: (perm, record) => {
                    return (
                      <Flex gap="xxs">
                        <Select
                          style={{ minWidth: 130 }}
                          options={[
                            { label: t('data.folders.View'), value: 'ro' },
                            { label: t('data.folders.Edit'), value: 'rw' },
                          ]}
                          defaultValue={perm}
                          onChange={(nextPerm) => {
                            handlePermission(record.shared_to.uuid, nextPerm);
                          }}
                        />
                        <Popconfirm
                          title={t('data.folders.KickOutConfirm', {
                            email: record.shared_to.email,
                          })}
                          okText={t('button.Confirm')}
                          okButtonProps={{
                            danger: true,
                          }}
                          onConfirm={() => {
                            handlePermission(record.shared_to.uuid);
                          }}
                        >
                          <Tooltip
                            title={t('data.folders.KickOut')}
                            placement="right"
                            trigger={['hover', 'click']}
                          >
                            <Button
                              type="text"
                              style={{
                                color: token.colorError,
                              }}
                              icon={<CloseCircleOutlined />}
                            />
                          </Tooltip>
                        </Popconfirm>
                      </Flex>
                    );
                  },
                },
              ]}
              style={{ width: '100%' }}
            />
          </Descriptions.Item>
        </Descriptions>
      </Flex>
    </BAIModal>
  );
};

export default InviteFolderSettingModal;
