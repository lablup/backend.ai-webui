import { AIAgent, useAIAgent } from '../hooks/useAIAgent';
import BAIModal, { BAIModalProps } from './BAIModal';
import { Form, Input, InputNumber, FormInstance, Select } from 'antd';
import React, { useRef } from 'react';

const { TextArea } = Input;

interface AgentEditorModalProps
  extends Omit<BAIModalProps, 'onOk' | 'onCancel'> {
  onRequestClose?: (success: boolean) => void;
  agent?: AIAgent; // Initial agent object for editing, if undefined, creating new agent
}

const AgentEditorModal: React.FC<AgentEditorModalProps> = ({
  agent,
  onRequestClose,
  ...modalProps
}) => {
  const formRef = useRef<FormInstance<Omit<AIAgent, 'id'>>>(null);
  const { upsertAIAgent } = useAIAgent();

  return (
    <BAIModal
      title={agent?.id ? 'Edit Agent' : 'Create New Agent'}
      destroyOnClose
      width={800}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            if (agent?.id) {
              // Update agent
              upsertAIAgent({
                id: agent.id,
                ...values,
              });
              onRequestClose?.(true);
            } else {
              // Create agent
              upsertAIAgent({
                id: `local-${Date.now()}`,
                ...values,
              });
              onRequestClose?.(false);
            }
          })
          .catch((error) => {
            // console.log(error);
          });
      }}
      onCancel={() => {
        onRequestClose?.(false);
      }}
      {...modalProps}
    >
      <Form
        ref={formRef}
        layout="vertical"
        preserve={false}
        initialValues={
          agent ||
          ({
            meta: {
              title: '',
              tags: [],
            },
            endpoint: '',
            config: {
              system_prompt: '',
            },
            params: {
              temperature: 0.05,
              top_p: 0.0,
              frequency_penalty: 0.0,
              presence_penalty: 0.0,
            },
          } as Partial<AIAgent>)
        }
      >
        <Form.Item
          label="Title"
          name={['meta', 'title']}
          rules={[{ required: true, message: 'Title is required' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Avatar" name={['meta', 'avatar']}>
          <Input />
        </Form.Item>

        <Form.Item label="Description" name={['meta', 'descriptions']}>
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="System Prompt"
          name={['config', 'system_prompt']}
          rules={[{ required: true, message: 'System prompt is required' }]}
          tooltip="The system prompt defines the behavior and capabilities of the agent"
        >
          <TextArea rows={5} />
        </Form.Item>

        <Form.Item label="Tags" name={['meta', 'tags']}>
          <Select
            mode="tags"
            tokenSeparators={[',', ' ']}
            open={false}
            suffixIcon={null}
          />
        </Form.Item>

        <Form.Item
          label="Endpoint Name"
          name="endpoint"
          rules={[{ required: true, message: 'Endpoint name is required' }]}
        >
          <Input placeholder="Enter endpoint name" />
        </Form.Item>

        <Form.Item label="Endpoint ID" name="endpoint_id">
          <Input placeholder="Enter backend endpoint ID" />
          {/* <EndpointSelect /> */}
        </Form.Item>

        <Form.Item
          label="Endpoint URL"
          name="endpoint_url"
          rules={[
            {
              type: 'url',
            },
          ]}
        >
          <Input
            autoComplete="impp"
            placeholder="https://api.example.com/v1/chat/completions"
          />
        </Form.Item>

        <Form.Item label="Default Model" name={['config', 'default_model']}>
          <Input />
        </Form.Item>

        <Form.Item label="API Key" name="endpoint_token">
          <Input.Password
            autoComplete="new-password"
            placeholder="Enter API key"
          />
        </Form.Item>

        <Form.Item
          label="Temperature"
          name={['params', 'temperature']}
          tooltip="Controls randomness (0-2)"
        >
          <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Max Tokens"
          name={['params', 'max_tokens']}
          tooltip="Maximum number of tokens to generate"
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Top P"
          name={['params', 'top_p']}
          tooltip="Controls diversity via nucleus sampling (0-1)"
        >
          <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Frequency Penalty"
          name={['params', 'frequency_penalty']}
          tooltip="Penalty for token frequency (-2 to 2)"
        >
          <InputNumber min={-2} max={2} step={0.1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Presence Penalty"
          name={['params', 'presence_penalty']}
          tooltip="Penalty for token presence (-2 to 2)"
        >
          <InputNumber min={-2} max={2} step={0.1} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default AgentEditorModal;
