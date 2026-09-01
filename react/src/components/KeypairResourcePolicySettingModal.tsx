/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CreateKeyPairResourcePolicyInput,
  KeypairResourcePolicySettingModalCreateMutation,
} from '../__generated__/KeypairResourcePolicySettingModalCreateMutation.graphql';
import { KeypairResourcePolicySettingModalFragment$key } from '../__generated__/KeypairResourcePolicySettingModalFragment.graphql';
import {
  KeypairResourcePolicySettingModalModifyMutation,
  ModifyKeyPairResourcePolicyInput,
} from '../__generated__/KeypairResourcePolicySettingModalModifyMutation.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import { convertToBinaryUnit } from '../helper';
import { MAX_CPU_QUOTA, SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { useSuspendedBackendaiClient } from '../hooks';
import { useResourceSlots, useResourceSlotsDetails } from '../hooks/backendai';
import { theme } from '../theme-shim';
import BAIFormItem from './BAIFormItem';
import FormItemWithUnlimited from './FormItemWithUnlimited';
import {
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';
import { HStack } from '@astryxdesign/core/Stack';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIDynamicUnitInputNumber,
  BAIAllowedHostNamesSelect,
  BAIFlex,
  BAIModal,
  BAIModalProps,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleHelp } from 'lucide-react';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  // useLazyLoadQuery,
  useMutation,
} from 'react-relay';

