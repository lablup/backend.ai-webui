import { Agent } from '../../hooks/useAgents';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import React, { useState, useTransition } from 'react';

interface AgentSelectProps extends Omit<SelectProps, 'options'> {
  agents: Agent[];
  defaultId?: string;
  onSelectAgent?: (agent: Agent) => void;
}

function makeAgentOptions(agents: Agent[], filter?: string) {
  return agents
    .map((agent) => ({
      label: agent.meta.title,
      value: agent.id,
    }))
    .filter((agent) => {
      return agent.label.toLocaleLowerCase().includes(filter || '');
    });
}

const AgentSelect: React.FC<AgentSelectProps> = ({
  agents,
  defaultId,
  onSelectAgent,
  loading,
  ...selectPropsWithoutLoading
}) => {
  const [controllableValue, setControllableValue] =
    useControllableValue<string>(selectPropsWithoutLoading);
  const [searchAgent, setSearchAgent] = useState<string>();
  const [isSearchPending, startSearchTransition] = useTransition();

  return (
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
    />
  );
};

export default AgentSelect;
