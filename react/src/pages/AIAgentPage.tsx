/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentEditorModal from '../components/AgentEditorModal';
import { FluentEmojiIcon } from '../components/FluentEmojiIcon';
import { useWebUINavigate } from '../hooks';
import { AIAgent, useAIAgent } from '../hooks/useAIAgent';
import {
  DeleteFilled,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Dropdown,
  Row,
  Skeleton,
  Tag,
  Typography,
  theme,
} from 'antd';
import { createStyles } from 'antd-style';
import {
  BAICard,
  BAIFlex,
  BAIUnmountAfterClose,
  BAIDeleteConfirmModal,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
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
  };
});

interface AIAgentCardProps {
  agent: AIAgent;
  endpointLabel?: string;
  isOverridden?: boolean;
  onEdit?: (agent: AIAgent) => void;
  onDelete?: (agent: AIAgent) => void;
  onReset?: (agent: AIAgent) => void;
}

const AIAgentCard: React.FC<AIAgentCardProps> = ({
  agent,
  endpointLabel,
  isOverridden,
  onEdit,
  onDelete,
  onReset,
}) => {
  const { t } = useTranslation();
  const tags = agent.tags || [];
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
        icon: <DeleteFilled />,
        onClick: (e: { domEvent: React.MouseEvent | React.KeyboardEvent }) => {
          e.domEvent.stopPropagation();
          onDelete(agent);
        },
      },
  ]);

  return (
    <BAICard hoverable style={{ position: 'relative', width: '100%' }}>
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
        style={{ minHeight: '160px' }}
      >
        <BAIFlex direction="row" gap="md" align="start">
          <FluentEmojiIcon emoji={agent.icon} height={64} width={64} />
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xxs"
            style={{ flex: 1, minWidth: 0 }}
          >
            <Typography.Text strong style={{ whiteSpace: 'normal' }}>
              {agent.name}
            </Typography.Text>
            <Typography.Paragraph
              type="secondary"
              ellipsis={{ rows: 3 }}
              style={{ marginBottom: 0 }}
            >
              {agent.description}
            </Typography.Paragraph>
          </BAIFlex>
        </BAIFlex>
        <BAIFlex
          direction="row"
          justify="start"
          style={{ width: '100%', flexShrink: 1 }}
          gap={6}
          wrap="wrap"
        >
          {endpointLabel && (
            <Tag key={endpointLabel} color="orange-inverse">
              {endpointLabel}
            </Tag>
          )}
          {agent.isCustom && !isOverridden && (
            <Tag color="blue-inverse">{t('aiAgent.Custom')}</Tag>
          )}
          {isOverridden && <Tag color="orange">{t('aiAgent.Edited')}</Tag>}
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </BAIFlex>
      </BAIFlex>
    </BAICard>
  );
};

const AIAgentPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { agents, builtInAgents, deleteAgent, getEndpointBinding } =
    useAIAgent();
  const webuiNavigate = useWebUINavigate();
  const { styles } = useStyles();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | undefined>();
  const [deletingAgent, setDeletingAgent] = useState<AIAgent | null>(null);
  const [resettingAgent, setResettingAgent] = useState<AIAgent | null>(null);

  const builtInIds = new Set(builtInAgents.map((a) => a.id));

  const handleEdit = (agent: AIAgent) => {
    setEditingAgent(agent);
    setIsEditorOpen(true);
  };

  const handleDelete = (agent: AIAgent) => {
    setDeletingAgent(agent);
  };

  const handleReset = (agent: AIAgent) => {
    setResettingAgent(agent);
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
        <Row gutter={[16, 16]} className={styles.cardList}>
          {agents.map((agent) => {
            const isOverridden = !agent.isCustom
              ? false
              : builtInIds.has(agent.id);
            return (
              <Col
                key={agent.id}
                xs={24}
                sm={24}
                md={24}
                lg={12}
                xl={12}
                xxl={8}
                xxxl={6}
                style={{ display: 'flex' }}
                onClick={() => {
                  const searchParams: Record<string, string> = {
                    agentId: agent.id,
                  };
                  const binding = getEndpointBinding(agent.id);
                  if (binding?.endpoint_id) {
                    searchParams.endpointId = binding.endpoint_id;
                  }
                  webuiNavigate({
                    pathname: '/chat',
                    search: new URLSearchParams(searchParams).toString(),
                  });
                }}
              >
                <AIAgentCard
                  agent={agent}
                  endpointLabel={
                    getEndpointBinding(agent.id)?.endpoint ?? undefined
                  }
                  isOverridden={isOverridden}
                  onEdit={handleEdit}
                  onDelete={
                    agent.isCustom && !isOverridden ? handleDelete : undefined
                  }
                  onReset={isOverridden ? handleReset : undefined}
                />
              </Col>
            );
          })}
        </Row>
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
        <BAIDeleteConfirmModal
          open={!!deletingAgent}
          title={t('aiAgent.DeleteConfirmTitle')}
          target={t('general.AIAgent')}
          items={
            deletingAgent
              ? [{ key: deletingAgent.id, label: deletingAgent.name }]
              : []
          }
          confirmText={deletingAgent?.name ?? ''}
          requireConfirmInput
          inputProps={{ placeholder: deletingAgent?.name ?? '' }}
          onOk={() => {
            if (deletingAgent) {
              deleteAgent(deletingAgent.id);
            }
            setDeletingAgent(null);
          }}
          onCancel={() => setDeletingAgent(null)}
        />
        <BAIDeleteConfirmModal
          open={!!resettingAgent}
          title={t('aiAgent.ResetConfirmTitle')}
          target={t('general.AIAgent')}
          items={
            resettingAgent
              ? [{ key: resettingAgent.id, label: resettingAgent.name }]
              : []
          }
          confirmText={resettingAgent?.name ?? ''}
          requireConfirmInput
          inputProps={{ placeholder: resettingAgent?.name ?? '' }}
          okText={t('button.Reset')}
          onOk={() => {
            if (resettingAgent) {
              deleteAgent(resettingAgent.id);
            }
            setResettingAgent(null);
          }}
          onCancel={() => setResettingAgent(null)}
        />
      </BAIFlex>
    </Suspense>
  );
};

export default AIAgentPage;
