import {
  AgentSettingModalFragment$data,
  AgentSettingModalFragment$key,
} from '../__generated__/AgentSettingModalFragment.graphql';
import { AgentSettingModalMutation } from '../__generated__/AgentSettingModalMutation.graphql';
import { App, Form, FormInstance, Switch } from 'antd';
import {
  BAIAdminResourceGroupSelect,
  BAIModal,
  BAIModalProps,
  toLocalId,
} from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';
import { AgentSettingModalQuery } from 'src/__generated__/AgentSettingModalQuery.graphql';

interface AgentSettingModalProps extends BAIModalProps {
  agentNodeFrgmt?: AgentSettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const AgentSettingModal: React.FC<AgentSettingModalProps> = ({
  agentNodeFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<AgentSettingModalFragment$data> | null>(
    null,
  );

  const queryRef = useLazyLoadQuery<AgentSettingModalQuery>(
    graphql`
      query AgentSettingModalQuery {
        ...BAIAdminResourceGroupSelect_scalingGroupsV2Fragment
      }
    `,
    {},
    {
      fetchPolicy: 'network-only',
    },
  );

  const agent = useFragment(
    graphql`
      fragment AgentSettingModalFragment on AgentNode {
        id
        scaling_group
        schedulable
      }
    `,
    agentNodeFrgmt,
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
      title={t('agent.AgentSetting')}
      onCancel={() => onRequestClose()}
      destroyOnHidden
      width={400}
      confirmLoading={isInFlightCommitModifyAgentSetting}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            commitModifyAgentSetting({
              variables: {
                id: toLocalId(agent?.id ?? ''),
                props: {
                  schedulable: values.schedulable,
                  scaling_group: values.scaling_group,
                },
              },
              updater: (store) => {
                const agentRecord = store.get(agent?.id || '');
                if (agentRecord) {
                  agentRecord.setValue(values.schedulable, 'schedulable');
                  agentRecord.setValue(values.scaling_group, 'scaling_group');
                }
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
      <Form
        layout="vertical"
        ref={formRef}
        preserve={false}
        initialValues={{ ...agent }}
      >
        <Form.Item
          name="scaling_group"
          label={t('agent.ResourceGroup')}
          required={true}
        >
          <BAIAdminResourceGroupSelect queryRef={queryRef} />
        </Form.Item>
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

export default AgentSettingModal;
