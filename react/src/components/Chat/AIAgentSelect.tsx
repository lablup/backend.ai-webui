import { AIAgent, useAIAgent } from '../../hooks/useAIAgent';
import Flex from '../Flex';
import { FluentEmojiIcon } from '../FluentEmojiIcon';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import React, { useState, useTransition, useMemo } from 'react';

interface ChatAgentSelectProps extends Omit<SelectProps, 'options'> {
  // defaultValue: string;
}

function makeAgentOptions(agents: AIAgent[], filter?: string) {
  return agents
    .map((agent) => ({
      label: agent.meta.title,
      value: agent.id,
    }))
    .filter((agent) => {
      return agent.label.toLocaleLowerCase().includes(filter || '');
    });
}

const AIAgentSelect: React.FC<ChatAgentSelectProps> = ({
  loading,
  ...props
}) => {
  const [controllableValue, setControllableValue] =
    useControllableValue<AIAgent>(props, {
      valuePropName: 'value',
      trigger: 'onChange',
      defaultValue: props.value,
    });

  const { agents } = useAIAgent();
  const agent = useMemo(() => {
    return agents.find((a) => a.id === props.value);
  }, [agents, props.value]);

  const [searchAgent, setSearchAgent] = useState<string>();
  const [isSearchPending, startSearchTransition] = useTransition();

  return (
    <>
      {agent && (
        <Flex gap="xs">
          <FluentEmojiIcon name={agent.meta.avatar} height={32} width={32} />
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
