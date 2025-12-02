import { AIAgent, useAIAgent } from '../../hooks/useAIAgent';
import { FluentEmojiIcon } from '../FluentEmojiIcon';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useState, useTransition } from 'react';

interface ChatAgentSelectProps extends Omit<SelectProps, 'options'> {}

function makeAgentOptions(agents: AIAgent[], filter?: string) {
  return agents
    .map((agent) => ({
      label: agent.meta.title,
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
  const { token } = theme.useToken();
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
            emoji={selectedAgent.meta.avatar}
            height={token.sizeXL}
            width={token.sizeXL}
          />
          <Select
            showSearch
            onSearch={(v) => {
              startSearchTransition(() => {
                setSearchAgent(v);
              });
            }}
            filterOption={false}
            loading={isSearchPending || loading}
            options={makeAgentOptions(agents, searchAgent)}
            value={controllableValue}
            onChange={(v, agent) => {
              setControllableValue(v, agent);
            }}
            popupMatchSelectWidth={false}
          />
        </BAIFlex>
      )}
    </>
  );
};

export default AIAgentSelect;
