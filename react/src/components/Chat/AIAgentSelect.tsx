import { AIAgent } from '../../hooks/useAIAgent';
import Flex from '../Flex';
import { FluentEmojiIcon } from '../FluentEmojiIcon';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps, theme } from 'antd';
import React, { useState, useTransition } from 'react';

interface ChatAgentSelectProps extends Omit<SelectProps, 'options'> {
  agents: AIAgent[];
  selectedAgent?: AIAgent;
}

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
  agents,
  selectedAgent,
  ...props
}) => {
  const { token } = theme.useToken();
  const [controllableValue, setControllableValue] =
    useControllableValue<AIAgent>(props, {
      valuePropName: 'value',
      trigger: 'onChange',
      defaultValue: props.value,
    });

  const [searchAgent, setSearchAgent] = useState<string>();
  const [isSearchPending, startSearchTransition] = useTransition();

  return (
    <>
      {selectedAgent && (
        <Flex gap="xs">
          <FluentEmojiIcon
            name={selectedAgent.meta.avatar}
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
        </Flex>
      )}
    </>
  );
};

export default AIAgentSelect;
