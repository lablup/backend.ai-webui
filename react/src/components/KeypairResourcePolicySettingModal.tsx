import { convertBinarySizeUnit } from '../helper';
import {
  MAX_CPU_QUOTA,
  UNLIMITED_MAX_CONCURRENT_SESSIONS,
  UNLIMITED_MAX_CONTAINERS_PER_SESSIONS,
} from '../helper/const-vars';
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
  theme,
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
  const { token } = theme.useToken();
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
    const parsedTotalResourceSlots = JSON.parse(
      keypairResourcePolicy?.total_resource_slots || '{}',
    );

    if (parsedTotalResourceSlots?.mem) {
      parsedTotalResourceSlots.mem = convertBinarySizeUnit(
        parsedTotalResourceSlots?.mem + 'b',
        'g',
        2,
        true,
      )?.numberUnit;
    }

    let unlimitedValues = {};
    if (keypairResourcePolicy === null) {
      // Initialize unlimited values as a default
      unlimitedValues = {
        max_session_lifetime: 0,
        max_concurrent_sessions: UNLIMITED_MAX_CONCURRENT_SESSIONS,
        max_containers_per_session: UNLIMITED_MAX_CONTAINERS_PER_SESSIONS,
        idle_timeout: 0,
      };
    }

    return {
      parsedTotalResourceSlots,
      allowedVfolderHostNames: _.keys(
        JSON.parse(keypairResourcePolicy?.allowed_vfolder_hosts || '{}'),
      ),
      ...unlimitedValues,
      ...keypairResourcePolicy,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    keypairResourcePolicy,
    keypairResourcePolicy?.total_resource_slots,
    keypairResourcePolicy?.allowed_vfolder_hosts,
  ]);

  const handleOk = () => {
    return formRef?.current
      ?.validateFields()
      .then((values) => {
        let totalResourceSlots = _.mapValues(
          values?.parsedTotalResourceSlots,
          (value, key) => {
            if (_.includes(key, 'mem')) {
              return convertBinarySizeUnit(value, 'b', 0)?.numberFixed;
            }
            return value;
          },
        );
        // Remove undefined values
        totalResourceSlots = _.pickBy(
          totalResourceSlots,
          _.negate(_.isUndefined),
        );

        const parsedAllowedVfolderHosts: Record<string, string[] | undefined> =
          keypairResourcePolicy
            ? JSON.parse(keypairResourcePolicy.allowed_vfolder_hosts || '{}')
            : {};
        const allowedVfolderHosts: Record<string, string[] | undefined> =
          _.fromPairs(
            _.map(values.allowedVfolderHostNames, (hostName) => {
              const permissions = _.get(
                parsedAllowedVfolderHosts,
                hostName,
                // TODO: Comment out if allow all permissions by default
                // vfolder_host_permissions?.vfolder_host_permission_list,
                [], // Default value if undefined
              );
              return [hostName, permissions];
            }),
          );

        const props:
          | CreateKeyPairResourcePolicyInput
          | ModifyKeyPairResourcePolicyInput = {
          default_for_unspecified: 'UNLIMITED',
          total_resource_slots: JSON.stringify(totalResourceSlots || '{}'),
          max_session_lifetime: values?.max_session_lifetime,
          max_concurrent_sessions: values?.max_concurrent_sessions,
          max_containers_per_session: values?.max_containers_per_session,
          idle_timeout: values?.idle_timeout,
          allowed_vfolder_hosts: JSON.stringify(allowedVfolderHosts || '{}'),
        };
        if (!isDeprecatedMaxVfolderCountInKeypairResourcePolicy) {
          props.max_vfolder_count = values?.max_vfolder_count;
        }

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
              if (errors && errors.length > 0) {
                errors.forEach((error) => message.error(error.message, 2.5));
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
                errors.forEach((error) => message.error(error.message, 2.5));
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
        ref={formRef}
        layout="vertical"
        requiredMark="optional"
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
          <Card
            styles={{
              body: {
                paddingBottom: 0,
              },
            }}
          >
            {_.chain(resourceSlots)
              .keys()
              .chunk(2)
              .map((resourceSlotKeys, index) => (
                <Row gutter={[16, 16]} key={index}>
                  {_.map(resourceSlotKeys, (resourceSlotKey) => (
                    <Col
                      span={12}
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
                        name={['parsedTotalResourceSlots', resourceSlotKey]}
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
                      >
                        {_.includes(resourceSlotKey, 'mem') ? (
                          <DynamicUnitInputNumber />
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
          <Card
            styles={{
              body: {
                paddingBottom: 0,
              },
            }}
          >
            <Row gutter={16}>
              <Col
                span={12}
                style={{ alignSelf: 'end', marginBottom: token.marginLG }}
              >
                <FormItemWithUnlimited
                  name={'max_containers_per_session'}
                  unlimitedValue={UNLIMITED_MAX_CONCURRENT_SESSIONS}
                  label={t('resourcePolicy.ContainerPerSession')}
                >
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </FormItemWithUnlimited>
              </Col>
              <Col
                span={12}
                style={{ alignSelf: 'end', marginBottom: token.marginLG }}
              >
                <FormItemWithUnlimited
                  name={'max_session_lifetime'}
                  unlimitedValue={0}
                  label={t('resourcePolicy.MaxSessionLifetime')}
                >
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </FormItemWithUnlimited>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col
                span={12}
                style={{ alignSelf: 'end', marginBottom: token.marginLG }}
              >
                <FormItemWithUnlimited
                  name={'max_concurrent_sessions'}
                  unlimitedValue={UNLIMITED_MAX_CONTAINERS_PER_SESSIONS}
                  label={t('resourcePolicy.ConcurrentJobs')}
                >
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </FormItemWithUnlimited>
              </Col>
              <Col
                span={12}
                style={{ alignSelf: 'end', marginBottom: token.marginLG }}
              >
                <FormItemWithUnlimited
                  name={'idle_timeout'}
                  unlimitedValue={0}
                  label={t('resourcePolicy.IdleTimeoutSec')}
                >
                  <InputNumber
                    min={0}
                    max={15552000}
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
              name="allowedVfolderHostNames"
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
