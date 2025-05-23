import { AIAgent, useAIAgent } from '../../hooks/useAIAgent';
import BAISelect from '../BAISelect';
import Flex from '../Flex';
import { FluentEmojiIcon } from '../FluentEmojiIcon';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps, theme } from 'antd';
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
      <Flex>
        <FluentEmojiIcon
          name={
            selectedAgent ? selectedAgent.meta.avatar : 'bust-in-silhouette'
          }
          height={token.sizeLG}
          width={token.sizeLG}
        />
        <BAISelect
          {...props}
          header={'Chat prompt with configuration'}
          showSearch
          size="large"
          variant="borderless"
          defaultValue={'default'}
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
    </>
  );
};

export default AIAgentSelect;
