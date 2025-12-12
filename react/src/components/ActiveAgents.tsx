import AgentList from './AgentList';
import { theme } from 'antd';
import { BAIBoardItemTitle, BAIFetchKeyButton, BAIFlex } from 'backend.ai-ui';
import { useTransition } from 'react';
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
  const { token } = theme.useToken();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token.paddingXL,
        height: '100%',
      }}
    >
      <BAIBoardItemTitle
        title={t('activeAgent.ActiveAgents')}
        tooltip={t('activeAgent.ActiveAgentsTooltip', {
          count: 5,
        })}
        extra={
          <BAIFetchKeyButton
            size="small"
            loading={isPendingRefetch}
            value=""
            onChange={(newFetchKey) => {
              startRefetchTransition(() => {
                onChangeFetchKey?.(newFetchKey);
              });
            }}
            type="text"
            style={{
              backgroundColor: 'transparent',
            }}
          />
        }
      />

      {/* Scrollable Content Section */}
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
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
