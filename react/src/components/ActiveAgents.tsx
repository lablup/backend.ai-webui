/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentList from './AgentList';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIBoardItemTitle, BAIFlex } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

interface ActiveAgentsProps {
  fetchKey?: string;
  onChangeFetchKey?: (key: string) => void;
}

// TODO: Refactor this component with agent_nodes.
// ref: https://lablup.atlassian.net/browse/FR-1533
const ActiveAgents: React.FC<ActiveAgentsProps> = ({
  fetchKey,
  onChangeFetchKey,
}) => {
  const { t } = useTranslation();
  const { token } = useTheme();

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token('--spacing-8'),
        height: '100%',
      }}
    >
      <BAIBoardItemTitle
        title={t('activeAgent.ActiveAgents')}
        tooltip={t('activeAgent.ActiveAgentsTooltip', {
          count: 5,
        })}
      />

      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          marginBottom: token('--spacing-4'),
        }}
      >
        <AgentList
          fetchKey={fetchKey}
          onChangeFetchKey={onChangeFetchKey}
          headerProps={{
            style: { display: 'none' },
          }}
          tableProps={{
            pagination: {
              pageSize: 3,
              showSizeChanger: false,
            },
          }}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default ActiveAgents;
