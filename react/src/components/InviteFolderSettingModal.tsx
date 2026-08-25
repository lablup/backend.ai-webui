/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx. The antd Form ENGINE stays (locked ticket-05
 decision); its controls become Astryx via the `astryxFormControls` adapters
 and `BAIFormItem` carries the visuals. The invite row's `Descriptions title`
 wrapper (used purely as a section heading) becomes a `Heading`; the invitee
 table is `BAITable` (Astryx engine since ticket 30-D) with Astryx cells.

 PILOT-DECISIONs:
 - antd `Input.onPressEnter` has no `TextInput` equivalent — Enter-to-invite
   is preserved through a keydown listener on the field wrapper.
 - `Select popupMatchSelectWidth={false}` has no destination (MAPPING §3.1);
   Astryx `Selector` sizes its own popup. Dropped.
*/
import { App } from '../app-shim';
// Ticket 34: `Form` is the self-hosted engine; `Form.Item` IS BAIFormItem.
import { Form, FormInstance } from '../form-engine';
import { localeCompare, useBaiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import BAIFormItem from './BAIFormItem';
import { AstryxFormSelector, AstryxFormTextInput } from './astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Selector } from '@astryxdesign/core/Selector';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Heading } from '@astryxdesign/core/Text';
import {
  BAIPopconfirm,
  BAIModal,
  type BAIModalProps,
  BAIQuestionIconWithTooltip,
  BAITable,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleXIcon } from 'lucide-react';
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

interface InviteFolderSettingModalProps extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: consumers outside this area use it. */
  open?: boolean;
  vfolderId: string | null;
  onRequestClose: () => void;
}

const InviteFolderSettingModal: React.FC<InviteFolderSettingModalProps> = ({
  vfolderId,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const inviteFormRef = useRef<FormInstance>(null);
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const { getErrorMessage } = useErrorMessageResolver();

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
        ? baiRequestWithPromise<{ shared: Array<Invitee> }>({
            method: 'GET',
            url: `/folders/_/shared${vfolderId ? `?${new URLSearchParams({ vfolder_id: vfolderId }).toString()}` : ''}`,
          }).then((res) => _.sortBy(res.shared, 'shared_to.email'))
        : [],
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
        const { email, permission } = values;
        inviteUser.mutate(
          {
            perm: permission,
            emails: [email.trim()],
            id: vfolderId ?? '',
          },
          {
            onSuccess: () => {
              message.success(t('data.invitation.Invited'));
              inviteFormRef.current?.resetFields();
              refetch();
            },
            onError: (err: any) => {
              if (err?.statusCode === 409) {
                message.error(
                  t('data.invitation.UserIsAlreadyInvited', {
                    email: email.trim(),
                  }),
                );
                return;
              }
              message.error(getErrorMessage(err));
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
          message.error(getErrorMessage(err));
        },
      },
    );
    refetch();
  };

  return (
    <BAIModal
      {...baiModalProps}
      isOpen={baiModalProps.open}
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
      title={t('data.explorer.ShareFolder')}
      maskClosable={false}
      footer={null}
      width={550}
    >
      <VStack gap={6} align="stretch">
        <VStack gap={4} align="stretch">
          <Heading level={5}>{t('data.folders.InviteUsers')}</Heading>
          <Form
            ref={inviteFormRef}
            initialValues={{ name: undefined, permission: 'ro' }}
          >
            <HStack align="start" justify="between" gap={2} width="100%">
              {/* TODO: support multi invitations */}
              <BAIFormItem
                name="email"
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
                {/* Enter-to-invite. This used to be a `<span onKeyDown>`
                    wrapped around the input — but `Form.Item` clones its
                    DIRECT child, so `value`/`onChange` landed on the span and
                    the field could not be typed into at all. The adapter's own
                    `onEnter` (antd's `onPressEnter`) does the same job with
                    the control back as the direct child. */}
                <AstryxFormTextInput
                  label={t('general.E-Mail')}
                  placeholder={t('data.explorer.EnterEmailAddress')}
                  maxLength={64}
                  onEnter={handleInvite}
                />
              </BAIFormItem>
              <BAIFormItem
                name="permission"
                label={t('data.Permission')}
                style={{ marginBottom: 0 }}
                required
              >
                <AstryxFormSelector
                  label={t('data.Permission')}
                  options={[
                    { label: t('data.ReadOnly'), value: 'ro' },
                    { label: t('data.ReadWrite'), value: 'rw' },
                  ]}
                />
              </BAIFormItem>
              <Button
                variant="primary"
                label={t('general.Add')}
                onClick={() => {
                  handleInvite();
                }}
              />
            </HStack>
          </Form>
        </VStack>

        <VStack align="stretch" gap={4}>
          <HStack gap={2}>
            <Heading level={5}>{t('data.folders.SharedUser')}</Heading>
            <BAIQuestionIconWithTooltip
              title={t('data.folders.SharedUserDesc')}
            />
          </HStack>

          <BAITable<Invitee>
            bordered
            pagination={false}
            loading={isFetching}
            dataSource={shared || []}
            rowKey={(record) => record.shared_to.uuid}
            columns={[
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
                    <HStack gap={1}>
                      <Selector
                        label={t('data.explorer.Permission')}
                        isLabelHidden
                        width={130}
                        options={[
                          { label: t('data.ReadOnly'), value: 'ro' },
                          { label: t('data.ReadWrite'), value: 'rw' },
                        ]}
                        value={perm}
                        onChange={(nextPerm) => {
                          handlePermission(record.shared_to.uuid, nextPerm);
                        }}
                      />
                      <BAIPopconfirm
                        title={t('data.folders.KickOutConfirm', {
                          email: record.shared_to.email,
                        })}
                        okText={t('button.Confirm')}
                        isDanger
                        onConfirm={() => {
                          handlePermission(record.shared_to.uuid);
                        }}
                      >
                        <IconButton
                          label={t('data.folders.KickOut')}
                          tooltip={t('data.folders.KickOut')}
                          variant="ghost"
                          size="sm"
                          className="bai-name-action-cell-danger"
                          icon={<CircleXIcon />}
                        />
                      </BAIPopconfirm>
                    </HStack>
                  );
                },
              },
            ]}
          />
        </VStack>
      </VStack>
    </BAIModal>
  );
};

export default InviteFolderSettingModal;
