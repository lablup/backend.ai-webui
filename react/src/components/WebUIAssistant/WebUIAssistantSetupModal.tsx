/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  WebUIAssistantSetupModalQuery,
  WebUIAssistantSetupModalQuery$data,
} from '../../__generated__/WebUIAssistantSetupModalQuery.graphql';
import { useAIAgent } from '../../hooks/useAIAgent';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { useModelStoreProject } from '../../hooks/useModelStoreProject';
import ModelCardDeployModal from '../ModelCardDeployModal';
import {
  WEBUI_ASSISTANT_AGENT_ID,
  WEBUI_ASSISTANT_MODEL_CARD_LABEL,
} from './webUIAssistantPrompt';
import { Banner } from '@lablup/ui-common/Banner';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAIModal,
  BAIUnmountAfterClose,
  type BAIModalProps,
} from 'backend.ai-ui';
import { Suspense, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type AssistantCard = NonNullable<
  NonNullable<
    NonNullable<
      WebUIAssistantSetupModalQuery$data['projectModelCardsV2']
    >['edges'][number]
  >['node']
>;

export interface WebUIAssistantSetupModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel' | 'children'
> {
  onRequestClose: () => void;
}

/** "Start WebUI Assistant": finds the assistant's model card and deploys it. */
const WebUIAssistantSetupModal: React.FC<WebUIAssistantSetupModalProps> = (
  props,
) => {
  'use memo';

  const { id: storeProjectId } = useModelStoreProject();
  return storeProjectId ? (
    <SetupModalWithStore storeProjectId={storeProjectId} {...props} />
  ) : (
    <SetupModalView card={null} hasStore={false} {...props} />
  );
};

const SetupModalWithStore: React.FC<
  WebUIAssistantSetupModalProps & { storeProjectId: string }
> = ({ storeProjectId, ...props }) => {
  'use memo';

  const { projectModelCardsV2 } =
    useLazyLoadQuery<WebUIAssistantSetupModalQuery>(
      graphql`
        query WebUIAssistantSetupModalQuery($projectId: UUID!) {
          projectModelCardsV2(scope: { projectId: $projectId }, limit: 100) {
            edges {
              node {
                id
                name
                metadata {
                  title
                  description
                  label
                }
                ...ModelCardDeployModalFragment
              }
            }
          }
        }
      `,
      { projectId: storeProjectId },
      { fetchPolicy: 'network-only' },
    );
  // ModelCardV2Filter has no label filter, so the match happens here.
  const card =
    projectModelCardsV2?.edges
      .map((edge) => edge?.node)
      .find((node) =>
        node?.metadata?.label?.includes(WEBUI_ASSISTANT_MODEL_CARD_LABEL),
      ) ?? null;

  return <SetupModalView card={card} hasStore {...props} />;
};

const SetupModalView: React.FC<
  WebUIAssistantSetupModalProps & {
    card: AssistantCard | null;
    hasStore: boolean;
  }
> = ({ card, hasStore, onRequestClose, ...modalProps }) => {
  'use memo';

  const { t } = useTranslation();
  const { name: projectName } = useCurrentProjectValue();
  const { upsertEndpointBinding } = useAIAgent();
  const [isDeployOpen, setIsDeployOpen] = useState(false);

  return (
    <BAIModal
      title={t('webuiAssistant.SetupTitle')}
      width={480}
      okText={t('webuiAssistant.StartModel')}
      okButtonProps={{ disabled: !card }}
      onOk={() => setIsDeployOpen(true)}
      onCancel={onRequestClose}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Text>{t('webuiAssistant.SetupDescription')}</Text>
        {!hasStore ? (
          <Banner
            status="warning"
            title={t('webuiAssistant.NoModelStore')}
            description={t('webuiAssistant.AskAdministrator')}
          />
        ) : !card ? (
          <Banner
            status="warning"
            title={t('webuiAssistant.NoModelCard')}
            description={t('webuiAssistant.NoModelCardDesc', {
              label: WEBUI_ASSISTANT_MODEL_CARD_LABEL,
            })}
          />
        ) : (
          <BAIFlex direction="column" align="stretch" gap="xs">
            <Text weight="semibold">{card.metadata?.title || card.name}</Text>
            {card.metadata?.description && (
              <Text color="secondary" size="sm">
                {card.metadata.description}
              </Text>
            )}
            <Text color="secondary" size="sm">
              <Trans
                i18nKey="webuiAssistant.DeployTarget"
                values={{ project: projectName ?? '' }}
                components={{ strong: <strong /> }}
              />
            </Text>
          </BAIFlex>
        )}
      </BAIFlex>
      {card && (
        <Suspense fallback={null}>
          <BAIUnmountAfterClose>
            <ModelCardDeployModal
              open={isDeployOpen}
              modelCardFrgmt={card}
              navigateOnDeployed={false}
              onClose={() => setIsDeployOpen(false)}
              onDeployed={(deploymentId) => {
                upsertEndpointBinding(WEBUI_ASSISTANT_AGENT_ID, {
                  endpoint_id: deploymentId,
                });
                setIsDeployOpen(false);
                onRequestClose();
              }}
            />
          </BAIUnmountAfterClose>
        </Suspense>
      )}
    </BAIModal>
  );
};

export default WebUIAssistantSetupModal;
