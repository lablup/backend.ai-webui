/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ChatHeader_Deployment$key } from '../../__generated__/ChatHeader_Deployment.graphql';
import { useWebUINavigate } from '../../hooks';
import { AIAgent, useAIAgent } from '../../hooks/useAIAgent';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useProjectPath } from '../../hooks/useRouteScope';
import { theme } from '../../theme-shim';
import AIAgentSelect from './AIAgentSelect';
import type { ChatModel, ChatParameters } from './ChatModel';
import { ChatParametersSliders } from './ChatParametersSliders';
import DeploymentSelectAstryx, {
  DeploymentSelectAstryxProps,
} from './DeploymentSelectAstryx';
import ModelSelect from './ModelSelect';
import {
  DropdownMenu,
  type DropdownMenuOption,
} from '@astryxdesign/core/DropdownMenu';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Popover } from '@astryxdesign/core/Popover';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { filterOutEmpty, BAIFlex, toLocalId } from 'backend.ai-ui';
import { isEmpty } from 'lodash-es';
import {
  X,
  SlidersHorizontal,
  EllipsisVertical,
  ScaleIcon,
  EraserIcon,
  ToggleRightIcon,
  ToggleLeftIcon,
  ArrowRightLeftIcon,
} from 'lucide-react';
import React, { startTransition, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SyncSwitchProps {
  sync: boolean;
  onClick: (sync: boolean) => void;
}

const SyncSwitch: React.FC<SyncSwitchProps> = ({ sync, onClick }) => {
  const { t } = useTranslation();
  return (
    <>
      <Tooltip content={t('chatui.SyncInput')}>
        <IconButton
          variant="ghost"
          icon={sync ? <ToggleRightIcon /> : <ToggleLeftIcon />}
          label={t('chatui.SyncInput')}
          onClick={() => onClick(!sync)}
          style={{
            marginLeft: 8,
            color: sync ? 'var(--color-accent)' : undefined,
          }}
        />
      </Tooltip>
    </>
  );
};

interface ChatHeaderProps {
  showCompareMenuItem?: boolean;
  closable?: boolean;
  cloneable?: boolean;
  models: ChatModel[];
  modelId: string;
  onChangeModel: (modelId: string) => void;
  deploymentFrgmt?: ChatHeader_Deployment$key | null;
  onChangeDeployment: DeploymentSelectAstryxProps['onChange'];
  agents: AIAgent[];
  agent?: AIAgent;
  onChangeAgent: (agent: AIAgent) => void;
  sync: boolean;
  onChangeSync: (sync: boolean) => void;
  fetchKey: string;
  onClearMessage?: () => void;
  onRemoveChat?: () => void;
  onAddChat?: () => void;
  parameters: ChatParameters;
  usingParameters: boolean;
  onChangeParameter: (
    usingParameters: boolean,
    parameters: ChatParameters,
  ) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  showCompareMenuItem,
  closable,
  cloneable,
  models,
  modelId,
  onChangeModel,
  deploymentFrgmt,
  onChangeDeployment,
  agent,
  onChangeAgent,
  sync,
  onChangeSync,
  onRemoveChat,
  onAddChat,
  fetchKey,
  parameters,
  usingParameters,
  onChangeParameter,
  onClearMessage,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

  const [isPendingDeploymentTransition, startDeploymentTransition] =
    useTransition();
  const [isPendingAgentTransition, startAgentTransition] = useTransition();

  // Using fragment instead of just the id to support future DeploymentSelect extensions
  const deployment = useFragment(
    graphql`
      fragment ChatHeader_Deployment on ModelDeployment {
        id
        metadata {
          name
        }
      }
    `,
    deploymentFrgmt,
  );
  // The `deployments` chatting tab and DeploymentSelect both address a
  // deployment by its local UUID, while the Strawberry node exposes the global
  // Relay ID.
  const deploymentId = deployment?.id ? toLocalId(deployment.id) : undefined;

  // PILOT-DECISION: antd `danger` (red text on the "Delete Chatting Session"
  // item) has no destination on Astryx `DropdownMenuItemData` (no color/
  // variant field, closed shape) — dropped (P5: closed enum, no colour
  // escape hatch).
  const items: DropdownMenuOption[] = filterOutEmpty([
    showCompareMenuItem && {
      label: t('chatui.CompareWithOtherModels'),
      icon: <ScaleIcon />,
      onClick: () => {
        webuiNavigate({
          pathname: buildProjectPath('deployments'),
          search: new URLSearchParams({
            tab: 'chatting',
            endpointId: deploymentId ?? '',
            modelId: modelId,
          }).toString(),
        });
      },
    },
    showCompareMenuItem && {
      type: 'divider' as const,
    },
    {
      label: t('chatui.DeleteChatHistory'),
      icon: <EraserIcon />,
      onClick: () => {
        onClearMessage?.();
      },
    },
    closable && {
      type: 'divider' as const,
    },
    closable && {
      label: t('chatui.DeleteChattingSession'),
      icon: <X size="1em" />,
      onClick: () => {
        onRemoveChat?.();
      },
    },
  ]);

  const [experimentalAIAgents] = useBAISettingUserState(
    'experimental_ai_agents',
  );
  const { getEndpointBinding } = useAIAgent();
  const agentBinding = agent ? getEndpointBinding(agent.id) : undefined;

  return (
    <BAIFlex
      direction="row"
      justify="start"
      wrap="wrap"
      gap="xs"
      style={{
        minHeight: '56px',
        width: '100%',
        paddingTop: token.paddingXS,
        paddingBottom: token.paddingXS,
      }}
    >
      <BAIFlex
        wrap="wrap"
        align="start"
        gap="xs"
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 'auto',
        }}
      >
        {experimentalAIAgents && (
          <AIAgentSelect
            loading={isPendingAgentTransition}
            value={agent?.id}
            onChange={(_, agent: any) => {
              startAgentTransition(() => {
                onChangeAgent(agent);
              });
            }}
          />
        )}
        {!agentBinding?.endpoint_url && (
          <DeploymentSelectAstryx
            fetchKey={fetchKey}
            isLoading={isPendingDeploymentTransition}
            onChange={(id) => {
              startDeploymentTransition(() => {
                onChangeDeployment?.(id);
              });
            }}
            value={deploymentId}
            showDetailPageButton
          />
        )}
        {!isEmpty(models) && (
          <ModelSelect
            models={models}
            deploymentName={deployment?.metadata.name}
            value={modelId}
            onChange={(modelId) => {
              startTransition(() => {
                onChangeModel(modelId);
              });
            }}
          />
        )}
      </BAIFlex>
      <BAIFlex style={{ zIndex: 1 }}>
        {closable && (
          <SyncSwitch
            sync={sync}
            onClick={(checked) => {
              startTransition(() => {
                onChangeSync(checked);
              });
            }}
          />
        )}
        <Popover
          content={
            <ChatParametersSliders
              parameters={parameters}
              usingParameters={usingParameters}
              onChangeParameter={(usingParameters, parameters) => {
                startTransition(() => {
                  onChangeParameter(usingParameters, parameters);
                });
              }}
            />
          }
          placement="below"
          alignment="start"
          style={{
            padding: token.paddingXS,
          }}
        >
          <Tooltip content={t('chatui.chat.parameter.Title')}>
            <IconButton
              variant="ghost"
              label={t('chatui.chat.parameter.Title')}
              icon={
                <SlidersHorizontal
                  style={{
                    color: usingParameters ? 'var(--color-accent)' : undefined,
                  }}
                  size="1em"
                />
              }
            />
          </Tooltip>
        </Popover>
        {cloneable && (
          <Tooltip content={t('chatui.CreateCompareChat')}>
            <IconButton
              variant="ghost"
              label={t('chatui.CreateCompareChat')}
              onClick={() => onAddChat?.()}
              icon={<ArrowRightLeftIcon />}
            />
          </Tooltip>
        )}
        <DropdownMenu
          items={items}
          button={{
            variant: 'ghost',
            icon: <EllipsisVertical size="1em" />,
            label: t('button.MoreActions'),
            isIconOnly: true,
            style: { color: token.colorTextSecondary },
          }}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default ChatHeader;
