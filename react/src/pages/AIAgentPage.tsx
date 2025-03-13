import AgentEditorModal from '../components/AgentEditorModal';
import Flex from '../components/Flex';
import { FluentEmojiIcon } from '../components/FluentEmojiIcon';
import { useWebUINavigate } from '../hooks';
import { AIAgent, useAIAgent } from '../hooks/useAIAgent';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, List, Skeleton, Tag, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { MoreVerticalIcon } from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => {
  return {
    cardList: css`
      .and-col {
        height: calc(100% - ${token.marginMD});
      }
      .ant-tag {
        margin-inline-end: 0;
      }

      .ant-card:hover .more-button {
        /* display: block; */
        opacity: 1 !important;
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

const AIAgentCard = ({
  agent,
  onClickMore,
}: {
  agent: AIAgent;
  onClickMore?: (agent: AIAgent) => void;
}) => {
  const tags = agent.meta.tags || [];
  const { styles } = useStyles();
  const { token } = theme.useToken();
  return (
    <Card hoverable>
      <Flex
        direction="column"
        align="stretch"
        gap="xs"
        justify="between"
        style={{ minHeight: '200px' }}
      >
        {onClickMore && (
          <Button
            type="text"
            className="more-button"
            icon={<MoreVerticalIcon />}
            size="small"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 1,
              marginRight: token.marginXS * -1,
              color: token.colorTextSecondary,
              opacity: 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClickMore(agent);
            }}
          />
        )}
        <Meta
          title={agent.meta.title}
          avatar={
            <FluentEmojiIcon
              name={agent.meta.avatar}
              height={150}
              width={150}
            />
          }
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
  onClickMore,
}: {
  agents: AIAgent[];
  onClickAgent: (agent: AIAgent) => void;
  onClickMore?: (agent: AIAgent) => void;
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
          <AIAgentCard agent={agent} onClickMore={onClickMore} />
        </List.Item>
      )}
    ></List>
  );
};

const AIAgentPage: React.FC = () => {
  const { token } = theme.useToken();
  const { agents } = useAIAgent();
  const webuiNavigate = useWebUINavigate();
  const { t } = useTranslation();
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>();
  return (
    <Suspense
      fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
    >
      <Flex direction="column" align="stretch" justify="center" gap="sm">
        <Flex direction="row" justify="between" align="center">
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('webui.menu.AIAgents')}
          </Typography.Title>
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setIsCreatingAgent(true);
            }}
          >
            {t('button.Add')}
          </Button>
        </Flex>
        <AIAgentCardList
          agents={agents}
          onClickAgent={(agent) => {
            webuiNavigate(
              `/chat?endpointId=${agent.endpoint_id}&agentId=${agent.id}`,
            );
          }}
          onClickMore={(agent) => {
            setSelectedAgent(agent);
            setIsCreatingAgent(true);
          }}
        />
        <AgentEditorModal
          open={isCreatingAgent || selectedAgent !== undefined}
          agent={selectedAgent}
          onRequestClose={() => {
            setIsCreatingAgent(false);
            setSelectedAgent(undefined);
          }}
        />
      </Flex>
    </Suspense>
  );
};

export default AIAgentPage;
