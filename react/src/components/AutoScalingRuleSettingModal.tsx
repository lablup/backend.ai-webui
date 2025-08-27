import BAIModal, { BAIModalProps } from './BAIModal';
import {
  Form,
  Input,
  InputNumber,
  Select,
  FormInstance,
  App,
  Card,
} from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import {
  AutoScalingRuleSettingModalCreateMutation,
  AutoScalingRuleSettingModalCreateMutation$variables,
} from 'src/__generated__/AutoScalingRuleSettingModalCreateMutation.graphql';
import { AutoScalingRuleSettingModalFragment$key } from 'src/__generated__/AutoScalingRuleSettingModalFragment.graphql';
import {
  AutoScalingRuleSettingModalUpdateMutation,
  AutoScalingRuleSettingModalUpdateMutation$variables,
} from 'src/__generated__/AutoScalingRuleSettingModalUpdateMutation.graphql';

interface AutoScalingRuleSettingModalProps extends BAIModalProps {
  deploymentId?: string;
  autoScalingRuleFrgmt?: AutoScalingRuleSettingModalFragment$key | null;
  onRequestClose(success?: boolean): void;
}

type CreateAutoScalingRuleFormValue =
  AutoScalingRuleSettingModalCreateMutation$variables['input'];
type UpdateAutoScalingRuleFormValue =
  AutoScalingRuleSettingModalUpdateMutation$variables['input'];

const AutoScalingRuleSettingModal: React.FC<
  AutoScalingRuleSettingModalProps
