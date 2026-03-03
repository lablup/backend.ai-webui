/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AutoScalingMetricComparator,
  AutoScalingMetricSource,
  AutoScalingRuleEditorModalCreateMutation,
  EndpointAutoScalingRuleInput,
} from '../__generated__/AutoScalingRuleEditorModalCreateMutation.graphql';
import { AutoScalingRuleEditorModalFragment$key } from '../__generated__/AutoScalingRuleEditorModalFragment.graphql';
import { AutoScalingRuleEditorModalModifyMutation } from '../__generated__/AutoScalingRuleEditorModalModifyMutation.graphql';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import {
  App,
  AutoComplete,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Typography,
} from 'antd';
import { BAIFlex, BAIModal, BAIModalProps, useBAILogger } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface AutoScalingRuleEditorModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onClose' | 'onCancel'
> {
  endpoint_id: string;
  autoScalingRuleFrgmt?: AutoScalingRuleEditorModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

type AutoScalingRuleInput = {
  type: 'out' | 'in';
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

const METRIC_NAMES_MAP: Partial<{
  [key in AutoScalingMetricSource]: Array<string>;
}> = {
  KERNEL: ['cpu_util', 'mem', 'net_rx', 'net_tx'],
  INFERENCE_FRAMEWORK: [],
};

const AutoScalingRuleEditorModal: React.FC<AutoScalingRuleEditorModalProps> = ({
  onRequestClose,
  endpoint_id,
  autoScalingRuleFrgmt,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();

  const [nameOptions, setNameOptions] = useState<Array<string>>(
    METRIC_NAMES_MAP.KERNEL || [],
  );

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
        const props: EndpointAutoScalingRuleInput = {
          metric_name: values.metric_name,
          metric_source: values.metric_source as AutoScalingMetricSource,
          threshold: values.threshold,
          comparator: values.comparator,
          step_size: values.step_size * (values.type === 'out' ? 1 : -1),
          cooldown_seconds: values.cooldown_seconds,
          min_replicas: values.min_replicas,
          max_replicas: values.max_replicas,
        };

        // set min and max replicas as same value to avoid validation error
        if (values.type === 'out') {
          delete props.min_replicas;
        } else {
          delete props.max_replicas;
        }

        if (autoScalingRule) {
          commitModifyAutoScalingRule({
            variables: {
              id: autoScalingRule.id,
              props,
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
                  message.error(error);
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
              props,
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
                  message.error(error);
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
        logger.error(err);
      });
  };

  const handleCancel = () => {
    onRequestClose(false);
  };

  return (
    <BAIModal
      {...baiModalProps}
      destroyOnHidden
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
        layout={'vertical'}
        initialValues={
          autoScalingRule
            ? {
                ...autoScalingRule,
                step_size: Math.abs(autoScalingRule.step_size),
                type: autoScalingRule.step_size >= 0 ? 'out' : 'in',
              }
            : {
                type: 'out',
                metric_source: 'KERNEL',
                comparator: 'GREATER_THAN',
                step_size: 1,
                cooldown_seconds: 300,
                min_replicas: 0,
                max_replicas: 5,
              }
        }
      >
        <Form.Item
          label={t('autoScalingRule.ScalingType')}
          name={'type'}
          rules={[{ required: true }]}
        >
          <Radio.Group
            options={[
              {
                label: (
                  <BAIFlex gap={'xs'}>{t('autoScalingRule.ScaleOut')}</BAIFlex>
                ),
                value: 'out',
              },
              {
                label: (
                  <BAIFlex gap={'xs'}>{t('autoScalingRule.ScaleIn')}</BAIFlex>
                ),
                value: 'in',
              },
            ]}
            onChange={(e) => {
              e.target.value === 'in'
                ? formRef.current?.setFieldsValue({ max_replicas: 1 })
                : formRef.current?.setFieldsValue({ min_replicas: 1 });
            }}
          />
        </Form.Item>
        <Form.Item
          label={t('autoScalingRule.MetricSource')}
          name={'metric_source'}
          rules={[{ required: true }]}
        >
          <Select
            onChange={(value) => {
              // @ts-ignore
              setNameOptions(METRIC_NAMES_MAP[value] || []);
            }}
            options={[
              {
                label: 'Inference Framework',
                value: 'INFERENCE_FRAMEWORK',
              },
              {
                label: 'Kernel',
                value: 'KERNEL',
              },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={t('autoScalingRule.Condition')}
          required
          tooltip={t('autoScalingRule.ConditionTooltip')}
          dependencies={['metric_source']}
        >
          {({ getFieldValue }: FormInstance<AutoScalingRuleInput>) => {
            return (
              <Space.Compact
                style={{
                  width: '100%',
                }}
              >
                <Form.Item
                  name={'metric_name'}
                  rules={[{ required: true }]}
                  style={{ flex: 1 }}
                  noStyle
                >
                  <AutoComplete
                    placeholder={t('autoScalingRule.MetricName')}
                    options={_.map(nameOptions, (name) => ({
                      label: name,
                      value: name,
                    }))}
                    onSearch={(text) =>
                      setNameOptions(
                        _.filter(
                          // @ts-ignore
                          METRIC_NAMES_MAP[getFieldValue('metric_source')],
                          (name) => name.includes(text),
                        ),
                      )
                    }
                    allowClear
                    popupMatchSelectWidth={false}
                  />
                </Form.Item>
                <Form.Item
                  label={t('autoScalingRule.Comparator')}
                  name={'comparator'}
                  rules={[{ required: true }]}
                  noStyle
                >
                  <Select
                    style={{ width: 100 }}
                    options={_.map(COMPARATOR_LABELS, (label, value) => ({
                      label: (
                        <BAIFlex gap={'xs'}>
                          {label}
                          <Typography.Text type="secondary">
                            ({value})
                          </Typography.Text>
                        </BAIFlex>
                      ),
                      value,
                      selectedLabel: label,
                    }))}
                    optionLabelProp="selectedLabel"
                    popupMatchSelectWidth={false}
                  />
                </Form.Item>
                <Form.Item
                  name={'threshold'}
                  rules={[{ required: true }]}
                  noStyle
                >
                  <Input
                    suffix={
                      getFieldValue('metric_source') === 'KERNEL' ? '%' : ''
                    }
                    placeholder={t('autoScalingRule.Threshold')}
                  />
                </Form.Item>
              </Space.Compact>
            );
          }}
        </Form.Item>
        <Form.Item
          label={t('autoScalingRule.StepSize')}
          name={'step_size'}
          rules={[
            { required: true },
            {
              type: 'number',
              min: 1,
              max: SIGNED_32BIT_MAX_INT,
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
          <InputNumber min={1} step={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item noStyle dependencies={['type']}>
          {({ getFieldValue }) => {
            return getFieldValue('type') === 'out' ? (
              <Form.Item
                label={t('autoScalingRule.MaxReplicas')}
                name={'max_replicas'}
                style={{ width: '100%' }}
                rules={[
                  {
                    required: true,
                  },
                  {
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
            ) : (
              <Form.Item
                label={t('autoScalingRule.MinReplicas')}
                name={'min_replicas'}
                style={{ width: '100%' }}
                rules={[
                  {
                    required: true,
                  },
                  {
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
            );
          }}
        </Form.Item>
        <Form.Item
          label={t('autoScalingRule.CoolDownSeconds')}
          name={'cooldown_seconds'}
          rules={[
            {
              required: true,
            },
            {
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
