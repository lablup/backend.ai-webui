import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal from './BAIModal';
import { passwordPattern } from './ResetPasswordRequired';
import TOTPActivateModal from './TOTPActivateModal';
// @ts-ignore
import customCSS from './UserProfileSettingModal.css?raw';
import { UserProfileSettingModalQuery } from './__generated__/UserProfileSettingModalQuery.graphql';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Modal, ModalProps, Input, Form, Select, message, Switch } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface Props extends ModalProps {
  onRequestClose: (success?: boolean) => void;
}

type UserProfileFormValues = {
  full_name: string;
  originalPassword?: string;
  newPasswordConfirm?: string;
  newPassword?: string;
  access_key?: string;
  secret_key?: string;
  totp_activated: boolean;
};

const UserProfileSettingModal: React.FC<Props> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<UserProfileFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [isOpenTOTPActivateModal, { toggle: toggleTOTPActivateModal }] =
    useToggle(false);
  const baiClient = useSuspendedBackendaiClient();

  const { data: isManagerSupportingTOTP } = useTanQuery(
    'isManagerSupportingTOTP',
    () => {
      return baiClient.isManagerSupportingTOTP();
    },
    {
      suspense: true,
    },
  );
  const totpSupported = baiClient.supports('2FA') && isManagerSupportingTOTP;

  const [userInfo, userMutations] = useCurrentUserInfo();
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const deferredMergedFetchKey = useDeferredValue(fetchKey);

  const { user } = useLazyLoadQuery<UserProfileSettingModalQuery>(
    graphql`
      query UserProfileSettingModalQuery(
        $email: String!
        $isNotSupportTotp: Boolean!
      ) {
        user(email: $email) {
          id
          totp_activated @skipOnClient(if: $isNotSupportTotp)
          ...TOTPActivateModalFragment
        }
      }
    `,
    {
      email: userInfo.email,
      isNotSupportTotp: !totpSupported,
    },
    {
      fetchPolicy: 'network-only',
      fetchKey: deferredMergedFetchKey,
    },
  );

  const { data: keyPairs } = useTanQuery<
    {
      secret_key: string;
      access_key: string;
    }[]
  >(
    'baiClient.keypair.list',
    () => {
      return baiClient.keypair
        .list(userInfo.email, ['access_key', 'secret_key'], true)
        .then((res: any) => res.keypairs);
    },
    {
      suspense: true,
    },
  );

  const mutationToRemoveTotp = useTanMutation({
    mutationFn: () => {
      return baiClient.remove_totp();
    },
  });

  const onSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        userMutations.updateFullName(values.full_name, {
          onSuccess: (newFullName) => {
            if (newFullName !== userInfo.full_name) {
              messageApi.open({
                type: 'success',
                content: t('webui.menu.FullnameUpdated'),
              });
            }

            if (
              values.newPassword &&
              values.newPasswordConfirm &&
              values.originalPassword
            ) {
              userMutations.updatePassword(
                {
                  new_password: values.newPassword,
                  new_password2: values.newPasswordConfirm,
                  old_password: values.originalPassword,
                },
                {
                  onSuccess: () => {
                    messageApi.open({
                      type: 'success',
                      content: t('webui.menu.PasswordUpdated'),
                    });
                    onRequestClose(true);
                  },
                  onError: (e) => {
                    messageApi.open({
                      type: 'error',
                      content: e.message,
                    });
                  },
                },
              );
            } else {
              onRequestClose(true);
            }
          },
          onError: (e) => {
            messageApi.open({
              type: 'error',
              content: e.message,
            });
          },
        });
      })
      .catch((e) => {
        console.log(e);
        messageApi.open({
          type: 'error',
          content: e.errorFields[0].errors,
        });
      });
  };

  return (
    <>
      <style>{customCSS}</style>
      <BAIModal
        {...baiModalProps}
        okText={t('webui.menu.Update')}
        cancelText={t('webui.menu.Cancel')}
        onCancel={() => {
          onRequestClose();
        }}
        confirmLoading={userInfo.isPendingMutation}
        onOk={() => onSubmit()}
        centered
        destroyOnClose
        title={t('webui.menu.MyAccountInformation')}
      >
        <Form
          layout="horizontal"
          labelCol={{ span: 8 }}
          form={form}
          initialValues={{
            full_name: userInfo.full_name,
            totp_activated: user?.totp_activated || false,
            access_key: keyPairs?.[0].access_key,
          }}
          preserve={false}
        >
          <Form.Item
            name="full_name"
            label={t('webui.menu.FullName')}
            rules={[
              () => ({
                validator(_, value) {
                  if (value && value.length < 65) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('webui.menu.FullNameInvalid')),
                  );
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="access_key" label={t('general.AccessKey')}>
            <Select
              options={_.map(keyPairs, (keyPair) => ({
                value: keyPair.access_key,
              }))}
              // onSelect={onSelectAccessKey}
            ></Select>
          </Form.Item>
          <Form.Item
            label={t('general.SecretKey')}
            shouldUpdate={(prev, next) => prev.access_key !== next.access_key}
          >
            {({ getFieldValue }) => (
              <Input.Password
                value={
                  _.find(keyPairs, ['access_key', getFieldValue('access_key')])
                    ?.secret_key
                }
                className="disabled_style_readonly"
                readOnly
              />
            )}
          </Form.Item>
          <Form.Item
            name="originalPassword"
            label={t('webui.menu.OriginalPassword')}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value &&
                    (getFieldValue('newPassword') ||
                      getFieldValue('newPasswordConfirm'))
                  ) {
                    return Promise.reject(
                      new Error(t('webui.menu.InputOriginalPassword')),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            dependencies={['newPassword', 'newPasswordConfirm']}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={t('webui.menu.NewPassword')}
            rules={[
              {
                pattern: passwordPattern,
                message: t('webui.menu.InvalidPasswordMessage'),
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPasswordConfirm"
            label={t('webui.menu.NewPasswordAgain')}
            dependencies={['newPassword']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('webui.menu.NewPasswordMismatch')),
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          {!!totpSupported && (
            <Form.Item
              name="totp_activated"
              label={t('webui.menu.TotpActivated')}
              valuePropName="checked"
            >
              <Switch
                onChange={(checked: boolean) => {
                  if (checked) {
                    toggleTOTPActivateModal();
                  } else {
                    if (user?.totp_activated) {
                      form.setFieldValue('totp_activated', true);
                      modal.confirm({
                        title: t('totp.TurnOffTotp'),
                        icon: <ExclamationCircleFilled />,
                        content: t('totp.ConfirmTotpRemovalBody'),
                        okText: t('button.Yes'),
                        okType: 'danger',
                        cancelText: t('button.No'),
                        onOk() {
                          mutationToRemoveTotp.mutate(undefined, {
                            onSuccess: () => {
                              message.success(
                                t('totp.RemoveTotpSetupCompleted'),
                              );
                              updateFetchKey();
                              form.setFieldValue('totp_activated', false);
                            },
                            onError: (error: any) => {
                              message.error(error.message);
                            },
                          });
                        },
                        onCancel() {
                          form.setFieldValue('totp_activated', true);
                        },
                      });
                    }
                  }
                }}
              />
            </Form.Item>
          )}
        </Form>
        {!!totpSupported && (
          <TOTPActivateModal
            userFrgmt={user}
            open={isOpenTOTPActivateModal}
            onRequestClose={(success) => {
              if (success) {
                updateFetchKey();
              } else {
                form.setFieldValue('totp_activated', false);
              }
              toggleTOTPActivateModal();
            }}
          />
        )}
      </BAIModal>
      {contextHolder}
      {modalContextHolder}
    </>
  );
};

export default UserProfileSettingModal;
