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
import { Field } from '@lablup/ui-common/Field';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAIModal,
  BAISelect,
  BAIUnmountAfterClose,
  type BAIModalProps,
} from 'backend.ai-ui';
import { Suspense, useId, useState } from 'react';
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

const isRecommended = (card: AssistantCard) =>
  !!card.metadata?.label?.includes(WEBUI_ASSISTANT_MODEL_CARD_LABEL);
const isTextGeneration = (card: AssistantCard) =>
  /text[-_ ]?generation|chat|llm/i.test(card.metadata?.task ?? '');

/** Recommended cards first, then chat-capable ones, then the rest by name. */
export function sortAssistantCards<T extends AssistantCard>(cards: T[]): T[] {
  const rank = (card: T) =>
    isRecommended(card) ? 0 : isTextGeneration(card) ? 1 : 2;
  return [...cards].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (a.metadata?.title || a.name).localeCompare(b.metadata?.title || b.name),
  );
}

/** "Start WebUI Assistant": the user picks a model-store card and deploys it. */
const WebUIAssistantSetupModal: React.FC<WebUIAssistantSetupModalProps> = (
  props,
) => {
  'use memo';

  const { id: storeProjectId } = useModelStoreProject();
  return storeProjectId ? (
    <SetupModalWithStore storeProjectId={storeProjectId} {...props} />
  ) : (
    <SetupModalView cards={[]} hasStore={false} {...props} />
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
                  task
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
  const cards = sortAssistantCards(
    (projectModelCardsV2?.edges ?? [])
      .map((edge) => edge?.node)
      .filter((node): node is AssistantCard => !!node),
  );

  return <SetupModalView cards={cards} hasStore {...props} />;
};

const SetupModalView: React.FC<
  WebUIAssistantSetupModalProps & {
    cards: AssistantCard[];
    hasStore: boolean;
  }
> = ({ cards, hasStore, onRequestClose, ...modalProps }) => {
  'use memo';

  const { t } = useTranslation();
  const selectId = useId();
  const { name: projectName } = useCurrentProjectValue();
  const { upsertEndpointBinding } = useAIAgent();
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [pickedId, setPickedId] = useState<string>();
  // ModelCardV2Filter has no label filter, so the recommended card is found here.
  const recommendedId = cards.find(isRecommended)?.id;
  const card = cards.find((c) => c.id === (pickedId ?? recommendedId));

  return (
    <BAIModal
      title={t('webuiAssistant.SetupTitle')}
      width={520}
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
        ) : cards.length === 0 ? (
          <Banner
            status="warning"
            title={t('webuiAssistant.NoModelCard')}
            description={t('webuiAssistant.NoModelCardDesc')}
          />
        ) : (
          <>
            <Field
              label={t('webuiAssistant.Model')}
              inputID={selectId}
              description={t('webuiAssistant.ModelHint', {
                label: WEBUI_ASSISTANT_MODEL_CARD_LABEL,
              })}
            >
              <BAISelect
                id={selectId}
                data-testid="webui-assistant-model-select"
                aria-label={t('webuiAssistant.Model')}
                showSearch
                placeholder={t('webuiAssistant.SelectModel')}
                style={{ width: '100%' }}
                value={card?.id}
                onChange={(value) => setPickedId(value as string)}
                options={cards.map((c) => ({
                  value: c.id,
                  label: c.metadata?.title || c.name,
                  description: [
                    isRecommended(c) ? t('webuiAssistant.Recommended') : '',
                    c.metadata?.task ?? '',
                  ]
                    .filter(Boolean)
                    .join(' · '),
                }))}
              />
            </Field>
            {card?.metadata?.description && (
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
          </>
        )}
      </BAIFlex>
      {card && (
        <Suspense fallback={null}>
          <BAIUnmountAfterClose>
            <ModelCardDeployModal
              key={card.id}
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
