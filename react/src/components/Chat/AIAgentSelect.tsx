/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AIAgent, useAIAgent } from '../../hooks/useAIAgent';
import { FluentEmojiIcon } from '../FluentEmojiIcon';
import { Selector } from '@astryxdesign/core/Selector';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex, useControllableValue } from 'backend.ai-ui';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface ChatAgentSelectProps {
  value?: string;
  onChange?: (value: string, agent?: unknown) => void;
  loading?: boolean;
}

function makeAgentOptions(agents: AIAgent[], filter?: string) {
  return agents
    .map((agent) => ({
      label: agent.name,
      value: agent.id,
      ...agent,
    }))
    .filter((agent) => {
      return agent.label.toLocaleLowerCase().includes(filter || '');
    });
}

const AIAgentSelect: React.FC<ChatAgentSelectProps> = ({
  loading,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = useTheme();
  const [controllableValue, setControllableValue] = useControllableValue(props);

  const [searchAgent, setSearchAgent] = useState<string>();
  const [isSearchPending, startSearchTransition] = useTransition();

  const { agents } = useAIAgent();
  const selectedAgent = agents.find((agent) => agent.id === controllableValue);

  return (
    <>
      {selectedAgent && (
        <BAIFlex gap="xs">
          <FluentEmojiIcon
            emoji={selectedAgent.icon}
            height={token('--spacing-8')}
            width={token('--spacing-8')}
          />
          {/* PILOT-DECISION: antd `showSearch={{filterOption:false, onSearch}}`
              (remote-shaped incremental search) has no destination on
              Astryx `Selector` beyond its own built-in `hasSearch` (which
              filters the already-loaded `options` client-side, per
              MAPPING.md §3.1). The agent catalog is small and fully loaded,
              so client-side filtering is behaviourally equivalent here. */}
          <Selector
            label={t('chatui.SelectAgent')}
            isLabelHidden
            hasSearch
            isLoading={isSearchPending || loading}
            options={makeAgentOptions(agents, searchAgent)}
            value={controllableValue ?? undefined}
            onChange={(v) => {
              startSearchTransition(() => setSearchAgent(undefined));
              const agent = agents.find((a) => a.id === v);
              setControllableValue(v, agent);
            }}
          />
        </BAIFlex>
      )}
    </>
  );
};

export default AIAgentSelect;
