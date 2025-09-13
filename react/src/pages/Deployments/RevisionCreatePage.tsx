import EnvVarFormList from '../../components/EnvVarFormList';
import InputNumberWithSlider from '../../components/InputNumberWithSlider';
import ResourceAllocationFormItems from '../../components/ResourceAllocationFormItems';
import { useWebUINavigate } from '../../hooks';
import {
  PlusOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  Form,
  Card,
  Typography,
  Button,
  Select,
  InputNumber,
  Switch,
  Input,
  Divider,
  Alert,
  Row,
  Col,
} from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface SimpleRevisionFormValues {
  mode: 'simple';
  description?: string;
  preset: string;
  resourceSize: 'small' | 'medium' | 'large';
  replicaCount: number;
  autoscalingEnabled: boolean;
}

interface ExpertRevisionFormValues {
  mode: 'expert';
  description?: string;
  containerImage: string;
  modelPath: string;
  modelMountPath: string;
  resource: {
    cpu: number;
    memory: string;
    gpu: number;
    gpuType: string;
  };
  replicaCount: number;
  envVars: Array<{ key: string; value: string }>;
  startupCommand?: string;
  bootstrapScript?: string;
  autoscaling: {
    enabled: boolean;
    rules: Array<{
      metricSource: string;
      metricName: string;
      comparator: string;
      threshold: number;
      stepSize: number;
      cooldownSeconds: number;
      minReplicas: number;
      maxReplicas: number;
    }>;
  };
}

const RevisionCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const { deploymentId } = useParams<{ deploymentId: string }>();
  const webuiNavigate = useWebUINavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revisionMode, setRevisionMode] = useState<'simple' | 'expert'>(
    'simple',
  );

  // Watch for mode changes from the form
  const handleModeChange = (mode: 'simple' | 'expert') => {
    setRevisionMode(mode);
    // Reset form when mode changes
    form.resetFields();
    form.setFieldsValue({ mode });
  };

  const presetOptions = [
    { value: 'vllm', label: 'vLLM' },
    { value: 'sglang', label: 'SGLang' },
    { value: 'nvidia', label: 'NVIDIA Triton' },
    { value: 'mojo', label: 'Mojo' },
  ];

  const resourceSizeOptions = [
    {
      value: 'small',
      label: 'Small (4 CPU, 16GB RAM, 1 GPU)',
    },
    {
      value: 'medium',
      label: 'Medium (8 CPU, 32GB RAM, 2 GPU)',
    },
    {
      value: 'large',
      label: 'Large (16 CPU, 64GB RAM, 4 GPU)',
    },
  ];

  const metricSourceOptions = [
    { value: 'KERNEL', label: 'Kernel Metrics' },
    { value: 'INFERENCE', label: 'Inference Metrics' },
  ];

  const comparatorOptions = [
    { value: 'GREATER_THAN', label: '>' },
    { value: 'LESS_THAN', label: '<' },
    { value: 'GREATER_EQUAL', label: '>=' },
    { value: 'LESS_EQUAL', label: '<=' },
  ];

  const handleSubmit = async (
    values: SimpleRevisionFormValues | ExpertRevisionFormValues,
  ) => {
    setIsSubmitting(true);
    try {
      console.log('Creating revision:', values);
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      webuiNavigate(`/deployment/${deploymentId}`);
    } catch (error) {
      console.error('Failed to create revision:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    webuiNavigate(`/deployment/${deploymentId}`);
  };

  const renderSimpleModeForm = () => (
    <>
      <Form.Item
        label={t('revision.Preset')}
        name="preset"
        rules={[{ required: true, message: t('revision.PresetRequired') }]}
      >
        <Select
          placeholder={t('revision.SelectPreset')}
          options={presetOptions}
        />
      </Form.Item>

      <Form.Item
        label={t('revision.ResourceSize')}
        name="resourceSize"
        rules={[
          { required: true, message: t('revision.ResourceSizeRequired') },
        ]}
      >
        <Select
          placeholder={t('revision.SelectResourceSize')}
          options={resourceSizeOptions}
        />
      </Form.Item>

      <Form.Item
        label={t('revision.ReplicaCount')}
        name="replicaCount"
        rules={[
          { required: true, message: t('revision.ReplicaCountRequired') },
          { type: 'number', min: 1, message: t('revision.ReplicaCountMin') },
        ]}
      >
        <InputNumberWithSlider
          min={1}
          max={10}
          inputNumberProps={{ addonAfter: '#' }}
        />
      </Form.Item>

      <Form.Item
        label={t('revision.AutoscalingEnabled')}
        name="autoscalingEnabled"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </>
  );

  const renderExpertModeForm = () => (
    <>
      <Form.Item
        label={t('revision.ContainerImage')}
        name="containerImage"
        rules={[
          { required: true, message: t('revision.ContainerImageRequired') },
        ]}
      >
        <Input placeholder="registry.hub.docker.com/library/vllm:latest" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={t('revision.ModelPath')}
            name="modelPath"
            rules={[
              { required: true, message: t('revision.ModelPathRequired') },
            ]}
          >
            <Input placeholder="/workspace/models/llama-3" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('revision.ModelMountPath')}
            name="modelMountPath"
            rules={[
              { required: true, message: t('revision.ModelMountPathRequired') },
            ]}
          >
            <Input placeholder="/models" />
          </Form.Item>
        </Col>
      </Row>

      <ResourceAllocationFormItems enableResourcePresets={false} />

      <Form.Item
        label={t('revision.ReplicaCount')}
        name="replicaCount"
        rules={[
          { required: true, message: t('revision.ReplicaCountRequired') },
          { type: 'number', min: 1, message: t('revision.ReplicaCountMin') },
        ]}
      >
        <InputNumberWithSlider
          min={1}
          max={10}
          inputNumberProps={{ addonAfter: '#' }}
        />
      </Form.Item>

      <Form.Item label={t('revision.EnvironmentVariables')}>
        <EnvVarFormList name="envVars" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t('revision.StartupCommand')} name="startupCommand">
            <Input.TextArea
              placeholder="python -m vllm.entrypoints.openai.api_server"
              rows={3}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('revision.BootstrapScript')}
            name="bootstrapScript"
          >
            <Input.TextArea
              placeholder="#!/bin/bash\necho 'Initializing...'"
              rows={3}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider>{t('revision.AutoscalingRules')}</Divider>

      <Form.Item
        label={t('revision.AutoscalingEnabled')}
        name={['autoscaling', 'enabled']}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) =>
          prev.autoscaling?.enabled !== cur.autoscaling?.enabled
        }
      >
        {({ getFieldValue }) =>
          getFieldValue(['autoscaling', 'enabled']) && (
            <Form.List name={['autoscaling', 'rules']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      title={`${t('revision.AutoscalingRule')} ${name + 1}`}
                      extra={
                        <Button
                          type="text"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        />
                      }
                      style={{ marginBottom: 16 }}
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'metricSource']}
                            label={t('revision.MetricSource')}
                            rules={[
                              {
                                required: true,
                                message: t('revision.MetricSourceRequired'),
                              },
                            ]}
                          >
                            <Select options={metricSourceOptions} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'metricName']}
                            label={t('revision.MetricName')}
                            rules={[
                              {
                                required: true,
                                message: t('revision.MetricNameRequired'),
                              },
                            ]}
                          >
                            <Input placeholder="cpu_utilization" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'comparator']}
                            label={t('revision.Comparator')}
                            rules={[
                              {
                                required: true,
                                message: t('revision.ComparatorRequired'),
                              },
                            ]}
                          >
                            <Select options={comparatorOptions} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'threshold']}
                            label={t('revision.Threshold')}
                            rules={[
                              {
                                required: true,
                                message: t('revision.ThresholdRequired'),
                              },
                            ]}
                          >
                            <InputNumber min={0} max={100} addonAfter="%" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'stepSize']}
                            label={t('revision.StepSize')}
                            rules={[
                              {
                                required: true,
                                message: t('revision.StepSizeRequired'),
                              },
                            ]}
                          >
                            <InputNumber />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'cooldownSeconds']}
                            label={t('revision.CooldownSeconds')}
                            rules={[
                              {
                                required: true,
                                message: t('revision.CooldownRequired'),
                              },
                            ]}
                          >
                            <InputNumber min={1} addonAfter="s" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'minReplicas']}
                            label={t('revision.MinReplicas')}
                            rules={[
                              {
                                required: true,
                                message: t('revision.MinReplicasRequired'),
                              },
                            ]}
                          >
                            <InputNumber min={1} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'maxReplicas']}
                            label={t('revision.MaxReplicas')}
                            rules={[
                              {
                                required: true,
                                message: t('revision.MaxReplicasRequired'),
                              },
                            ]}
                          >
                            <InputNumber min={1} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ width: '100%' }}
                  >
                    {t('revision.AddAutoscalingRule')}
                  </Button>
                </>
              )}
            </Form.List>
          )
        }
      </Form.Item>
    </>
  );

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="md"
      style={{ maxWidth: 800 }}
    >
      <Typography.Title level={3}>
        {t('revision.CreateRevision')}
      </Typography.Title>

      <Alert
        message={t('revision.ModeInfo')}
        description={
          revisionMode === 'simple'
            ? t('revision.SimpleModeDescription')
            : t('revision.ExpertModeDescription')
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            mode: 'simple',
            replicaCount: 1,
            autoscalingEnabled: false,
            autoscaling: { enabled: false, rules: [] },
          }}
        >
          <Form.Item
            label={t('deployment.Mode')}
            name="mode"
            rules={[{ required: true, message: t('deployment.ModeRequired') }]}
          >
            <Select
              value={revisionMode}
              onChange={handleModeChange}
              options={[
                {
                  value: 'simple',
                  label: (
                    <div>
                      <div>{t('deployment.SimpleMode')}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {t('deployment.SimpleModeDescription')}
                      </div>
                    </div>
                  ),
                },
                {
                  value: 'expert',
                  label: (
                    <div>
                      <div>{t('deployment.ExpertMode')}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {t('deployment.ExpertModeDescription')}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Form.Item>

          <Alert
            message={t('deployment.ModeWarning')}
            description={t('deployment.ModeWarningDescription')}
            type="warning"
            icon={<InfoCircleOutlined />}
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item label={t('deployment.Description')} name="description">
            <Input.TextArea
              placeholder={t('deployment.DescriptionPlaceholder')}
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>

          {revisionMode === 'simple'
            ? renderSimpleModeForm()
            : renderExpertModeForm()}

          <Form.Item style={{ marginTop: 24 }}>
            <BAIFlex justify="end" gap="sm">
              <Button onClick={handleCancel}>{t('button.Cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {t('button.Create')}
              </Button>
            </BAIFlex>
          </Form.Item>
        </Form>
      </Card>
    </BAIFlex>
  );
};

export default RevisionCreatePage;
