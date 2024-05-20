import { iSizeToSize } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useResourceSlotsDetails } from '../hooks/backendai';
import AllowedHostNamesSelect from './AllowedHostNamesSelect';
import BAIModal, { BAIModalProps } from './BAIModal';
import DynamicUnitInputNumber from './DynamicUnitInputNumber';
import FormItemWithUnlimited from './FormItemWithUnlimited';
import {
  CreateKeyPairResourcePolicyInput,
  KeypairResourcePolicySettingModalCreateMutation,
} from './__generated__/KeypairResourcePolicySettingModalCreateMutation.graphql';
import {
  KeypairResourcePolicySettingModalFragment$data,
  KeypairResourcePolicySettingModalFragment$key,
} from './__generated__/KeypairResourcePolicySettingModalFragment.graphql';
import {
  KeypairResourcePolicySettingModalModifyMutation,
  ModifyKeyPairResourcePolicyInput,
} from './__generated__/KeypairResourcePolicySettingModalModifyMutation.graphql';
// import { KeypairResourcePolicySettingModalQuery } from './__generated__/KeypairResourcePolicySettingModalQuery.graphql';
import { App, Card, Col, Form, Input, InputNumber, Row } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useFragment, // useLazyLoadQuery,
  useMutation,
} from 'react-relay';

