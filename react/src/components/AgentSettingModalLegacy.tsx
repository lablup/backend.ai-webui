import {
  AgentSettingModalLegacyFragment$data,
  AgentSettingModalLegacyFragment$key,
} from '../__generated__/AgentSettingModalLegacyFragment.graphql';
import { AgentSettingModalLegacyMutation } from '../__generated__/AgentSettingModalLegacyMutation.graphql';
import { App, Form, FormInstance, Switch } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface AgentSettingModalLegacyProps extends BAIModalProps {
  agentSettingModalLegacyFrgmt?: AgentSettingModalLegacyFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const AgentSettingModalLegacy: React.FC<AgentSettingModalLegacyProps> = ({
  agentSettingModalLegacyFrgmt: agentSettingModalLegacyFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef =
    useRef<FormInstance<AgentSettingModalLegacyFragment$data> | null>(null);
  const agent = useFragment(
    graphql`
      fragment AgentSettingModalLegacyFragment on Agent {
        id
        schedulable
      }
    `,
    agentSettingModalLegacyFrgmt,
  );

  const [commitModifyAgentSetting, isInFlightCommitModifyAgentSetting] =
    useMutation<AgentSettingModalLegacyMutation>(graphql`
      mutation AgentSettingModalLegacyMutation(
        $id: String!
        $props: ModifyAgentInput!
      ) {
        modify_agent(id: $id, props: $props) {
          ok
          msg
        }
      }
    `);

  return (
    <BAIModal
      {...modalProps}
      title={`${t('agent.AgentSetting')}: ${agent?.id}`}
      onCancel={() => onRequestClose()}
      destroyOnHidden
      width={300}
      confirmLoading={isInFlightCommitModifyAgentSetting}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            commitModifyAgentSetting({
              variables: {
                id: agent?.id || '',
                props: {
                  schedulable: values.schedulable,
                },
              },
              onCompleted(res, errors) {
                if (!res?.modify_agent?.ok || errors) {
                  message.error(res?.modify_agent?.msg);
                  onRequestClose();
                } else {
                  message.success(t('agent.AgentSettingUpdated'));
                  onRequestClose(true);
                }
              },
              onError(err) {
                message.error(err?.message);
              },
            });
          })
          .catch(() => {});
      }}
    >
      <Form ref={formRef} preserve={false} initialValues={{ ...agent }}>
        <Form.Item
          name="schedulable"
          label={t('agent.Schedulable')}
          valuePropName="checked"
          required={true}
        >
          <Switch />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default AgentSettingModalLegacy;
