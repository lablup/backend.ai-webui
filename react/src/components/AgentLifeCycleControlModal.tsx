/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentLifeCycleControlModalFragment$key } from '../__generated__/AgentLifeCycleControlModalFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { App, theme, Typography } from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type AgentLifeCycleType = 'start' | 'stop' | 'restart';

interface AgentLifeCycleControlModalProps extends BAIModalProps {
  lifeCycleType: AgentLifeCycleType | null;
  agentNodeFrgmt?: AgentLifeCycleControlModalFragment$key | null;
  onRequestClose: () => void;
}

const LABEL_KEY: Record<AgentLifeCycleType, string> = {
  start: 'agent.WatcherStart',
  stop: 'agent.WatcherStop',
  restart: 'agent.WatcherRestart',
};

const SUCCESS_KEY: Record<AgentLifeCycleType, string> = {
  start: 'agent.WatcherStartRequested',
  stop: 'agent.WatcherStopRequested',
  restart: 'agent.WatcherRestartRequested',
};

const AgentLifeCycleControlModal: React.FC<AgentLifeCycleControlModalProps> = ({
  lifeCycleType,
  agentNodeFrgmt,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useSuspendedBackendaiClient();

  const agent = useFragment(
    graphql`
      fragment AgentLifeCycleControlModalFragment on AgentNode {
        row_id
      }
    `,
    agentNodeFrgmt,
  );

  const startWatcherMutation = useTanMutation({
    mutationFn: (agentId: string) => baiClient.start_watcher_agent(agentId),
  });
  const stopWatcherMutation = useTanMutation({
    mutationFn: (agentId: string) => baiClient.stop_watcher_agent(agentId),
  });
  const restartWatcherMutation = useTanMutation({
    mutationFn: (agentId: string) => baiClient.restart_watcher_agent(agentId),
  });

  const watcherMutations: Record<
    AgentLifeCycleType,
    typeof startWatcherMutation
  > = {
    start: startWatcherMutation,
    stop: stopWatcherMutation,
    restart: restartWatcherMutation,
  };

  // The watcher endpoints (superadmin-only) are proxied by the manager to
  // the agent's watcher daemon. A 200 response can still represent a
  // failure (e.g. the agent is not loaded with systemctl), so the body is
  // inspected for `result === 'ok'`; anything else is surfaced as a
  // warning. Structured/raw errors (invalid params, watcher unreachable,
  // etc.) are resolved through getErrorMessage. The client hands back a
  // plain string for text/* responses, so both shapes are handled.
  const handleOk = () => {
    if (!lifeCycleType || !agent?.row_id) {
      message.error(t('agent.WatcherActionFailed'));
      onRequestClose();
      return;
    }
    return watcherMutations[lifeCycleType]
      .mutateAsync(agent.row_id)
      .then((res: { result?: string; message?: string } | string | null) => {
        if (res && typeof res === 'object' && res.result === 'ok') {
          message.success(t(SUCCESS_KEY[lifeCycleType]));
        } else {
          const detail = typeof res === 'string' ? res : res?.message;
          message.warning(detail || t('agent.WatcherActionFailed'));
        }
      })
      .catch((err: unknown) => {
        message.error(getErrorMessage(err) || t('agent.WatcherActionFailed'));
        logger.error('Watcher agent action failed', err);
      })
      .finally(() => {
        onRequestClose();
      });
  };

  return (
    <BAIModal
      {...modalProps}
      title={lifeCycleType ? t(LABEL_KEY[lifeCycleType]) : ''}
      okText={t('button.Confirm')}
      okButtonProps={{
        danger: lifeCycleType === 'stop' || lifeCycleType === 'restart',
      }}
      confirmLoading={
        startWatcherMutation.isPending ||
        stopWatcherMutation.isPending ||
        restartWatcherMutation.isPending
      }
      onOk={handleOk}
      onCancel={() => onRequestClose()}
      destroyOnHidden
      width={400}
    >
      <BAIFlex direction="column" align="stretch" gap="xs">
        <Typography.Text>{t('agent.WatcherActionWarning')}</Typography.Text>
        <div
          role="list"
          style={{
            backgroundColor: token.colorFillQuaternary,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusSM,
            padding: token.paddingXS,
            paddingInline: token.padding,
          }}
        >
          <div role="listitem">{agent?.row_id}</div>
        </div>
      </BAIFlex>
    </BAIModal>
  );
};

export default AgentLifeCycleControlModal;