type TotalResourceSlots = {
  cpu?: number;
  mem?: number;
  'cuda.device'?: number;
  'cuda.shares'?: number;
  [key: string]: number | undefined;
};

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
  const [form] = Form.useForm();
  const [resourceSlotsDetails] = useResourceSlotsDetails();
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

  const parsedTotalResourceSlots = JSON.parse(
    keypairResourcePolicy?.total_resource_slots || '{}',
  );

  const generateResourcePolicySettingUnlimitedFlags = (
    policy: TotalResourceSlots,
  ) => ({
    totalResourceSlotsCPUUnlimited: _.isUndefined(policy?.cpu),
    totalResourceSlotsMEMUnlimited: _.isUndefined(policy?.mem),
    totalResourceSlotsGPUUnlimited: _.isUndefined(policy?.['cuda.device']),
    totalResourceSlotsFGPUUnlimited: _.isUndefined(policy?.['cuda.shares']),
  });

  const isUndefinedOrEqualTo = (value: any, num: number) =>
    _.isUndefined(value) || value === num;

  const generateSessionSettingUnlimitedFlags = (
    policy: KeypairResourcePolicySettingModalFragment$data | null | undefined,
  ) => ({
    maxContainersPerSessionUnlimited: isUndefinedOrEqualTo(
      policy?.max_containers_per_session,
      0,
    ),
    maxSessionLifetimeUnlimited: isUndefinedOrEqualTo(
      policy?.max_session_lifetime,
      0,
    ),
    maxConcurrentSessionsUnlimited: isUndefinedOrEqualTo(
      policy?.max_concurrent_sessions,
      0,
    ),
    idleTimeoutUnlimited: isUndefinedOrEqualTo(policy?.idle_timeout, 0),
  });

  const initialValues = useMemo(() => {
    const localParsedTotalResourceSlots = JSON.parse(
      keypairResourcePolicy?.total_resource_slots || '{}',
    );

    if (localParsedTotalResourceSlots?.mem) {
      localParsedTotalResourceSlots.mem = iSizeToSize(
        localParsedTotalResourceSlots?.mem + 'b',
        'g',
        2,
        true,
      )?.numberUnit;
    }

    return {
      parsedTotalResourceSlots: localParsedTotalResourceSlots,
      allowedVfolderHostNames: _.keys(
        JSON.parse(keypairResourcePolicy?.allowed_vfolder_hosts || '{}'),
      ),
      ...keypairResourcePolicy,
      ...generateResourcePolicySettingUnlimitedFlags(
        localParsedTotalResourceSlots,
      ),
      ...generateSessionSettingUnlimitedFlags(keypairResourcePolicy),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keypairResourcePolicy, keypairResourcePolicy?.total_resource_slots]);

  const handleOk = () => {
    return form.validateFields().then((values) => {
      let totalResourceSlots = _.mapValues(
        values?.parsedTotalResourceSlots,
        (value, key) => {
          if (key === 'mem') {
            return iSizeToSize(value, 'b', 0)?.numberFixed;
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
        max_session_lifetime: values?.max_session_lifetime || 0,
        max_concurrent_sessions: values?.max_concurrent_sessions || 0,
        max_containers_per_session: values?.max_containers_per_session || 0,
        idle_timeout: values?.idle_timeout || 0,
        allowed_vfolder_hosts: JSON.stringify(allowedVfolderHosts || '{}'),
      };
      if (!isDeprecatedMaxVfolderCountInKeypairResourcePolicy) {
        props.max_vfolder_count = values?.max_vfolder_count || 0;
      }

      if (keypairResourcePolicy === null) {
        commitCreateKeypairResourcePolicy({
          variables: {
            name: values?.name,
            props: props as CreateKeyPairResourcePolicyInput,
          },
          onCompleted: (res, errors) => {
            if (!res?.create_keypair_resource_policy?.ok || errors) {
              message.error(res?.create_keypair_resource_policy?.msg);
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
            if (!res?.modify_keypair_resource_policy?.ok || errors) {
              message.error(res?.modify_keypair_resource_policy?.msg);
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
    });
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
        form={form}
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
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={['parsedTotalResourceSlots', 'cpu']}
                  checkboxFieldName="totalResourceSlotsCPUUnlimited"
                  label={resourceSlotsDetails?.cpu.description}
                  fallbackValue={parsedTotalResourceSlots?.cpu}
                  render={(disabled) => (
                    <InputNumber
                      min={0}
                      max={512}
                      disabled={disabled}
                      addonAfter={resourceSlotsDetails?.cpu.display_unit}
                    />
                  )}
                />
              </Col>
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={['parsedTotalResourceSlots', 'mem']}
                  checkboxFieldName="totalResourceSlotsMEMUnlimited"
                  label={resourceSlotsDetails?.mem.description}
                  fallbackValue={parsedTotalResourceSlots?.mem}
                  render={(disabled) => (
                    <DynamicUnitInputNumber disabled={disabled} />
                  )}
                />
              </Col>
            </Row>
            <Row gutter={16} align="bottom">
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={['parsedTotalResourceSlots', 'cuda.device']}
                  checkboxFieldName="totalResourceSlotsGPUUnlimited"
                  label={resourceSlotsDetails?.['cuda.device'].description}
                  fallbackValue={parsedTotalResourceSlots?.['cuda.device']}
                  render={(disabled) => (
                    <InputNumber
                      min={0}
                      max={64}
                      disabled={disabled}
                      addonAfter={
                        resourceSlotsDetails?.['cuda.device'].display_unit
                      }
                    />
                  )}
                />
              </Col>
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={['parsedTotalResourceSlots', 'cuda.shares']}
                  checkboxFieldName="totalResourceSlotsFGPUUnlimited"
                  label={resourceSlotsDetails?.['cuda.shares'].description}
                  fallbackValue={parsedTotalResourceSlots?.['cuda.shares']}
                  render={(disabled) => (
                    <InputNumber
                      min={0}
                      max={256}
                      step={0.1}
                      disabled={disabled}
                      addonAfter={
                        resourceSlotsDetails?.['cuda.shares'].display_unit
                      }
                    />
                  )}
                />
              </Col>
            </Row>
          </Card>
        </Form.Item>
        <Form.Item label={t('resourcePolicy.Sessions')} required>
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={'max_containers_per_session'}
                  checkboxFieldName="maxContainersPerSessionUnlimited"
                  label={t('resourcePolicy.ContainerPerSession')}
                  fallbackValue={
                    keypairResourcePolicy?.max_containers_per_session
                  }
                  render={(disabled) => (
                    <InputNumber
                      min={0}
                      max={100}
                      disabled={disabled}
                      style={{ width: '100%' }}
                    />
                  )}
                />
              </Col>
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={'max_session_lifetime'}
                  checkboxFieldName="maxSessionLifetimeUnlimited"
                  label={t('resourcePolicy.MaxSessionLifetime')}
                  fallbackValue={keypairResourcePolicy?.max_session_lifetime}
                  render={(disabled) => (
                    <InputNumber
                      min={0}
                      max={100}
                      disabled={disabled}
                      style={{ width: '100%' }}
                    />
                  )}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={'max_concurrent_sessions'}
                  checkboxFieldName="maxConcurrentSessionsUnlimited"
                  label={t('resourcePolicy.ConcurrentJobs')}
                  fallbackValue={keypairResourcePolicy?.max_concurrent_sessions}
                  render={(disabled) => (
                    <InputNumber
                      min={0}
                      max={100}
                      disabled={disabled}
                      style={{ width: '100%' }}
                    />
                  )}
                />
              </Col>
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={'idle_timeout'}
                  checkboxFieldName="idleTimeoutUnlimited"
                  label={t('resourcePolicy.IdleTimeoutSec')}
                  fallbackValue={keypairResourcePolicy?.idle_timeout}
                  render={(disabled) => (
                    <InputNumber
                      min={0}
                      max={15552000}
                      disabled={disabled}
                      style={{ width: '100%' }}
                    />
                  )}
                />
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
