import { convertBinarySizeUnit } from '../helper';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { useSuspendedBackendaiClient } from '../hooks';
import { useResourceSlots, useResourceSlotsDetails } from '../hooks/backendai';
import AllowedHostNamesSelect from './AllowedHostNamesSelect';
import BAIModal, { BAIModalProps } from './BAIModal';
import DynamicUnitInputNumber from './DynamicUnitInputNumber';
import FormItemWithUnlimited from './FormItemWithUnlimited';
import {
  CreateKeyPairResourcePolicyInput,
  KeypairResourcePolicySettingModalCreateMutation,
} from './__generated__/KeypairResourcePolicySettingModalCreateMutation.graphql';
import { KeypairResourcePolicySettingModalFragment$key } from './__generated__/KeypairResourcePolicySettingModalFragment.graphql';
import {
  KeypairResourcePolicySettingModalModifyMutation,
  ModifyKeyPairResourcePolicyInput,
} from './__generated__/KeypairResourcePolicySettingModalModifyMutation.graphql';
// import { KeypairResourcePolicySettingModalQuery } from './__generated__/KeypairResourcePolicySettingModalQuery.graphql';
import {
  App,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useFragment, // useLazyLoadQuery,
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
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);
  const [resourceSlots] = useResourceSlots();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const baiClient = useSuspendedBackendaiClient();
  const isDeprecatedMaxVfolderCountInKeypairResourcePolicy =
    baiClient?.supports(
      'deprecated-max-vfolder-count-in-keypair-resource-policy',
    );

  const keypairResourcePolicy = useFragment(
    graphql`
      fragment KeypairResourcePolicySettingModalFragment on KeyPairResourcePolicy {
        name
        total_resource_slots
        max_session_lifetime
        max_concurrent_sessions
        max_containers_per_session
        idle_timeout
        allowed_vfolder_hosts
        max_vfolder_count @deprecatedSince(version: "23.09.4")
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
      let autoUniResult = convertBinarySizeUnit(
        parsedTotalResourceSlots?.mem + 'b',
        'auto',
        2,
        true,
      );

      if (autoUniResult?.unit === 'B' || autoUniResult?.unit === 'K') {
        autoUniResult = convertBinarySizeUnit(
          parsedTotalResourceSlots?.mem + 'b',
          'M',
          3,
          true,
        );
      }
      parsedTotalResourceSlots.mem = autoUniResult?.numberUnit || '0G';
    }

    return {
      name: keypairResourcePolicy?.name ?? '',
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
          _.pickBy(
            values.total_resource_slots,
            (value) => !_.isUndefined(value),
          ),
          (value, key) => {
            if (_.includes(key, 'mem')) {
              return convertBinarySizeUnit(value, 'b', 0)?.numberFixed;
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

        const { name, ...restValues } = values;
        const props:
          | CreateKeyPairResourcePolicyInput
          | ModifyKeyPairResourcePolicyInput = {
          ..._.omit(restValues, 'parsedTotalResourceSlots'),
          total_resource_slots: JSON.stringify(total_resource_slots),
          allowed_vfolder_hosts: JSON.stringify(allowed_vfolder_hosts),
          default_for_unspecified: 'UNLIMITED',
        };
        if (!isDeprecatedMaxVfolderCountInKeypairResourcePolicy) {
          props.max_vfolder_count = values?.max_vfolder_count;
        }
        if (!baiClient.supports('max-pending-session-count')) {
          delete props?.max_pending_session_count;
        }
        if (!baiClient.supports('max-concurrent-sftp-sessions')) {
          delete props?.max_concurrent_sftp_sessions;
        }

        if (keypairResourcePolicy === null) {
          commitCreateKeypairResourcePolicy({
            variables: {
              name: values?.name,
              props: props as CreateKeyPairResourcePolicyInput,
            },
            onCompleted: (res, errors) => {
              if (!res?.create_keypair_resource_policy?.ok) {
                message.error(res?.create_keypair_resource_policy?.msg);
                onRequestClose();
                return;
              }
              if (errors && errors?.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error, 2.5);
                }
                onRequestClose();
              } else {
                message.success(t('resourcePolicy.SuccessfullyCreated'));
                onRequestClose(true);
              }
            },
            onError(err) {
              message.error(err.message);
            },
          });
        } else {
          commitModifyKeypairResourcePolicy({
            variables: {
              name: values?.name,
              props: props as ModifyKeyPairResourcePolicyInput,
            },
            onCompleted: (res, errors) => {
              if (!res?.modify_keypair_resource_policy?.ok) {
                message.error(res?.modify_keypair_resource_policy?.msg);
                onRequestClose();
                return;
              }
              if (errors && errors?.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error, 2.5);
                }
                onRequestClose();
              } else {
                message.success(t('resourcePolicy.SuccessfullyUpdated'));
                onRequestClose(true);
              }
            },
            onError(err) {
              message.error(err.message);
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
          ? t('resourcePolicy.CreateResourcePolicy')
          : t('resourcePolicy.UpdateResourcePolicy')
      }
      onOk={handleOk}
      onCancel={() => onRequestClose()}
      destroyOnClose
      confirmLoading={
        isInFlightCommitCreateUserSetting || isInFlightCommitModifyUserSetting
      }
      {...props}
    >
      <Form
        // Remove the required mark for the label because it has too many optional fields
        requiredMark={false}
        ref={formRef}
        layout="vertical"
        // requiredMark="optional"
        initialValues={initialValues}
        preserve={false}
      >
        <Form.Item
          label={t('resourcePolicy.Name')}
          name="name"
          required
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
          <Input disabled={!!keypairResourcePolicy} />
        </Form.Item>
        <Form.Item label={t('resourcePolicy.ResourcePolicy')} required>
          <Card>
            {_.map(
              _.chunk(_.keys(resourceSlots), 2),
              (resourceSlotKeys, index) => (
                <Row gutter={[24, 16]} key={index}>
                  {_.map(resourceSlotKeys, (resourceSlotKey) => (
                    <Col
                      xs={{ flex: '50%' }}
                      md={{ flex: '33.3%' }}
                      key={resourceSlotKey}
                      style={{ alignSelf: 'end' }}
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
                                convertBinarySizeUnit(value, 'p').number >
                                  // @ts-ignore
                                  convertBinarySizeUnit('300p', 'p').number
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
                          <DynamicUnitInputNumber style={{ width: '100%' }} />
                        ) : (
                          <InputNumber
                            min={0}
                            step={
                              _.includes(resourceSlotKey, '.shares') ? 0.1 : 1
                            }
                            addonAfter={
                              _.get(mergedResourceSlots, resourceSlotKey)
                                ?.display_unit
                            }
                            style={{ width: '100%' }}
                          />
                        )}
                      </FormItemWithUnlimited>
                    </Col>
                  ))}
                </Row>
              ),
            )}
          </Card>
        </Form.Item>
        <Form.Item label={t('resourcePolicy.Sessions')} required>
          <Card>
            <Row gutter={[24, 16]} style={{ alignSelf: 'end' }}>
              <Col
                xs={{ flex: '50%' }}
                md={{ flex: '33.3%' }}
                style={{ alignSelf: 'end' }}
              >
                <FormItemWithUnlimited
                  label={t('resourcePolicy.ClusterSize')}
                  name="max_containers_per_session"
                  style={{ margin: 0, width: '100%' }}
                  disableUnlimited
                >
                  <InputNumber
                    min={0}
                    max={SIGNED_32BIT_MAX_INT}
                    style={{ width: '100%' }}
                  />
                </FormItemWithUnlimited>
              </Col>
              <Col
                xs={{ flex: '50%' }}
                md={{ flex: '33.3%' }}
                style={{ alignSelf: 'end' }}
              >
                <FormItemWithUnlimited
                  name={'max_session_lifetime'}
                  unlimitedValue={0}
                  label={t('resourcePolicy.MaxSessionLifetime')}
                  style={{ margin: 0, width: '100%' }}
                >
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </FormItemWithUnlimited>
              </Col>
              {baiClient.supports('max-pending-session-count') ? (
                <Col
                  xs={{ flex: '50%' }}
                  md={{ flex: '33.3%' }}
                  style={{ alignSelf: 'end' }}
                >
                  <FormItemWithUnlimited
                    name={'max_pending_session_count'}
                    unlimitedValue={null}
                    label={t('resourcePolicy.MaxPendingSessionCount')}
                    style={{ margin: 0, width: '100%' }}
                  >
                    <InputNumber
                      min={0}
                      max={SIGNED_32BIT_MAX_INT}
                      style={{ width: '100%' }}
                    />
                  </FormItemWithUnlimited>
                </Col>
              ) : null}
              <Col
                xs={{ flex: '50%' }}
                md={{ flex: '33.3%' }}
                style={{ alignSelf: 'end' }}
              >
                <FormItemWithUnlimited
                  name={'max_concurrent_sessions'}
                  label={t('resourcePolicy.ConcurrentJobs')}
                  unlimitedValue={0}
                  style={{ margin: 0, width: '100%' }}
                >
                  <InputNumber
                    min={0}
                    max={SIGNED_32BIT_MAX_INT}
                    style={{ width: '100%' }}
                  />
                </FormItemWithUnlimited>
              </Col>
              <Col
                xs={{ flex: '50%' }}
                md={{ flex: '33.3%' }}
                style={{ alignSelf: 'end' }}
              >
                <FormItemWithUnlimited
                  name={'idle_timeout'}
                  unlimitedValue={0}
                  label={t('resourcePolicy.IdleTimeoutSec')}
                  style={{ margin: 0, width: '100%' }}
                >
                  <InputNumber
                    min={0}
                    max={Number.MAX_SAFE_INTEGER}
                    style={{ width: '100%' }}
                  />
                </FormItemWithUnlimited>
              </Col>
              {baiClient.supports('max-concurrent-sftp-sessions') ? (
                <Col
                  xs={{ flex: '50%' }}
                  md={{ flex: '33.3%' }}
                  style={{ alignSelf: 'end' }}
                >
                  <FormItemWithUnlimited
                    name={'max_concurrent_sftp_sessions'}
                    unlimitedValue={0}
                    label={t('resourcePolicy.MaxConcurrentSFTPSessions')}
                    style={{ margin: 0, width: '100%' }}
                  >
                    <InputNumber
                      min={0}
                      max={SIGNED_32BIT_MAX_INT}
                      style={{ width: '100%' }}
                    />
                  </FormItemWithUnlimited>
                </Col>
              ) : null}
            </Row>
          </Card>
        </Form.Item>
        <Form.Item label={t('resourcePolicy.Folders')} required>
          <Card>
            <Form.Item
              label={t('resourcePolicy.AllowedHosts')}
              name="allowed_vfolder_hosts"
            >
              <AllowedHostNamesSelect mode="multiple" />
            </Form.Item>
            {isDeprecatedMaxVfolderCountInKeypairResourcePolicy ? undefined : (
              <Form.Item label={t('credential.Max#')} name="max_vfolder_count">
                <InputNumber min={0} max={50} />
              </Form.Item>
            )}
          </Card>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default KeypairResourcePolicySettingModal;
