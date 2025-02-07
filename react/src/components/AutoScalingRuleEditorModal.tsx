import {
  SIGNED_32BIT_MAX_INT,
  SIGNED_32BIT_MIN_INT,
} from '../helper/const-vars';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import {
  AutoScalingMetricComparator,
  AutoScalingMetricSource,
  AutoScalingRuleEditorModalCreateMutation,
} from './__generated__/AutoScalingRuleEditorModalCreateMutation.graphql';
import { AutoScalingRuleEditorModalFragment$key } from './__generated__/AutoScalingRuleEditorModalFragment.graphql';
import { AutoScalingRuleEditorModalModifyMutation } from './__generated__/AutoScalingRuleEditorModalModifyMutation.graphql';
import {
  App,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Radio,
  Select,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

interface AutoScalingRuleEditorModalProps
  extends Omit<BAIModalProps, 'onOk' | 'onClose'> {
  endpoint_id: string;
  autoScalingRuleFrgmt?: AutoScalingRuleEditorModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

type AutoScalingRuleInput = {
  metric_source: AutoScalingMetricSource;
  metric_name: string;
  threshold: string;
  comparator: AutoScalingMetricComparator;
  step_size: number;
  cooldown_seconds: number;
  min_replicas: number;
  max_replicas: number;
};

export const COMPARATOR_LABELS = {
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '≤',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '≥',
};

const AutoScalingRuleEditorModal: React.FC<AutoScalingRuleEditorModalProps> = ({
  onRequestClose,
  onCancel,
  endpoint_id,
  autoScalingRuleFrgmt,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const autoScalingRule = useFragment(
    graphql`
      fragment AutoScalingRuleEditorModalFragment on EndpointAutoScalingRuleNode {
        id
        endpoint
        metric_name
        metric_source
        threshold
        comparator
        step_size
        cooldown_seconds
        min_replicas
        max_replicas
      }
    `,
    autoScalingRuleFrgmt,
  );

  const formRef = useRef<FormInstance<AutoScalingRuleInput>>(null);

  const [commitAddAutoScalingRule, isInflightAddAutoScalingRule] =
    useMutation<AutoScalingRuleEditorModalCreateMutation>(graphql`
      mutation AutoScalingRuleEditorModalCreateMutation(
        $endpoint: String!
        $props: EndpointAutoScalingRuleInput!
      ) {
        create_endpoint_auto_scaling_rule_node(
          endpoint: $endpoint
          props: $props
        ) {
          ok
          msg
          rule {
            metric_name
            metric_source
            threshold
            comparator
            step_size
            cooldown_seconds
            min_replicas
            max_replicas
          }
        }
      }
    `);

  const [commitModifyAutoScalingRule, isInflightModifyAutoScalingRule] =
    useMutation<AutoScalingRuleEditorModalModifyMutation>(graphql`
      mutation AutoScalingRuleEditorModalModifyMutation(
        $id: String!
        $props: ModifyEndpointAutoScalingRuleInput!
      ) {
        modify_endpoint_auto_scaling_rule_node(id: $id, props: $props) {
          ok
          msg
          rule {
            metric_name
            metric_source
            threshold
            comparator
            step_size
            cooldown_seconds
            min_replicas
            max_replicas
          }
        }
      }
    `);

  const handleOk = () => {
    // TODO: apply mutationToAddAutoScalingRule request
    return formRef.current
      ?.validateFields()
      .then((values) => {
        if (autoScalingRule) {
          commitModifyAutoScalingRule({
            variables: {
              id: autoScalingRule.id,
              props: {
                metric_name: values.metric_name,
                metric_source: values.metric_source as AutoScalingMetricSource,
                threshold: values.threshold,
                comparator: values.comparator,
                step_size: values.step_size,
                cooldown_seconds: values.cooldown_seconds,
                min_replicas: values.min_replicas,
                max_replicas: values.max_replicas,
              },
            },
            onCompleted: (res, errors) => {
              if (!res?.modify_endpoint_auto_scaling_rule_node?.ok) {
                message.error(res?.modify_endpoint_auto_scaling_rule_node?.msg);
                onRequestClose(false);
                return;
              }
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error, 2.5);
                }
                onRequestClose(false);
                return;
              }
              message.success(t('autoScalingRule.SuccessfullyUpdated'));
              onRequestClose(true);
            },
            onError: (error) => {
              message.error(error.message);
              onRequestClose(false);
            },
          });
        } else {
          commitAddAutoScalingRule({
            variables: {
              endpoint: endpoint_id ?? '',
              props: {
                metric_name: values.metric_name,
                metric_source: values.metric_source as AutoScalingMetricSource,
                threshold: values.threshold,
                comparator: values.comparator,
                step_size: values.step_size,
                cooldown_seconds: values.cooldown_seconds,
                min_replicas: values.min_replicas,
                max_replicas: values.max_replicas,
              },
            },
            onCompleted: (res, errors) => {
              if (!res?.create_endpoint_auto_scaling_rule_node?.ok) {
                message.error(res?.create_endpoint_auto_scaling_rule_node?.msg);
                onRequestClose(false);
                return;
              }
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error, 2.5);
                }
                onRequestClose(false);
                return;
              }
              message.success(t('autoScalingRule.SuccessfullyCreated'));
              onRequestClose(true);
            },
            onError: (error) => {
              message.error(error.message);
              onRequestClose(false);
            },
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCancel = () => {
    onRequestClose(false);
  };

  return (
    <BAIModal
      {...baiModalProps}
      destroyOnClose
      onOk={handleOk}
      onCancel={handleCancel}
      centered
      title={
        autoScalingRule
          ? t('autoScalingRule.EditAutoScalingRule')
          : t('autoScalingRule.AddAutoScalingRule')
      }
      confirmLoading={
        isInflightAddAutoScalingRule || isInflightModifyAutoScalingRule
      }
    >
      <Form
        ref={formRef}
        preserve={false}
        layout={'vertical'}
        requiredMark={'optional'}
        initialValues={
          autoScalingRule
            ? autoScalingRule
            : {
                metric_source: 'KERNEL',
                comparators: 'LESS_THAN',
                threshold: '10',
                step_size: 0,
                cooldown_seconds: 300,
                min_replicas: 0,
                max_replicas: 3,
              }
        }
      >
        <Form.Item
          label={t('autoScalingRule.MetricName')}
          name={'metric_name'}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('autoScalingRule.MetricSource')}
          name={'metric_source'}
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value={'INFERENCE_FRAMEWORK'}>
              Inference Framework
            </Select.Option>
            <Select.Option value={'KERNEL'}>Kernel</Select.Option>
          </Select>
        </Form.Item>
        <Flex
          direction="row"
          justify="around"
          align="stretch"
          style={{ width: '100%' }}
          gap={'md'}
        >
          <Form.Item
            label={t('autoScalingRule.Comparator')}
            name={'comparator'}
            rules={[{ required: true }]}
            style={{ flex: 3 }}
          >
            <Radio.Group
              block
              size={'small'}
              options={_.map(COMPARATOR_LABELS, (label, value) => ({
                label,
                value,
              }))}
              optionType={'button'}
            ></Radio.Group>
          </Form.Item>
          <Form.Item
            label={t('autoScalingRule.Threshold')}
            name={'threshold'}
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Input></Input>
          </Form.Item>
        </Flex>
        <Flex
          direction="row"
          justify="around"
          align="stretch"
          style={{ width: '100%' }}
          gap={'xs'}
        >
          <Form.Item
            label={t('autoScalingRule.MinReplicas')}
            name={'min_replicas'}
            style={{ width: '100%' }}
            rules={[
              {
                required: true,
                min: 0,
                max: SIGNED_32BIT_MAX_INT,
                type: 'number',
              },
              {
                validator: (_, value) => {
                  if (value % 1 !== 0) {
                    return Promise.reject(
                      new Error(t('error.OnlyPositiveIntegersAreAllowed')),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={0}
              max={SIGNED_32BIT_MAX_INT}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            label={t('autoScalingRule.MaxReplicas')}
            name={'max_replicas'}
            style={{ width: '100%' }}
            rules={[
              {
                required: true,
                min: 0,
                max: SIGNED_32BIT_MAX_INT,
                type: 'number',
              },
              {
                validator: (_, value) => {
                  if (value % 1 !== 0) {
                    return Promise.reject(
                      new Error(t('error.OnlyPositiveIntegersAreAllowed')),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={0}
              max={SIGNED_32BIT_MAX_INT}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Flex>
        <Form.Item
          label={t('autoScalingRule.StepSize')}
          name={'step_size'}
          rules={[
            { required: true },
            {
              type: 'number',
              min: SIGNED_32BIT_MIN_INT,
              max: SIGNED_32BIT_MAX_INT,
            },
            {
              validator: (_, value) => {
                if (value % 1 !== 0) {
                  return Promise.reject(
                    new Error(t('error.OnlyIntegersAreAllowed')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber step={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label={t('autoScalingRule.CoolDownSeconds')}
          name={'cooldown_seconds'}
          rules={[
            {
              required: true,
              min: 0,
              type: 'number',
            },
            {
              validator: (_, value) => {
                if (value % 1 !== 0) {
                  return Promise.reject(
                    new Error(t('error.OnlyPositiveIntegersAreAllowed')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default AutoScalingRuleEditorModal;
