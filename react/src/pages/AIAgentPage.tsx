/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentEditorModal from '../components/AgentEditorModal';
import { FluentEmojiIcon } from '../components/FluentEmojiIcon';
import BAISkeletonAstryx from '../components/astryx-bui/BAISkeletonAstryx';
import { useWebUINavigate } from '../hooks';
import { AIAgent, useAIAgent } from '../hooks/useAIAgent';
import { useProjectPath } from '../hooks/useRouteScope';
import { theme } from '../theme-shim';
import './AIAgentPage.css';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import {
  DropdownMenu,
  type DropdownMenuOption,
} from '@astryxdesign/core/DropdownMenu';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIFlex,
  BAIUnmountAfterClose,
  BAIDeleteConfirmModal,
  badgeVariantForTagColor,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  Trash2,
  EllipsisVertical,
  Undo2,
  PlusIcon,
  SquarePenIcon,
} from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

// `.ant-*` selectors dropped (P6) — the hover-reveal rule now targets the
// converted card's own class (`.agent-card`, plain CSS file, P17: component-
// imported, not the app stylesheet) instead of antd's `.ant-card`.

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

  // PILOT-DECISION: antd `danger` (red text on "Delete Agent") has no
  // destination on Astryx `DropdownMenuItemData` (P5, closed shape, no
  // colour field) — dropped.
  const menuItems: DropdownMenuOption[] = _.compact([
    onEdit && {
      label: t('button.Edit'),
      icon: <SquarePenIcon />,
      onClick: () => onEdit(agent),
    },
    isOverridden &&
      onReset && {
        label: t('aiAgent.ResetToDefault'),
        icon: <Undo2 size="1em" />,
        onClick: () => onReset(agent),
      },
    agent.isCustom && onDelete && { type: 'divider' as const },
    agent.isCustom &&
      onDelete && {
        label: t('aiAgent.DeleteAgent'),
        icon: <Trash2 size="1em" />,
        onClick: () => onDelete(agent),
      },
  ]);

  return (
    <Card
      className="agent-card"
      style={{ position: 'relative', width: '100%', cursor: 'pointer' }}
    >
      {menuItems.length > 0 && (
        // Stops the click from bubbling to the parent grid item's
        // navigate-to-chat handler (antd's per-item `domEvent.stopPropagation()`
        // has no equivalent on Astryx `DropdownMenuItemData.onClick`, which
        // takes no event — caught one level up instead).
        <div
          style={{
            position: 'absolute',
            top: token.paddingXS,
            right: token.paddingXS,
            zIndex: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu
            items={menuItems}
            button={{
              variant: 'ghost',
              className: 'agent-more-button',
              icon: <EllipsisVertical size="1em" />,
              label: t('button.MoreActions'),
              isIconOnly: true,
              style: { color: token.colorTextSecondary, opacity: 0 },
            }}
          />
        </div>
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
            <Text weight="semibold" style={{ whiteSpace: 'normal' }}>
              {agent.name}
            </Text>
            <Text
              color="secondary"
              maxLines={3}
              as="p"
              style={{ marginBottom: 0 }}
            >
              {agent.description}
            </Text>
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
            <Badge
              key={endpointLabel}
              label={endpointLabel}
              variant={badgeVariantForTagColor('orange-inverse')}
            />
          )}
          {agent.isCustom && !isOverridden && (
            <Badge
              label={t('aiAgent.Custom')}
              variant={badgeVariantForTagColor('blue-inverse')}
            />
          )}
          {isOverridden && (
            <Badge
              label={t('aiAgent.Edited')}
              variant={badgeVariantForTagColor('orange')}
            />
          )}
          {tags.map((tag) => (
            <Badge key={tag} label={tag} variant="neutral" />
          ))}
        </BAIFlex>
      </BAIFlex>
    </Card>
  );
};

const AIAgentPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { agents, builtInAgents, deleteAgent, getEndpointBinding } =
    useAIAgent();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

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
    <Suspense fallback={<BAISkeletonAstryx rows={4} />}>
      <BAIFlex direction="column" align="stretch" justify="center" gap="sm">
        <BAIFlex direction="row" justify="end" align="center">
          <Button
            icon={<PlusIcon />}
            label={t('button.Add')}
            onClick={() => {
              setEditingAgent(undefined);
              setIsEditorOpen(true);
            }}
          />
        </BAIFlex>
        {/* PILOT-DECISION (RESPONSIVE-POLICY.md R1): antd `Row/Col
            xs={24} sm={24} md={24} lg={12} xl={12} xxl={8} xxxl={6}` — a
            uniform card grid that first goes 2-up at `lg` (992px) — becomes
            `Grid columns={{minWidth: 496, max: 4}}` (992/2 ≈ 496; max 4 from
            `xxxl={6}` = 24/6). Same recipe as ModelStoreListPageV2 (both
            flagged in the census as the repo's two `xxxl` sites). */}
        <Grid columns={{ minWidth: 496, max: 4 }} gap={4}>
          {agents.map((agent) => {
            const isOverridden = !agent.isCustom
              ? false
              : builtInIds.has(agent.id);
            return (
              <div
                key={agent.id}
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
                    pathname: buildProjectPath('chat'),
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
              </div>
            );
          })}
        </Grid>
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
