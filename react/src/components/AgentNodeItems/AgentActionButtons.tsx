import AgentSettingModal from '../AgentSettingModal';
import { SettingOutlined } from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import { BAIButton, BAIButtonProps } from 'backend.ai-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { AgentActionButtonsFragment$key } from 'src/__generated__/AgentActionButtonsFragment.graphql';

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

  const [openSettingModal, setOpenSettingModal] = useState(false);

  const agent = useFragment(
    graphql`
      fragment AgentActionButtonsFragment on AgentNode {
        ...AgentSettingModalFragment
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
      </Space.Compact>

      <AgentSettingModal
        agentNodeFrgmt={agent}
        open={openSettingModal}
        onRequestClose={() => {
          setOpenSettingModal(false);
        }}
      />
    </>
  );
};

export default AgentActionButtons;
