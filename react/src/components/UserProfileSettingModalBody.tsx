/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The account dialog's form, split from its frame (`UserProfileSettingModal`) so
 the dialog and its footer paint before this chunk arrives (#11144).
 */
import { UserProfileSettingModalBodyFragment$key } from '../__generated__/UserProfileSettingModalBodyFragment.graphql';
import { UserProfileSettingModalBodyUpdateUserMutation } from '../__generated__/UserProfileSettingModalBodyUpdateUserMutation.graphql';
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { isIpIncludedInList, isValidIPOrCidr } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import TOTPActivateModal from './TOTPActivateModalLazy';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIText,
  useErrorMessageResolver,
  useToggle,
  BAISwitch,
  BAITagsInput,
  BAITextInput,
} from 'backend.ai-ui';
import { CircleAlert } from 'lucide-react';
import React, { useEffect, useEffectEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface Props {
  userFrgmt: UserProfileSettingModalBodyFragment$key | null | undefined;
  currentClientIp?: string;
  onRequestClose: (success?: boolean) => void;
  onRequestRefresh: () => void;
  totpSupported?: boolean;
  /** The frame's Update button runs this, so the body can own the form. */
  submitRef: React.RefObject<(() => void) | null>;
  onReadyChange: (ready: boolean) => void;
  onSubmittingChange: (submitting: boolean) => void;
}

type UserProfileFormValues = {
  full_name: string;
  password?: string;
  passwordConfirm?: string;
  totp_activated: boolean;
  allowed_client_ip?: string[];
};

const UserProfileSettingModalBody: React.FC<Props> = ({
  onRequestClose,
  onRequestRefresh,
  totpSupported,
  userFrgmt,
  currentClientIp,
  submitRef,
  onReadyChange,
  onSubmittingChange,
}) => {
  'use memo';

  const { t } = useTranslation();
  const formRef = useRef<FormInstance<UserProfileFormValues>>(null);
  const { message, modal } = App.useApp();
  const [isOpenTOTPActivateModal, { toggle: toggleTOTPActivateModal }] =
    useToggle(false);
  const baiClient = useSuspendedBackendaiClient();
  const { getErrorMessage } = useErrorMessageResolver();

  const user = useFragment(
    graphql`
      fragment UserProfileSettingModalBodyFragment on UserV2 {
        id
        basicInfo {
          email
          fullName
        }
        security {
          totpActivated @skipOnClient(if: $isNotSupportTotp)
          allowedClientIp
        }
        ...TOTPActivateModalFragment
      }
    `,
    userFrgmt,
  );

  const [commitUpdateUser, isInFlightUpdateUser] =
    useMutation<UserProfileSettingModalBodyUpdateUserMutation>(graphql`
      mutation UserProfileSettingModalBodyUpdateUserMutation(
        $input: UpdateUserV2Input!
      ) {
        updateUserV2(input: $input) {
          user {
            id
            basicInfo {
              email
              fullName
              username
              description
              integrationName
            }
            organization {
              domainName
              role
              resourcePolicy
              mainAccessKey
            }
            security {
              totpActivated
              totpActivatedAt
              sudoSessionEnabled
              allowedClientIp
            }
            status {
              status
              statusInfo
              needPasswordChange
            }
            container {
              containerUid
              containerMainGid
              containerGids
            }
            timestamps {
              createdAt
              modifiedAt
            }
          }
        }
      }
    `);

  const mutationToRemoveTotp = useTanMutation({
    mutationFn: () => {
      return baiClient.remove_totp();
    },
  });

  const onSubmit = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        if (!formRef.current?.isFieldsTouched()) {
          message.info(t('webui.menu.NoChangesToUpdate'));
          return;
        }

        commitUpdateUser({
          variables: {
            input: {
              fullName: values.full_name,
              password: values.password || undefined,
              allowedClientIp: values.allowed_client_ip?.length
                ? values.allowed_client_ip
                : null,
            },
          },
          onCompleted: (_res, errors) => {
            if (errors?.[0]) {
              message.error(errors[0].message || t('error.UnknownError'));
              return;
            }
            message.success(t('webui.menu.ProfileUpdated'));
            onRequestClose(true);
          },
          onError: (err) => {
            message.error(getErrorMessage(err));
          },
        });
      })
      .catch(() => {});
  };

  // The frame owns the footer, so it takes the submit and the in-flight state
  // from here (#11144).
  const registerSubmit = useEffectEvent(() => {
    submitRef.current = onSubmit;
  });
  // No dep array: the ref must track the latest submit closure, as
  // ImportImageModal does.
  useEffect(() => {
    registerSubmit();
  });
  useEffect(() => {
    onReadyChange(true);
  }, [onReadyChange]);
  useEffect(() => {
    onSubmittingChange(isInFlightUpdateUser);
  }, [isInFlightUpdateUser, onSubmittingChange]);

  return (
    <>
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={{
          full_name: user?.basicInfo?.fullName ?? '',
          totp_activated: user?.security?.totpActivated || false,
          allowed_client_ip: user?.security?.allowedClientIp
            ? [...user.security.allowedClientIp].filter(
                (ip): ip is string => ip != null,
              )
            : [],
        }}
        preserve={false}
      >
        <Form.Item
          name="full_name"
          label={t('webui.menu.FullName')}
          rules={[
            () => ({
              validator(_, value) {
                if (!value || value.length < 65) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(t('webui.menu.FullNameInvalid')),
                );
              },
            }),
          ]}
        >
          {/* `TextInputProps` has no raw-attribute passthrough, so
                `autoComplete` is dropped and the password reveal toggle is
                gone — both password fields are write-only here, so nothing
                the user cannot re-type is hidden. The labels render
                invisible on the dark dialog surface: measured live, and
                pre-existing (FR-3482's nested-Theme hazard); the fix belongs
                to the modal/theme layer. */}
          <BAITextInput aria-label={t('webui.menu.FullName')} />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('general.NewPassword')}
          rules={[
            {
              pattern: /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}$/,
              message: t('webui.menu.InvalidPasswordMessage'),
            },
          ]}
        >
          <BAITextInput aria-label={t('general.NewPassword')} type="password" />
        </Form.Item>
        <Form.Item
          name="passwordConfirm"
          label={t('webui.menu.NewPasswordAgain')}
          dependencies={['password']}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const password = getFieldValue('password');
                if (!password && !value) {
                  return Promise.resolve();
                }
                if (password && !value) {
                  return Promise.reject(
                    new Error(t('webui.menu.NewPasswordMismatch')),
                  );
                }
                if (password !== value) {
                  return Promise.reject(
                    new Error(t('webui.menu.NewPasswordMismatch')),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <BAITextInput
            aria-label={t('webui.menu.NewPasswordAgain')}
            type="password"
          />
        </Form.Item>
        <Form.Item
          name="allowed_client_ip"
          label={t('credential.AllowedClientIP')}
          extra={
            <>
              <Text color="secondary">
                {t('credential.AllowedClientIPHint')}
              </Text>
              <br />
              <BAIText
                type="secondary"
                copyable={currentClientIp ? { text: currentClientIp } : false}
              >
                {t('credential.CurrentClientIp', {
                  ip: currentClientIp,
                })}
              </BAIText>
            </>
          }
          rules={[
            {
              validator: async (_rule, value) => {
                if (!value || value.length === 0) return Promise.resolve();
                const invalidIPs = (value as string[]).filter(
                  (ip: string) => !isValidIPOrCidr(ip),
                );
                if (invalidIPs.length > 0) {
                  return Promise.reject(
                    new Error(
                      `${t('credential.InvalidIP')}: ${invalidIPs.join(', ')}`,
                    ),
                  );
                }
                if (
                  currentClientIp &&
                  !isIpIncludedInList(currentClientIp, value)
                ) {
                  return Promise.reject(
                    new Error(
                      t('credential.AllowedClientIpNotIncluded', {
                        ip: currentClientIp,
                      }),
                    ),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          style={{ marginBottom: 0 }}
        >
          <BAITagsInput
            tokenSeparators={[',', ' ']}
            aria-label={t('credential.AllowedClientIP')}
            placeholder={t('credential.AllowedClientIPPlaceholder')}
          />
        </Form.Item>
        {!!totpSupported && (
          <Form.Item
            name="totp_activated"
            label={t('webui.menu.TotpActivated')}
            valuePropName="checked"
          >
            <BAISwitch
              aria-label={t('webui.menu.TotpActivated')}
              isLoading={mutationToRemoveTotp.isPending}
              onChange={(checked: boolean) => {
                if (checked) {
                  toggleTOTPActivateModal();
                } else {
                  if (user?.security?.totpActivated) {
                    formRef.current?.setFieldValue('totp_activated', true);
                    modal.confirm({
                      title: t('totp.TurnOffTotp'),
                      icon: <CircleAlert size="1em" />,
                      content: t('totp.ConfirmTotpRemovalBody'),
                      okText: t('button.Yes'),
                      okType: 'danger',
                      cancelText: t('button.No'),
                      onOk() {
                        mutationToRemoveTotp.mutate(undefined, {
                          onSuccess: () => {
                            message.success(t('totp.RemoveTotpSetupCompleted'));
                            onRequestRefresh();

                            formRef.current?.setFieldValue(
                              'totp_activated',
                              false,
                            );
                          },
                          onError: (error) => {
                            message.error(getErrorMessage(error));
                          },
                        });
                      },
                      onCancel() {
                        formRef.current?.setFieldValue('totp_activated', true);
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
              onRequestRefresh();
            } else {
              formRef.current?.setFieldValue('totp_activated', false);
            }
            toggleTOTPActivateModal();
          }}
        />
      )}
    </>
  );
};

export default UserProfileSettingModalBody;