> = ({
  deploymentId,
  autoScalingRuleFrgmt = null,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef =
    useRef<
      FormInstance<
        CreateAutoScalingRuleFormValue | UpdateAutoScalingRuleFormValue
      >
    >(null);
  const autoScalingRule = useFragment<AutoScalingRuleSettingModalFragment$key>(
    graphql`
      fragment AutoScalingRuleSettingModalFragment on AutoScalingRule {
        id
        metricSource
        metricName
        minThreshold
        maxThreshold
        stepSize
        timeWindow
        minReplicas
        maxReplicas
      }
    `,
    autoScalingRuleFrgmt,
  );

  const [commitCreateAutoScalingRule, isInFlightCreateAutoScalingRule] =
    useMutation<AutoScalingRuleSettingModalCreateMutation>(graphql`
      mutation AutoScalingRuleSettingModalCreateMutation(
        $input: CreateAutoScalingRuleInput!
      ) {
        createAutoScalingRule(input: $input) {
          autoScalingRule {
            id
          }
        }
      }
    `);

  const [commitUpdateAutoScalingRule, isInFlightUpdateAutoScalingRule] =
    useMutation<AutoScalingRuleSettingModalUpdateMutation>(graphql`
      mutation AutoScalingRuleSettingModalUpdateMutation(
        $input: UpdateAutoScalingRuleInput!
      ) {
        updateAutoScalingRule(input: $input) {
          autoScalingRule {
            id
          }
        }
      }
    `);

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        if (autoScalingRule) {
          const updateInput: UpdateAutoScalingRuleFormValue = {
            id: autoScalingRule?.id || '',
            ...values,
          };
          commitUpdateAutoScalingRule({
            variables: { input: updateInput },
            onCompleted: (res, errors) => {
              if (_.isEmpty(res?.updateAutoScalingRule?.autoScalingRule?.id)) {
                message.error(
                  t('message.FailedToDelete', {
                    name: t('deployment.AutoScalingRule'),
                  }),
                );
                return;
              }
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
              } else {
                message.success(
                  t('message.SuccessfullyUpdated', {
                    name: t('deployment.AutoScalingRule'),
                  }),
                );
                onRequestClose(true);
              }
            },
            onError: (err) => {
              message.error(
                err.message ||
                  t('message.FailedToDelete', {
                    name: t('deployment.AutoScalingRule'),
                  }),
              );
            },
          });
        } else {
          const createInput: CreateAutoScalingRuleFormValue = {
            modelDeploymentId: deploymentId || '',
            metricName: values.metricName ?? '',
            metricSource: values.metricSource ?? 'KERNEL',
            minThreshold: values.minThreshold,
            maxThreshold: values.maxThreshold,
            stepSize: values.stepSize ?? 1,
            timeWindow: values.timeWindow ?? 0,
            minReplicas: values.minReplicas,
            maxReplicas: values.maxReplicas,
          };
          commitCreateAutoScalingRule({
            variables: {
              input: createInput,
            },
            onCompleted: (res, errors) => {
              if (_.isEmpty(res?.createAutoScalingRule?.autoScalingRule?.id)) {
                message.error(t('deployment.AutoScalingRuleCreationFailed'));
                return;
              }
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
              } else {
                message.success(t('deployment.AutoScalingRuleCreated'));
                onRequestClose(true);
              }
            },
            onError: (err) => {
              message.error(
                err.message || t('deployment.AutoScalingRuleCreationFailed'),
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
        autoScalingRule
          ? t('deployment.ModifyAutoScalingRule')
          : t('deployment.CreateAutoScalingRule')
      }
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      okText={autoScalingRule ? t('button.Update') : t('button.Create')}
      cancelText={t('button.Cancel')}
      confirmLoading={
        isInFlightCreateAutoScalingRule || isInFlightUpdateAutoScalingRule
      }
      destroyOnClose
      {...baiModalProps}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={autoScalingRule ?? undefined}
        autoComplete="off"
      >
        <Form.Item
          name="metricSource"
          label={t('deployment.MetricSource')}
          rules={[
            {
              required: true,
              message: t('general.ValueRequired', {
                name: t('deployment.MetricSource'),
              }),
            },
          ]}
        >
          <Select
            options={[
              {
                label: 'Kernel',
                value: 'KERNEL',
              },
              {
                label: 'Inference Framework',
                value: 'INFERENCE_FRAMEWORK',
              },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="metricName"
          label={t('deployment.MetricName')}
          rules={[
            {
              required: true,
              message: t('general.ValueRequired', {
                name: t('deployment.MetricName'),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={t('deployment.ThresholdSettings')}>
          <Card>
            <BAIFlex gap="md">
              <Form.Item
                name="minThreshold"
                label={t('deployment.MinThreshold')}
                style={{ flex: 1 }}
                tooltip={t('deployment.MinThresholdDesc')}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="maxThreshold"
                label={t('deployment.MaxThreshold')}
                style={{ flex: 1 }}
                tooltip={t('deployment.MaxThresholdDesc')}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </BAIFlex>
          </Card>
        </Form.Item>

        <Form.Item label={t('deployment.ScalingSettings')}>
          <Card>
            <BAIFlex gap="md">
              <Form.Item
                name="stepSize"
                label={t('deployment.StepSize')}
                rules={[
                  {
                    required: true,
                    message: t('general.ValueRequired', {
                      name: t('deployment.StepSize'),
                    }),
                  },
                ]}
                style={{ flex: 1 }}
                tooltip={t('deployment.StepSizeDesc')}
              >
                <InputNumber
                  min={1}
                  step={1}
                  style={{ width: '100%' }}
                  placeholder="1"
                />
              </Form.Item>
              <Form.Item
                name="timeWindow"
                label={t('deployment.TimeWindow')}
                rules={[
                  {
                    required: true,
                    message: t('general.ValueRequired', {
                      name: t('deployment.TimeWindow'),
                    }),
                  },
                ]}
                style={{ flex: 1 }}
                tooltip={t('deployment.TimeWindowDesc')}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  addonAfter={t('time.Sec')}
                />
              </Form.Item>
            </BAIFlex>
          </Card>
        </Form.Item>

        <Form.Item label={t('deployment.ReplicaLimits')}>
          <Card>
            <BAIFlex gap="md">
              <Form.Item
                name="minReplicas"
                label={t('deployment.MinReplicas')}
                style={{ flex: 1 }}
                tooltip={t('deployment.MinReplicasDesc')}
              >
                <InputNumber
                  min={0}
                  step={1}
                  style={{ width: '100%' }}
                  placeholder="1"
                />
              </Form.Item>

              <Form.Item
                name="maxReplicas"
                label={t('deployment.MaxReplicas')}
                style={{ flex: 1 }}
                tooltip={t('deployment.MaxReplicasDesc')}
              >
                <InputNumber
                  min={1}
                  step={1}
                  style={{ width: '100%' }}
                  placeholder="10"
                />
              </Form.Item>
            </BAIFlex>
          </Card>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default AutoScalingRuleSettingModal;
