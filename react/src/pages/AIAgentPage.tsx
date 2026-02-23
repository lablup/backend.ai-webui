/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentEditorModal from '../components/AgentEditorModal';
import { FluentEmojiIcon } from '../components/FluentEmojiIcon';
import { useWebUINavigate } from '../hooks';
import { AIAgent, useAIAgent } from '../hooks/useAIAgent';
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Dropdown, List, Skeleton, Tag, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex, BAIUnmountAfterClose } from 'backend.ai-ui';
import _ from 'lodash';
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
      .ant-card:hover .agent-more-button {
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

interface AIAgentCardProps {
  agent: AIAgent;
  isOverridden?: boolean;
  onEdit?: (agent: AIAgent) => void;
  onDelete?: (agent: AIAgent) => void;
  onReset?: (agent: AIAgent) => void;
}

const AIAgentCard: React.FC<AIAgentCardProps> = ({
  agent,
  isOverridden,
  onEdit,
  onDelete,
  onReset,
}) => {
  const { t } = useTranslation();
  const tags = agent.meta.tags || [];
  const { styles } = useStyles();
  const { token } = theme.useToken();

  const menuItems = _.compact([
    onEdit && {
      key: 'edit',
      label: t('button.Edit'),
      icon: <EditOutlined />,
      onClick: (e: { domEvent: React.MouseEvent | React.KeyboardEvent }) => {
        e.domEvent.stopPropagation();
        onEdit(agent);
      },
    },
    isOverridden &&
      onReset && {
        key: 'reset',
        label: t('aiAgent.ResetToDefault'),
        icon: <UndoOutlined />,
        onClick: (e: { domEvent: React.MouseEvent | React.KeyboardEvent }) => {
          e.domEvent.stopPropagation();
          onReset(agent);
        },
      },
    agent.isCustom &&
      onDelete && {
        type: 'divider' as const,
      },
    agent.isCustom &&
      onDelete && {
        key: 'delete',
        danger: true,
        label: t('aiAgent.DeleteAgent'),
        icon: <DeleteOutlined />,
        onClick: (e: { domEvent: React.MouseEvent | React.KeyboardEvent }) => {
          e.domEvent.stopPropagation();
          onDelete(agent);
        },
      },
  ]);

  return (
    <Card hoverable style={{ position: 'relative' }}>
      {menuItems.length > 0 && (
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button
            type="text"
            className="agent-more-button"
            icon={<MoreOutlined />}
            size="small"
            style={{
              position: 'absolute',
              top: token.paddingXS,
              right: token.paddingXS,
              zIndex: 1,
              color: token.colorTextSecondary,
              opacity: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      )}
      <BAIFlex
        direction="column"
        align="stretch"
        gap="xs"
        justify="between"
        style={{ minHeight: '200px' }}
      >
        <Meta
          title={agent.meta.title}
          avatar={
            <FluentEmojiIcon
              emoji={agent.meta.avatar}
              height={150}
              width={150}
            />
          }
          description={agent.meta.descriptions}
          className={styles.meta}
        />
        <BAIFlex
          direction="row"
          justify="start"
          style={{ width: '100%', flexShrink: 1 }}
          gap={6}
          wrap="wrap"
        >
          {agent.endpoint && (
            <Tag key={agent.endpoint} color="orange-inverse">
              {agent.endpoint}
            </Tag>
          )}
          {agent.isCustom && !isOverridden && (
            <Tag color="blue-inverse">{t('aiAgent.Custom')}</Tag>
          )}
          {isOverridden && <Tag color="orange">{t('aiAgent.Edited')}</Tag>}
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </BAIFlex>
      </BAIFlex>
    </Card>
  );
};

const AIAgentPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { agents, builtInAgents, deleteAgent } = useAIAgent();
  const webuiNavigate = useWebUINavigate();
  const { modal } = App.useApp();
  const { styles } = useStyles();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | undefined>();

  const builtInIds = new Set(builtInAgents.map((a) => a.id));

  const handleEdit = (agent: AIAgent) => {
    setEditingAgent(agent);
    setIsEditorOpen(true);
  };

  const handleDelete = (agent: AIAgent) => {
    modal.confirm({
      title: t('aiAgent.DeleteConfirmTitle'),
      content: t('aiAgent.DeleteConfirmDescription'),
      okButtonProps: { danger: true },
      okText: t('button.Delete'),
      onOk: () => deleteAgent(agent.id),
    });
  };

  const handleReset = (agent: AIAgent) => {
    modal.confirm({
      title: t('aiAgent.ResetConfirmTitle'),
      content: t('aiAgent.ResetConfirmDescription'),
      onOk: () => deleteAgent(agent.id),
    });
  };

  return (
    <Suspense
      fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
    >
      <BAIFlex direction="column" align="stretch" justify="center" gap="sm">
        <BAIFlex direction="row" justify="end" align="center">
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingAgent(undefined);
              setIsEditorOpen(true);
            }}
          >
            {t('button.Add')}
          </Button>
        </BAIFlex>
        <List
          className={styles.cardList}
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
          dataSource={agents}
          renderItem={(agent) => {
            const isOverridden = !agent.isCustom
              ? false
              : builtInIds.has(agent.id);
            return (
              <List.Item
                style={{ height: '100%' }}
                onClick={() => {
                  const searchParams: Record<string, string> = {
                    agentId: agent.id,
                  };
                  if (agent.endpoint_id) {
                    searchParams.endpointId = agent.endpoint_id;
                  }
                  webuiNavigate({
                    pathname: '/chat',
                    search: new URLSearchParams(searchParams).toString(),
                  });
                }}
              >
                <AIAgentCard
                  agent={agent}
                  isOverridden={isOverridden}
                  onEdit={handleEdit}
                  onDelete={agent.isCustom && !isOverridden ? handleDelete : undefined}
                  onReset={isOverridden ? handleReset : undefined}
                />
              </List.Item>
            );
          }}
        />
        <BAIUnmountAfterClose>
          <AgentEditorModal
            open={isEditorOpen}
            agent={editingAgent}
            onRequestClose={() => {
              setIsEditorOpen(false);
              setEditingAgent(undefined);
            }}
          />
        </BAIUnmountAfterClose>
      </BAIFlex>
    </Suspense>
  );
};

export default AIAgentPage;
