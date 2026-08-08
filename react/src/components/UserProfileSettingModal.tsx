/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserProfileSettingModalFragment$key } from '../__generated__/UserProfileSettingModalFragment.graphql';
import { UserProfileSettingModalUpdateUserMutation } from '../__generated__/UserProfileSettingModalUpdateUserMutation.graphql';
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { isIpIncludedInList, isValidIPOrCidr } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import TOTPActivateModal from './TOTPActivateModal';
import {
  AstryxFormSwitch,
  AstryxFormTagsInput,
  AstryxFormTextInput,
} from './astryx-bui/astryxFormControls';
import { Text } from '@astryxdesign/core/Text';
import { useToggle } from 'ahooks';
import {
  BAIModal,
  type BAIModalProps,
  BAIText,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import { CircleAlert } from 'lucide-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

// The antd `ModalProps` type import is replaced by BUI's own `BAIModalProps`
// — the modal this component actually renders (P15: a type-only antd import
// still keeps the module in the antd import graph).
interface Props extends BAIModalProps {
  userFrgmt: UserProfileSettingModalFragment$key | null | undefined;
  currentClientIp?: string;
  onRequestClose: (success?: boolean) => void;
  onRequestRefresh: () => void;
  totpSupported?: boolean;
}

type UserProfileFormValues = {
  full_name: string;
  password?: string;
  passwordConfirm?: string;
  totp_activated: boolean;
  allowed_client_ip?: string[];
};

const UserProfileSettingModal: React.FC<Props> = ({
  onRequestClose,
  onRequestRefresh,
  totpSupported,
  userFrgmt,
  currentClientIp,
  ...baiModalProps
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
      fragment UserProfileSettingModalFragment on UserV2 {
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
    useMutation<UserProfileSettingModalUpdateUserMutation>(graphql`
      mutation UserProfileSettingModalUpdateUserMutation(
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

  return (
    <>
      <BAIModal
        {...baiModalProps}
        okText={t('webui.menu.Update')}
        cancelText={t('webui.menu.Cancel')}
        onCancel={() => {
          onRequestClose();
        }}
        confirmLoading={isInFlightUpdateUser}
        onOk={() => onSubmit()}
        centered
        destroyOnHidden
        title={t('webui.menu.MyAccountInformation')}
      >
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
            {/* PILOT-DECISION 1: `autoComplete` is dropped on all three text
                fields — `TextInputProps` is a closed surface with no
                raw-attribute passthrough. The password fields lose only the
                browser hint that this is a NEW password, not any validation
                (the Form.Item rules are unchanged).

                PILOT-DECISION 2: `Input.Password` -> `TextInput
                type="password"` (MAPPING §3.6) drops antd's reveal-eye
                toggle; Astryx's TextInput has no show/hide affordance and
                rebuilding one is out of scope. Both password fields are
                write-only here (they are never pre-filled), so nothing the
                user cannot re-type is hidden from them.

                HANDOFF (not ours to fix): the antd `Form.Item` LABELS in this
                modal render at `rgb(20,20,20)` against the dialog's dark
                surface, i.e. invisible — measured with
                `.scratch/astryx-migration/p3-w2c-ab-account.mjs`. It is
                PRE-EXISTING: the same probe against this file's
                pre-conversion revision reproduces it exactly. The cause is
                the header's reverse-theme region (this modal is opened from
                the account menu) meeting the Astryx `Dialog` surface that
                wave 1 introduced, while the antd Form layer still paints its
                labels from the LIGHT antd theme — MAPPING §5's "a nested
                <Theme> with no explicit `mode`" hazard. Fixing it belongs to
                the modal/theme layer, not to this call site. */}
            <AstryxFormTextInput label={t('webui.menu.FullName')} />
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
            <AstryxFormTextInput
              label={t('general.NewPassword')}
              type="password"
            />
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
            <AstryxFormTextInput
              label={t('webui.menu.NewPasswordAgain')}
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
            <AstryxFormTagsInput
              label={t('credential.AllowedClientIP')}
              placeholder={t('credential.AllowedClientIPPlaceholder')}
            />
          </Form.Item>
          {!!totpSupported && (
            <Form.Item
              name="totp_activated"
              label={t('webui.menu.TotpActivated')}
              valuePropName="checked"
            >
              {/* MAPPING §4: `checked` -> `value` (coalesced by the local
                  adapter below, since Form.Item injects `undefined` until the
                  field is touched), `loading` -> `isLoading`. */}
              {/* `isLoading` and the post-`onChange` side-effect slot
                  (`onValueChange`) are on the SHARED adapter now — those two
                  gaps were the whole reason for the local copy (D10
                  fold-back). */}
              <AstryxFormSwitch
                label={t('webui.menu.TotpActivated')}
                isLoading={mutationToRemoveTotp.isPending}
                onValueChange={(checked: boolean) => {
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
                              message.success(
                                t('totp.RemoveTotpSetupCompleted'),
                              );
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
                          formRef.current?.setFieldValue(
                            'totp_activated',
                            true,
                          );
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
      </BAIModal>
    </>
  );
};

export default UserProfileSettingModal;
