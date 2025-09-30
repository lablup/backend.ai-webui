import {
  CreateKeyPairResourcePolicyInput,
  KeypairResourcePolicySettingModalCreateMutation,
} from '../__generated__/KeypairResourcePolicySettingModalCreateMutation.graphql';
import { KeypairResourcePolicySettingModalFragment$key } from '../__generated__/KeypairResourcePolicySettingModalFragment.graphql';
import {
  KeypairResourcePolicySettingModalModifyMutation,
  ModifyKeyPairResourcePolicyInput,
} from '../__generated__/KeypairResourcePolicySettingModalModifyMutation.graphql';
import { convertToBinaryUnit } from '../helper';
import { MAX_CPU_QUOTA, SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { useSuspendedBackendaiClient } from '../hooks';
import { useResourceSlots, useResourceSlotsDetails } from '../hooks/backendai';
import AllowedHostNamesSelect from './AllowedHostNamesSelect';
import DynamicUnitInputNumber from './DynamicUnitInputNumber';
import FormItemWithUnlimited from './FormItemWithUnlimited';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  App,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
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
          _.pickBy(
            values.total_resource_slots,
            (value) => !_.isUndefined(value),
          ),
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

        const { name, ...restValues } = values;
        const props:
          | CreateKeyPairResourcePolicyInput
          | ModifyKeyPairResourcePolicyInput = {
          ..._.omit(restValues, 'parsedTotalResourceSlots'),
          total_resource_slots: JSON.stringify(total_resource_slots),
          allowed_vfolder_hosts: JSON.stringify(allowed_vfolder_hosts),
        };

        if (keypairResourcePolicy === null) {
          commitCreateKeypairResourcePolicy({
            variables: {
              name: values?.name,
              props: props as CreateKeyPairResourcePolicyInput,
            },
            onCompleted: (res, errors) => {
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
        <Form.Item
          label={
            <BAIFlex gap="xxs">
              <Typography.Text>
                {t('resourcePolicy.DefaultForUnspecified')}
              </Typography.Text>
              <Tooltip
                title={
                  <>
                    {t('resourcePolicy.DefaultForUnspecifiedTooltipDesc1')}
                    <br />
                    <br />
                    {t('resourcePolicy.DefaultForUnspecifiedTooltipDesc2')}
                  </>
                }
                placement="right"
              >
                <QuestionCircleOutlined
                  style={{ color: token.colorTextSecondary, cursor: 'pointer' }}
                />
              </Tooltip>
            </BAIFlex>
          }
          name="default_for_unspecified"
        >
          <Select
            options={[
              {
                key: 'unlimited',
                label: 'UNLIMITED',
                value: 'UNLIMITED',
              },
              {
                key: 'limited',
                label: 'LIMITED',
                value: 'LIMITED',
              },
            ]}
          />
        </Form.Item>
        <Form.Item label={t('resourcePolicy.ResourcePolicy')} required>
          <Card>
            {_.chain(resourceSlots)
              .keys()
              .chunk(3)
              .map((resourceSlotKeys, index) => (
                <Row gutter={[24, 16]} key={index}>
                  {_.map(resourceSlotKeys, (resourceSlotKey) => (
                    <Col
                      xs={{ span: 12 }}
                      md={{ span: 8 }}
                      key={resourceSlotKey}
                      style={{
                        alignSelf: 'end',
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
                          <DynamicUnitInputNumber style={{ width: '100%' }} />
                        ) : (
                          <InputNumber
                            min={0}
                            max={MAX_CPU_QUOTA}
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
              ))
              .value()}
          </Card>
        </Form.Item>
        <Form.Item label={t('resourcePolicy.Sessions')} required>
          <Card>
            <Row gutter={[24, 16]} style={{ alignSelf: 'end' }}>
              <Col
                xs={{ span: 12 }}
                md={{ span: 8 }}
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
                xs={{ span: 12 }}
                md={{ span: 8 }}
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
                  xs={{ span: 12 }}
                  md={{ span: 8 }}
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
                xs={{ span: 12 }}
                md={{ span: 8 }}
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
                xs={{ span: 12 }}
                md={{ span: 8 }}
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
              <Col
                xs={{ span: 12 }}
                md={{ span: 8 }}
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
          </Card>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default KeypairResourcePolicySettingModal;
