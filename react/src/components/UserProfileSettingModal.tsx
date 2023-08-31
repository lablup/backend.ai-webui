import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import { passwordPattern } from './ResetPasswordRequired';
import TOTPActivateModal from './TOTPActivateModal';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Modal,
  ModalProps,
  Input,
  Form,
  Select,
  SelectProps,
  message,
  Switch,
} from 'antd';
import _ from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
};

const UserProfileSettingModal: React.FC<Props> = ({
  onRequestClose,
  ...ModalProps
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
      suspense: false,
    },
  );
  const totpSupported = baiClient.supports('2FA') && isManagerSupportingTOTP;

  const [userInfo, userMutations] = useCurrentUserInfo();

  const { data: userTotpActivated } = useTanQuery(
    'totpActivated',
    () => {
      return baiClient.user.get(userInfo.email, ['totp_activated']);
    },
    {
      suspense: false,
    },
  );
  const [totpActivated, setTotpActivated] = useState(
    userTotpActivated?.user.totp_activated,
  );

  const { data: keyPairInfo } = useTanQuery(
    'keyPairInfo',
    () => {
      return baiClient.keypair.list(
        userInfo.email,
        ['access_key', 'secret_key'],
        true,
      );
    },
    {
      suspense: false,
    },
  );
  const selectOptions: SelectProps['options'] = [];
  if (keyPairInfo) {
    for (let i = 0; i < keyPairInfo.keypairs.length; i++) {
      selectOptions.push({
        value: keyPairInfo.keypairs[i].secret_key,
        label: keyPairInfo.keypairs[i].access_key,
      });
    }
    const matchLoggedAccount = _.find(keyPairInfo.keypairs, [
      'access_key',
      baiClient._config.accessKey,
    ]);
    form.setFieldsValue({
      access_key: matchLoggedAccount?.access_key,
      secret_key: matchLoggedAccount?.secret_key,
    });
  }

  const mutationToRemoveTotp = useTanMutation({
    mutationFn: (email: string) => {
      return baiClient.remove_totp(email);
    },
  });

  const onSelectAccessKey = (value: string) => {
    const matchLoggedAccount = _.find(keyPairInfo.keypairs, [
      'secret_key',
      value,
    ]);
    form.setFieldsValue({
      secret_key: matchLoggedAccount.secret_key,
    });
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      userMutations.updateFullName(values.full_name, {
        onSuccess: (newFullName) => {
          messageApi.open({
            type: 'success',
            content: t('webui.menu.FullnameUpdated'),
          });

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
                  form.resetFields();
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
    });
  };

  return (
    <>
      <Modal
        okText={t('webui.menu.Update')}
        cancelText={t('webui.menu.Cancel')}
        onCancel={() => {
          form.resetFields(); //prevent browser password saving onCancel
          onRequestClose();
        }}
        confirmLoading={userInfo.isPendingMutation}
        onOk={() => onSubmit()}
        centered
        destroyOnClose
        title={t('webui.menu.MyAccountInformation')}
        {...ModalProps}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="full_name"
            label={t('webui.menu.FullName')}
            initialValue={baiClient.full_name}
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
          <Form.Item
            name="access_key"
            label={t('general.AccessKey')}
            rules={[{ required: true }]}
          >
            <Select
              options={selectOptions}
              onSelect={onSelectAccessKey}
            ></Select>
          </Form.Item>
          <Form.Item name="secret_key" label={t('general.SecretKey')}>
            <Input disabled />
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
              name="totpActivated"
              label={t('webui.menu.TotpActivated')}
              valuePropName="checked"
            >
              <Switch
                defaultChecked={totpActivated}
                onChange={(checked: boolean) => {
                  if (checked) {
                    toggleTOTPActivateModal();
                  } else {
                    if (totpActivated) {
                      form.setFieldValue('totpActivated', true);
                      modal.confirm({
                        title: t('totp.TurnOffTotp'),
                        icon: <ExclamationCircleFilled />,
                        content: t('totp.ConfirmTotpRemovalBody'),
                        okText: t('button.Yes'),
                        okType: 'danger',
                        cancelText: t('button.No'),
                        onOk() {
                          mutationToRemoveTotp.mutate(userInfo.email || '', {
                            onSuccess: () => {
                              message.success(
                                t('totp.RemoveTotpSetupCompleted'),
                              );
                              form.setFieldValue('totpActivated', false);
                            },
                            onError: (error: any) => {
                              message.error(error.message);
                            },
                          });
                        },
                        onCancel() {
                          form.setFieldValue('totpActivated', true);
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
            open={isOpenTOTPActivateModal}
            onRequestClose={(success) => {
              if (success) {
                setTotpActivated(true);
              } else {
                form.setFieldValue('totp_activated', false);
              }
              toggleTOTPActivateModal();
            }}
          />
        )}
      </Modal>
      {contextHolder}
      {modalContextHolder}
    </>
  );
};

export default UserProfileSettingModal;
