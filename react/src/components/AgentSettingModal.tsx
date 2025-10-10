import {
  AgentSettingModalFragment$data,
  AgentSettingModalFragment$key,
} from '../__generated__/AgentSettingModalFragment.graphql';
import { AgentSettingModalMutation } from '../__generated__/AgentSettingModalMutation.graphql';
import { App, Form, FormInstance, Switch } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface AgentSettingModalProps extends BAIModalProps {
  agentSettingModalFrgmt?: AgentSettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const AgentSettingModal: React.FC<AgentSettingModalProps> = ({
  agentSettingModalFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<AgentSettingModalFragment$data> | null>(
    null,
  );
  const agent = useFragment(
    graphql`
      fragment AgentSettingModalFragment on Agent {
        id
        schedulable
      }
    `,
    agentSettingModalFrgmt,
  );

  const [commitModifyAgentSetting, isInFlightCommitModifyAgentSetting] =
    useMutation<AgentSettingModalMutation>(graphql`
      mutation AgentSettingModalMutation(
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
        >
          <Switch />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default AgentSettingModal;
