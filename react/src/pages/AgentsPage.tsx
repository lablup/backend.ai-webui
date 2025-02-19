import Flex from '../components/Flex';
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
      .ant-card-extra {
        position: relative;
        top: 28px;
      }
    `,
  };
});

const { Meta, Grid } = Card;

const AgentCard = ({ agent }: { agent: Agent }) => {
  const tags = agent.meta.tags || [];
  return (
    <Card hoverable>
      <Flex
        direction="column"
        align="center"
        justify="between"
        gap="lg"
        style={{
          minHeight: '160px',
        }}
      >
        <Meta
          title={agent.meta.title}
          avatar={<Avatar src={agent.meta.avatar} size={56} />}
          description={
            (agent.meta.descriptions?.length ?? 0) > 80
              ? `${agent.meta.descriptions?.substring(0, 80)}...`
              : agent.meta.descriptions
          }
        />
        <Flex
          direction="row"
          justify="start"
          style={{ width: '100%', flexShrink: 1 }}
          gap={2}
          wrap="wrap"
        >
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
};

const AgentCardList = ({ agents }: { agents: Agent[] }) => {
  const { styles } = useStyles();

  return (
    <List
      className={styles.cardList}
      grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 3 }}
      dataSource={agents}
      renderItem={(agent) => (
        <List.Item>
          <AgentCard agent={agent} />
        </List.Item>
      )}
    ></List>
  );
};

const AgentsPage: React.FC = () => {
  const { token } = theme.useToken();
  const { agents } = useAgents();

  console.log(agents);

  return (
    <Suspense
      fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
    >
      <div>Agents Page</div>
      <Flex
        direction="column"
        align="stretch"
        justify="center"
        gap="lg"
        style={{ padding: token.paddingLG }}
      >
        <AgentCardList agents={agents} />
      </Flex>
    </Suspense>
  );
};

export default AgentsPage;
