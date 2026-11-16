/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { WebUIAssistantTurnOffModalDeleteMutation } from '../../__generated__/WebUIAssistantTurnOffModalDeleteMutation.graphql';
import { App } from '../../app-shim';
import { useAIAgent } from '../../hooks/useAIAgent';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { WEBUI_ASSISTANT_AGENT_ID } from './webUIAssistantPrompt';
import { Text } from '@lablup/ui-common/Text';
import {
  BAICheckboxInput,
  BAIFlex,
  BAIModal,
  useErrorMessageResolver,
  useMutationWithPromise,
  type BAIModalProps,
} from 'backend.ai-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql } from 'react-relay';

export interface WebUIAssistantTurnOffModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel' | 'children'
> {
  onRequestClose: () => void;
}

/** Turns the assistant off; by default also deletes its deployment to free the resources. */
const WebUIAssistantTurnOffModal: React.FC<WebUIAssistantTurnOffModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const { getEndpointBinding, upsertEndpointBinding } = useAIAgent();
  const [, setEnabled] = useBAISettingUserState('experimental_webui_assistant');
  const [shouldDelete, setShouldDelete] = useState(true);
  const deploymentId = getEndpointBinding(
    WEBUI_ASSISTANT_AGENT_ID,
  )?.endpoint_id;

  const deleteDeployment =
    useMutationWithPromise<WebUIAssistantTurnOffModalDeleteMutation>(graphql`
      mutation WebUIAssistantTurnOffModalDeleteMutation(
        $input: DeleteDeploymentInput!
      ) {
        deleteModelDeployment(input: $input) {
          id
        }
      }
    `);

  const turnOff = async () => {
    if (shouldDelete && deploymentId) {
      try {
        await deleteDeployment({ input: { id: deploymentId } });
      } catch (error) {
        message.error(getErrorMessage(error));
        throw error;
      }
    }
    upsertEndpointBinding(WEBUI_ASSISTANT_AGENT_ID, null);
    setEnabled(false);
    onRequestClose();
  };

  return (
    <BAIModal
      title={t('webuiAssistant.TurnOffTitle')}
      width={440}
      okText={t('webuiAssistant.TurnOff')}
      okButtonProps={{ danger: shouldDelete && !!deploymentId }}
      onOk={turnOff}
      onCancel={onRequestClose}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Text>{t('webuiAssistant.TurnOffDescription')}</Text>
        {deploymentId && (
          <BAICheckboxInput
            value={shouldDelete}
            onChange={(checked) => setShouldDelete(!!checked)}
          >
            {t('webuiAssistant.AlsoDeleteDeployment')}
          </BAICheckboxInput>
        )}
      </BAIFlex>
    </BAIModal>
  );
};

export default WebUIAssistantTurnOffModal;