interface KeypairResourcePolicySettingModalProps extends BAIModalProps {
  existingPolicyNames?: string[];
  keypairResourcePolicyFrgmt?: KeypairResourcePolicySettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const KeypairResourcePolicySettingModal: React.FC<
  KeypairResourcePolicySettingModalProps
> = ({
  existingPolicyNames,
  keypairResourcePolicyFrgmt = null,
  onRequestClose,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const formRef = useRef<FormInstance>(null);
  const [resourceSlots] = useResourceSlots();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const baiClient = useSuspendedBackendaiClient();

  const keypairResourcePolicy = useFragment(
    graphql`
      fragment KeypairResourcePolicySettingModalFragment on KeyPairResourcePolicy {
        name
        default_for_unspecified
        total_resource_slots
        max_session_lifetime
        max_concurrent_sessions
        max_containers_per_session
        idle_timeout
        allowed_vfolder_hosts
        max_pending_session_count @since(version: "24.03.4")
        max_concurrent_sftp_sessions @since(version: "24.03.4")
      }
    `,
    keypairResourcePolicyFrgmt,
  );

  // const { vfolder_host_permissions } =
  //   useLazyLoadQuery<KeypairResourcePolicySettingModalQuery>(
  //     graphql`
  //       query KeypairResourcePolicySettingModalQuery {
  //         vfolder_host_permissions {
  //           vfolder_host_permission_list
  //         }
  //       }
  //     `,
  //     {},
  //   );

  const [commitCreateKeypairResourcePolicy, isInFlightCommitCreateUserSetting] =
    useMutation<KeypairResourcePolicySettingModalCreateMutation>(graphql`
      mutation KeypairResourcePolicySettingModalCreateMutation(
        $name: String!
        $props: CreateKeyPairResourcePolicyInput!
      ) {
        create_keypair_resource_policy(name: $name, props: $props) {
          ok
          msg
        }
      }
    `);

  const [commitModifyKeypairResourcePolicy, isInFlightCommitModifyUserSetting] =
    useMutation<KeypairResourcePolicySettingModalModifyMutation>(graphql`
      mutation KeypairResourcePolicySettingModalModifyMutation(
        $name: String!
        $props: ModifyKeyPairResourcePolicyInput!
      ) {
        modify_keypair_resource_policy(name: $name, props: $props) {
          ok
          msg
        }
      }
    `);

  const initialValues = useMemo(() => {
    const parsedVfolderHosts = JSON.parse(
      keypairResourcePolicy?.allowed_vfolder_hosts ?? '{}',
    );
    const parsedTotalResourceSlots = JSON.parse(
      keypairResourcePolicy?.total_resource_slots ?? '{}',
    );
    if (parsedTotalResourceSlots?.mem) {
      let autoUniResult = convertToBinaryUnit(
        parsedTotalResourceSlots?.mem,
        'auto',
        2,
        true,
      );

      if (autoUniResult?.unit === '' || autoUniResult?.unit === 'k') {
        autoUniResult = convertToBinaryUnit(
          parsedTotalResourceSlots?.mem,
          'm',
          3,
          true,
        );
      }
      parsedTotalResourceSlots.mem = autoUniResult?.value || '0g';
    }

    return {
      name: keypairResourcePolicy?.name ?? '',
      default_for_unspecified:
        keypairResourcePolicy?.default_for_unspecified || 'UNLIMITED',
      total_resource_slots: parsedTotalResourceSlots ?? {},
      max_session_lifetime: keypairResourcePolicy?.max_session_lifetime ?? 0,
      max_concurrent_sessions:
        keypairResourcePolicy?.max_concurrent_sessions ?? 0,
      max_containers_per_session:
        keypairResourcePolicy?.max_containers_per_session ?? 1,
      idle_timeout: keypairResourcePolicy?.idle_timeout ?? 0,
      allowed_vfolder_hosts: _.keys(parsedVfolderHosts) ?? [],
      max_pending_session_count:
        keypairResourcePolicy?.max_pending_session_count ?? null,
      max_concurrent_sftp_sessions:
        keypairResourcePolicy?.max_concurrent_sftp_sessions ?? 0,
    };
  }, [keypairResourcePolicy]);

  const handleOk = () => {
    return formRef?.current
      ?.validateFields()
      .then((values) => {
        const total_resource_slots = _.mapValues(
          _.pickBy(values.total_resource_slots, (value) => !_.isNil(value)),
          (value, key) => {
            if (_.includes(key, 'mem')) {
              return convertToBinaryUnit(value, '', 0)?.numberFixed;
            }
            return value;
          },
        );

        const allowed_vfolder_hosts: Record<string, string[] | undefined> =
          _.fromPairs(
            _.map(values.allowed_vfolder_hosts, (hostName) => {
              if (initialValues?.allowed_vfolder_hosts?.includes(hostName)) {
                const initialPermissions = JSON.parse(
                  keypairResourcePolicy?.allowed_vfolder_hosts || '{}',
                );
                return [hostName, initialPermissions[hostName]];
              }
              const defaultPermissions = _.get(
                values,
                hostName,
                [
                  'create-vfolder',
                  'modify-vfolder',
                  'delete-vfolder',
                  'mount-in-session',
                  'upload-file',
                  'download-file',
                  'invite-others',
                  'set-user-specific-permission',
                ], // Default permissions
              );
              return [hostName, defaultPermissions];
            }),
          );

        const { _name, ...restValues } = values;
        const props:
          CreateKeyPairResourcePolicyInput | ModifyKeyPairResourcePolicyInput =
          {
            ..._.omit(restValues, 'parsedTotalResourceSlots', 'name'),
            total_resource_slots: JSON.stringify(total_resource_slots),
            allowed_vfolder_hosts: JSON.stringify(allowed_vfolder_hosts),
          };

        if (keypairResourcePolicy === null) {
          commitCreateKeypairResourcePolicy({
            variables: {
              name: values?.name,
              props: props as CreateKeyPairResourcePolicyInput,
            },
            onCompleted: (res) => {
              if (
                !res?.create_keypair_resource_policy?.ok &&
                res.create_keypair_resource_policy?.msg
              ) {
                message.error(res.create_keypair_resource_policy.msg);
                onRequestClose(false);
                return;
              }
              if (
                !res?.create_keypair_resource_policy?.ok &&
                res.create_keypair_resource_policy?.msg
              ) {
                message.error(res.create_keypair_resource_policy.msg);
                onRequestClose(false);
                return;
              }
              message.success(t('resourcePolicy.SuccessfullyCreated'));
              onRequestClose(true);
            },
            onError(err) {
              message.error(
                err?.message || t('resourcePolicy.CannotCreateResourcePolicy'),
              );
            },
          });
        } else {
          commitModifyKeypairResourcePolicy({
            variables: {
              name: values?.name,
              props: props as ModifyKeyPairResourcePolicyInput,
            },
            onCompleted: (res, errors) => {
              if (
                !res?.modify_keypair_resource_policy?.ok &&
                res.modify_keypair_resource_policy?.msg
              ) {
                message.error(res.modify_keypair_resource_policy.msg);
                onRequestClose(false);
                return;
              }
              if (errors && errors.length > 0) {
                errors.forEach((error) => message.error(error.message));
                onRequestClose(false);
                return;
              }

              message.success(t('resourcePolicy.SuccessfullyUpdated'));
              onRequestClose(true);
            },
            onError(err) {
              message.error(
                err?.message || t('resourcePolicy.CannotUpdateResourcePolicy'),
              );
            },
          });
        }
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      width={800}
      title={
        keypairResourcePolicy === null
          ? t('resourcePolicy.CreateKeypairResourcePolicy')
          : t('resourcePolicy.UpdateKeypairResourcePolicy')
      }
      okText={
        keypairResourcePolicy === null ? t('button.Create') : t('button.Save')
      }
      onOk={handleOk}
      onCancel={() => onRequestClose()}
      destroyOnHidden
      confirmLoading={
        isInFlightCommitCreateUserSetting || isInFlightCommitModifyUserSetting
      }
      {...props}
    >
      <Form
        // PILOT-DECISION: `requiredMark={false}` used to globally suppress
        // the antd asterisk because most fields below pass `required` only
        // as a cosmetic section-header marker (validation itself runs via
        // `rules`). `BAIFormItem` renders its own `*` per item with no
        // Form-level override, so instead of the marker reappearing
        // everywhere, `required` is simply omitted at each `BAIFormItem`
        // call site in this file — `rules` (and therefore validation) is
        // untouched.
        ref={formRef}
        layout="vertical"
        initialValues={initialValues}
        preserve={false}
      >
        <BAIFormItem
          label={t('resourcePolicy.Name')}
          name="name"
          rules={[
            {
              required: true,
              message: t('data.explorer.ValueRequired'),
            },
            {
              max: 64,
            },
            {
              validator: (_, value) => {
                if (
                  !keypairResourcePolicy &&
                  existingPolicyNames?.includes(value)
                ) {
                  return Promise.reject(
                    t('resourcePolicy.ResourcePolicyNameAlreadyExists'),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <AstryxFormTextInput
            label={t('resourcePolicy.Name')}
            disabled={!!keypairResourcePolicy}
          />
        </BAIFormItem>
        <BAIFormItem
          label={
            <BAIFlex gap="xxs" align="center">
              {t('resourcePolicy.DefaultForUnspecified')}
              <Tooltip
                content={
                  <>
                    {t('resourcePolicy.DefaultForUnspecifiedTooltipDesc1')}
                    <br />
                    <br />
                    {t('resourcePolicy.DefaultForUnspecifiedTooltipDesc2')}
                  </>
                }
                placement="end"
              >
                <Icon icon={CircleHelp} color="tertiary" size="sm" />
              </Tooltip>
            </BAIFlex>
          }
          name="default_for_unspecified"
        >
          <AstryxFormSelector
            label={t('resourcePolicy.DefaultForUnspecified')}
            options={[
              {
                label: 'UNLIMITED',
                value: 'UNLIMITED',
              },
              {
                label: 'LIMITED',
                value: 'LIMITED',
              },
            ]}
          />
        </BAIFormItem>
        <BAIFormItem label={t('resourcePolicy.ResourcePolicy')}>
          {/* PILOT-DECISION: the antd `Row`/`Col` grid chunked resource
              slots into rows of 3 with `xs`/`md` breakpoints — Astryx has no
              breakpoint system (MAPPING §3.9). Replaced with a single
              wrapping `HStack`; each slot gets a fixed flex-basis instead of
              a responsive span, so the layout still settles into ~3 columns
              on the modal's fixed width without a breakpoint concept. */}
          <Card padding={4}>
            <HStack wrap="wrap" gap={6}>
              {_.map(_.keys(resourceSlots), (resourceSlotKey) => (
                <div
                  key={resourceSlotKey}
                  style={{
                    flex: '1 1 220px',
                    minWidth: 220,
                    marginBottom: token.marginLG,
                  }}
                >
                  <FormItemWithUnlimited
                    unlimitedValue={undefined}
                    label={
                      _.get(mergedResourceSlots, resourceSlotKey)
                        ?.description || resourceSlotKey
                    }
                    name={['total_resource_slots', resourceSlotKey]}
                    rules={[
                      {
                        validator(__, value) {
                          if (
                            _.includes(resourceSlotKey, 'mem') &&
                            value &&
                            // @ts-ignore
                            convertToBinaryUnit(value, 'p').number >
                              // @ts-ignore
                              convertToBinaryUnit('300p', 'p').number
                          ) {
                            return Promise.reject(
                              new Error(
                                t('resourcePolicy.MemorySizeExceedsLimit'),
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    style={{ margin: 0, width: '100%' }}
                  >
                    {_.includes(resourceSlotKey, 'mem') ? (
                      <BAIDynamicUnitInputNumber
                        defaultUnit="g"
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <AstryxFormNumberInput
                        label={
                          _.get(mergedResourceSlots, resourceSlotKey)
                            ?.description || resourceSlotKey
                        }
                        min={0}
                        max={MAX_CPU_QUOTA}
                        step={_.includes(resourceSlotKey, '.shares') ? 0.1 : 1}
                        units={
                          _.get(mergedResourceSlots, resourceSlotKey)
                            ?.display_unit
                        }
                      />
                    )}
                  </FormItemWithUnlimited>
                </div>
              ))}
            </HStack>
          </Card>
        </BAIFormItem>
        <BAIFormItem label={t('resourcePolicy.Sessions')}>
          <Card padding={4}>
            <HStack wrap="wrap" gap={6}>
              <div style={{ flex: '1 1 220px', minWidth: 220 }}>
                <FormItemWithUnlimited
                  label={t('resourcePolicy.ClusterSize')}
                  name="max_containers_per_session"
                  style={{ margin: 0, width: '100%' }}
                  disableUnlimited
                >
                  <AstryxFormNumberInput
                    label={t('resourcePolicy.ClusterSize')}
                    min={0}
                    max={SIGNED_32BIT_MAX_INT}
                  />
                </FormItemWithUnlimited>
              </div>
              <div style={{ flex: '1 1 220px', minWidth: 220 }}>
                <FormItemWithUnlimited
                  name={'max_session_lifetime'}
                  unlimitedValue={0}
                  label={t('resourcePolicy.MaxSessionLifetime')}
                  style={{ margin: 0, width: '100%' }}
                >
                  <AstryxFormNumberInput
                    label={t('resourcePolicy.MaxSessionLifetime')}
                    min={0}
                    max={SIGNED_32BIT_MAX_INT}
                  />
                </FormItemWithUnlimited>
              </div>
              {baiClient.supports('max-pending-session-count') ? (
                <div style={{ flex: '1 1 220px', minWidth: 220 }}>
                  <FormItemWithUnlimited
                    name={'max_pending_session_count'}
                    unlimitedValue={null}
                    label={t('resourcePolicy.MaxPendingSessionCount')}
                    style={{ margin: 0, width: '100%' }}
                  >
                    <AstryxFormNumberInput
                      label={t('resourcePolicy.MaxPendingSessionCount')}
                      min={0}
                      max={SIGNED_32BIT_MAX_INT}
                    />
                  </FormItemWithUnlimited>
                </div>
              ) : null}
              <div style={{ flex: '1 1 220px', minWidth: 220 }}>
                <FormItemWithUnlimited
                  name={'max_concurrent_sessions'}
                  label={t('resourcePolicy.Concurrency')}
                  unlimitedValue={0}
                  style={{ margin: 0, width: '100%' }}
                >
                  <AstryxFormNumberInput
                    label={t('resourcePolicy.Concurrency')}
                    min={0}
                    max={SIGNED_32BIT_MAX_INT}
                  />
                </FormItemWithUnlimited>
              </div>
              <div style={{ flex: '1 1 220px', minWidth: 220 }}>
                <FormItemWithUnlimited
                  name={'idle_timeout'}
                  unlimitedValue={0}
                  label={t('resourcePolicy.IdleTimeoutSec')}
                  style={{ margin: 0, width: '100%' }}
                >
                  <AstryxFormNumberInput
                    label={t('resourcePolicy.IdleTimeoutSec')}
                    min={0}
                    max={Number.MAX_SAFE_INTEGER}
                  />
                </FormItemWithUnlimited>
              </div>
              <div style={{ flex: '1 1 220px', minWidth: 220 }}>
                <FormItemWithUnlimited
                  name={'max_concurrent_sftp_sessions'}
                  unlimitedValue={0}
                  label={t('resourcePolicy.MaxConcurrentSFTPSessions')}
                  style={{ margin: 0, width: '100%' }}
                >
                  <AstryxFormNumberInput
                    label={t('resourcePolicy.MaxConcurrentSFTPSessions')}
                    min={0}
                    max={SIGNED_32BIT_MAX_INT}
                  />
                </FormItemWithUnlimited>
              </div>
            </HStack>
          </Card>
        </BAIFormItem>
        <BAIFormItem label={t('resourcePolicy.Folders')}>
          <Card padding={4}>
            <BAIFormItem
              label={t('resourcePolicy.AllowedHosts')}
              name="allowed_vfolder_hosts"
            >
              <BAIAllowedHostNamesSelect mode="multiple" />
            </BAIFormItem>
          </Card>
        </BAIFormItem>
      </Form>
    </BAIModal>
  );
};

export default KeypairResourcePolicySettingModal;
