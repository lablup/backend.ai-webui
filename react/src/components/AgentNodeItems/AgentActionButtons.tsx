/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentActionButtonsFragment$key } from '../../__generated__/AgentActionButtonsFragment.graphql';
import AgentLifeCycleControlModal, {
  AgentLifeCycleType,
} from '../AgentLifeCycleControlModal';
import AgentSettingModal from '../AgentSettingModal';
import { PlayCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Space, Tooltip, theme } from 'antd';
import { BAIButton, BAIButtonProps, BAITerminateIcon } from 'backend.ai-ui';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface AgentActionButtonsProps {
  size?: BAIButtonProps['size'];
  agentNodeFrgmt?: AgentActionButtonsFragment$key | null;
}

const AgentActionButtons: React.FC<AgentActionButtonsProps> = ({
  size,
  agentNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [openSettingModal, setOpenSettingModal] = useState(false);
  const [lifeCycleType, setLifeCycleType] = useState<AgentLifeCycleType | null>(
    null,
  );

  const agent = useFragment(
    graphql`
      fragment AgentActionButtonsFragment on AgentNode {
        status
        ...AgentSettingModalFragment
        ...AgentLifeCycleControlModalFragment
      }
    `,
    agentNodeFrgmt,
  );

  return (
    <>
      <Space.Compact>
        <Tooltip title={t('agent.Settings')}>
          <BAIButton
            icon={<SettingOutlined />}
            size={size}
            onClick={() => setOpenSettingModal(true)}
          />
        </Tooltip>
        <Tooltip title={t('agent.WatcherRestart')}>
          <BAIButton
            icon={<RefreshCw />}
            size={size}
            onClick={() => setLifeCycleType('restart')}
          />
        </Tooltip>
        <Tooltip title={t('agent.WatcherStart')}>
          <BAIButton
            icon={<PlayCircleOutlined />}
            size={size}
            disabled={agent?.status === 'ALIVE'}
            onClick={() => setLifeCycleType('start')}
          />
        </Tooltip>
        <Tooltip title={t('agent.WatcherStop')}>
          <BAIButton
            icon={
              <BAITerminateIcon
                style={{
                  color:
                    agent?.status === 'ALIVE' ? token.colorError : undefined,
                }}
              />
            }
            size={size}
            disabled={agent?.status !== 'ALIVE'}
            onClick={() => setLifeCycleType('stop')}
          />
        </Tooltip>
      </Space.Compact>

      <AgentSettingModal
        agentNodeFrgmt={agent}
        open={openSettingModal}
        onRequestClose={() => {
          setOpenSettingModal(false);
        }}
      />
      <AgentLifeCycleControlModal
        open={!!lifeCycleType}
        lifeCycleType={lifeCycleType}
        agentNodeFrgmt={agent}
        onRequestClose={() => setLifeCycleType(null)}
      />
    </>
  );
};

export default AgentActionButtons;
