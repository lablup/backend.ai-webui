import Flex from '../components/Flex';
import { FluentEmojiIcon } from '../components/FluentEmojiIcon';
import { useWebUINavigate } from '../hooks';
import { AIAgent, useAIAgent } from '../hooks/useAIAgent';
import { Card, List, Skeleton, Tag, theme } from 'antd';
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
    meta: css`
      .ant-card-meta-description {
        max-height: 6.4em; // Adjusted for 4 lines
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ant-card-meta-title {
        white-space: normal;
      }
    `,
  };
});

const { Meta } = Card;

const AIAgentCard = ({ agent }: { agent: AIAgent }) => {
  const tags = agent.meta.tags || [];
  const { styles } = useStyles();
  const avatar =
    agent.type === 'external' ? (
      <img
        src={agent.meta.avatar}
        alt={agent.meta.title}
        height={150}
        width={150}
        style={{ borderRadius: '50%' }}
      />
    ) : (
      <FluentEmojiIcon name={agent.meta.avatar} height={150} width={150} />
    );

  return (
    <Card hoverable>
      <Flex
        direction="column"
        align="stretch"
        gap="xs"
        justify="between"
        style={{ minHeight: '200px' }}
      >
        <Meta
          title={agent.meta.title}
          avatar={avatar}
          description={agent.meta.descriptions}
          className={styles.meta}
        />
        <Flex
          direction="row"
          justify="start"
          style={{ width: '100%', flexShrink: 1 }}
          gap={6}
          wrap="wrap"
        >
          <Tag key={agent.endpoint} color={'orange-inverse'}>
            {agent.endpoint}
          </Tag>
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
};

const AIAgentCardList = ({
  agents,
  onClickAgent,
}: {
  agents: AIAgent[];
  onClickAgent: (agent: AIAgent) => void;
}) => {
  const { styles } = useStyles();

  return (
    <List
      className={styles.cardList}
      grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
      dataSource={agents}
      renderItem={(agent) => (
        <List.Item
          style={{ height: '100%' }}
          onClick={() => onClickAgent(agent)}
        >
          <AIAgentCard agent={agent} />
        </List.Item>
      )}
    ></List>
  );
};

const AIAgentPage: React.FC = () => {
  const { token } = theme.useToken();
  const { agents } = useAIAgent();
  const webuiNavigate = useWebUINavigate();

  return (
    <Suspense
      fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
    >
      <Flex direction="column" align="stretch" justify="center" gap="lg">
        <AIAgentCardList
          agents={agents}
          onClickAgent={(agent) => {
            if (agent.type === 'external') {
              webuiNavigate(`/ai-agent/external?url=${agent.config.url}`);
            } else {
              webuiNavigate(
                `/chat?endpointId=${agent.endpoint_id}&agentId=${agent.id}`,
              );
            }
          }}
        />
      </Flex>
    </Suspense>
  );
};

export default AIAgentPage;
