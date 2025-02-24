import Flex from '../components/Flex';
import { useWebUINavigate } from '../hooks';
import { Agent, useAgents } from '../hooks/useAgents';
import { Avatar, Card, List, Skeleton, Tag, theme } from 'antd';
import { createStyles } from 'antd-style';
import React, { Suspense } from 'react';

const useStyles = createStyles(({ css, token }) => {
  return {
    cardList: css`
      .and-col {
        height: calc(100% - ${token.marginMD});
      }
      .ant-tag {
        margin-inline-end: 0;
      }
    `,
  };
});

const { Meta } = Card;

const AgentCard = ({ agent }: { agent: Agent }) => {
  const tags = agent.meta.tags || [];
  return (
    <Card
      hoverable
      style={{
        height: '100%',
      }}
    >
      <Flex
        direction="column"
        align="stretch"
        gap="xs"
        justify="between"
        style={{ minHeight: '200px' }}
      >
        <Meta
          title={agent.meta.title}
          avatar={<Avatar src={agent.meta.avatar} size={150} />}
          description={agent.meta.descriptions}
        />
        <Flex
          direction="row"
          justify="start"
          style={{ width: '100%', flexShrink: 1 }}
          gap={6}
          wrap="wrap"
        >
          <Tag key={agent.model} color={'orange-inverse'}>
            {agent.model}
          </Tag>
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
};

const AgentCardList = ({
  agents,
  onClickAgent,
}: {
  agents: Agent[];
  onClickAgent: (agent: Agent) => void;
}) => {
  const { styles } = useStyles();

  return (
    <List
      className={styles.cardList}
      grid={{ gutter: 16, column: 2 }}
      dataSource={agents}
      renderItem={(agent) => (
        <List.Item
          style={{ height: '100%' }}
          onClick={() => onClickAgent(agent)}
        >
          <AgentCard agent={agent} />
        </List.Item>
      )}
    ></List>
  );
};

const AgentsPage: React.FC = () => {
  const { token } = theme.useToken();
  const { agents } = useAgents();
  const webuiNavigate = useWebUINavigate();

  return (
    <Suspense
      fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
    >
      <Flex
        direction="column"
        align="stretch"
        justify="center"
        gap="lg"
        style={{ padding: token.paddingLG }}
      >
        <AgentCardList
          agents={agents}
          onClickAgent={(agent) => {
            webuiNavigate(
              `/chat?endpointId=${agent.model_id}&agentId=${agent.id}`,
            );
            console.log(agent);
          }}
        />
      </Flex>
    </Suspense>
  );
};

export default AgentsPage;
