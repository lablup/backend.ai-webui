/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentActionButtonsFragment$key } from '../../__generated__/AgentActionButtonsFragment.graphql';
import AgentLifeCycleControlModal, {
  AgentLifeCycleType,
} from '../AgentLifeCycleControlModal';
import AgentSettingModal from '../AgentSettingModal';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { IconButton } from '@astryxdesign/core/IconButton';
import { useTheme } from '@astryxdesign/core/theme';
import { BAITerminateIcon } from 'backend.ai-ui';
import { CirclePlay, Settings, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface AgentActionButtonsProps {
  /** Astryx size scale (`sm|md|lg`); antd `size="large"` → `"lg"` at callers. */
  size?: 'sm' | 'md' | 'lg';
  agentNodeFrgmt?: AgentActionButtonsFragment$key | null;
}

const AgentActionButtons: React.FC<AgentActionButtonsProps> = ({
  size,
  agentNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();

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
      {/* antd Space.Compact + per-button Tooltip → ButtonGroup + IconButton
          (MAPPING §4 Space, ticket-15/18 idiom). IconButton's own `tooltip`
          replaces the wrapping Tooltip, which also sidesteps the Astryx
          contract forbidding Tooltip around a disabled control (SKILL.md
          "three universal contracts" #1 / P18) for the two state-dependent
          buttons below. */}
      <ButtonGroup label={t('general.Control')} size={size}>
        <IconButton
          icon={<Settings size="1em" />}
          label={t('agent.Settings')}
          tooltip={t('agent.Settings')}
          onClick={() => setOpenSettingModal(true)}
        />
        <IconButton
          icon={<RefreshCw />}
          label={t('agent.WatcherRestart')}
          tooltip={t('agent.WatcherRestart')}
          onClick={() => setLifeCycleType('restart')}
        />
        <IconButton
          icon={<CirclePlay size="1em" />}
          label={t('agent.WatcherStart')}
          tooltip={t('agent.WatcherStart')}
          isDisabled={agent?.status === 'ALIVE'}
          onClick={() => setLifeCycleType('start')}
        />
        <IconButton
          icon={
            <BAITerminateIcon
              style={{
                color:
                  agent?.status === 'ALIVE'
                    ? token('--color-error')
                    : undefined,
              }}
            />
          }
          label={t('agent.WatcherStop')}
          tooltip={t('agent.WatcherStop')}
          isDisabled={agent?.status !== 'ALIVE'}
          onClick={() => setLifeCycleType('stop')}
        />
      </ButtonGroup>

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
