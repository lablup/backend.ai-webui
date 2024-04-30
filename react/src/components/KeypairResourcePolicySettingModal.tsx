import { iSizeToSize } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import AllowedHostNamesSelect from './AllowedHostNamesSelect';
import DynamicUnitInputNumber from './DynamicUnitInputNumber';
import FormItemWithUnlimited from './FormItemWithUnlimited';
import {
  KeypairResourcePolicySettingModalFragment$data,
  KeypairResourcePolicySettingModalFragment$key,
} from './__generated__/KeypairResourcePolicySettingModalFragment.graphql';
import {
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Row,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

type TotalResourceSlots = {
  cpu?: number;
  mem?: number;
  'cuda.device'?: number;
  'cuda.shares'?: number;
};

interface KeypairResourcePolicySettingModalProps extends ModalProps {
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
  const [form] = Form.useForm();
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
        max_vfolder_size @deprecatedSince(version: "23.09.4")
        max_quota_scope_size @deprecatedSince(version: "23.09.4")
      }
    `,
    keypairResourcePolicyFrgmt,
  );

  const generateResourcePolicySettingUnlimitedFlags = (
    policy: TotalResourceSlots,
  ) => ({
    totalResourceSlotsCPUUnlimited: _.isUndefined(policy?.cpu),
    totalResourceSlotsMEMUnlimited: _.isUndefined(policy?.mem),
    totalResourceSlotsGPUUnlimited: _.isUndefined(policy?.['cuda.device']),
    totalResourceSlotsFGPUUnlimited: _.isUndefined(policy?.['cuda.shares']),
  });

  const generateSessionSettingUnlimitedFlags = (
    policy: KeypairResourcePolicySettingModalFragment$data | null | undefined,
  ) => ({
    maxContainersPerSessionUnlimited:
      _.isUndefined(policy?.max_containers_per_session) ||
      policy?.max_containers_per_session === 0,
    maxSessionLifetimeUnlimited:
      _.isUndefined(policy?.max_session_lifetime) ||
      policy?.max_session_lifetime === 0,
    maxConcurrentSessionsUnlimited:
      _.isUndefined(policy?.max_concurrent_sessions) ||
      policy?.max_concurrent_sessions === 0,
    idleTimeoutUnlimited:
      _.isUndefined(policy?.idle_timeout) || policy?.idle_timeout === 0,
  });

  const parsedTotalResourceSlots = JSON.parse(
    keypairResourcePolicy?.total_resource_slots || '{}',
  );

  const initialValues = useMemo(() => {
    if (parsedTotalResourceSlots?.mem) {
      parsedTotalResourceSlots.mem = iSizeToSize(
        parsedTotalResourceSlots?.mem + 'b',
        'g',
        2,
        true,
      )?.numberUnit;
    }

    return {
      parsedTotalResourceSlots,
      allowedVfolderHostNames: _.keys(
        JSON.parse(keypairResourcePolicy?.allowed_vfolder_hosts || '{}'),
      ),
      ...keypairResourcePolicy,
      ...generateResourcePolicySettingUnlimitedFlags(parsedTotalResourceSlots),
      ...generateSessionSettingUnlimitedFlags(keypairResourcePolicy),
    };
  }, [keypairResourcePolicy]);

  const handleOk = () => {
    return form.validateFields().then((values) => {
      console.log(values);
    });
  };

  return (
    <Modal
      title={
        keypairResourcePolicy !== null
          ? t('resourcePolicy.UpdateResourcePolicy')
          : t('resourcePolicy.CreateResourcePolicy')
      }
      onOk={handleOk}
      onCancel={() => onRequestClose()}
      destroyOnClose
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
                  label={t('session.launcher.CPU')}
                  fallbackValue={parsedTotalResourceSlots?.cpu}
                  render={(disabled) => (
                    <InputNumber
                      min={0}
                      max={512}
                      disabled={disabled}
                      addonAfter={t('session.launcher.Core')}
                    />
                  )}
                />
              </Col>
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={['parsedTotalResourceSlots', 'mem']}
                  checkboxFieldName="totalResourceSlotsMEMUnlimited"
                  label={t('session.launcher.Memory')}
                  fallbackValue={parsedTotalResourceSlots?.mem}
                  render={(disabled) => (
                    <DynamicUnitInputNumber disabled={disabled} />
                  )}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={['parsedTotalResourceSlots', 'cuda.device']}
                  checkboxFieldName="totalResourceSlotsGPUUnlimited"
                  label={t('session.GPU')}
                  fallbackValue={parsedTotalResourceSlots?.['cuda.device']}
                  render={(disabled) => (
                    <InputNumber
                      min={0}
                      max={64}
                      disabled={disabled}
                      addonAfter={t('session.GPU')}
                    />
                  )}
                />
              </Col>
              <Col span={12}>
                <FormItemWithUnlimited
                  form={form}
                  fieldName={['parsedTotalResourceSlots', 'cuda.shares']}
                  checkboxFieldName="totalResourceSlotsFGPUUnlimited"
                  label={t('session.fGPU')}
                  fallbackValue={parsedTotalResourceSlots?.['cuda.shares']}
                  render={(disabled) => (
                    <InputNumber
                      min={0}
                      max={256}
                      step={0.1}
                      disabled={disabled}
                      addonAfter={t('session.fGPU')}
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
    </Modal>
  );
};

export default KeypairResourcePolicySettingModal;
