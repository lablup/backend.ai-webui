/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AGENT_PREFILL_PARAM } from '../helper/webmcpSessionPrefill';
import { useWebUILocation } from '../hooks';
import { BAIAlert } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** Tells the user an AI agent filled the launcher (`bai_prepare_session`). */
const SessionLauncherAgentPrefillNotice: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { search } = useWebUILocation();
  const prefillId = new URLSearchParams(search).get(AGENT_PREFILL_PARAM);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  if (!prefillId || dismissedId === prefillId) return null;
  return (
    <BAIAlert
      type="warning"
      title={t('session.launcher.AgentPrefilledTitle')}
      description={t('session.launcher.AgentPrefilledDescription', {
        launch: t('session.launcher.Launch'),
      })}
      closable
      onClose={() => setDismissedId(prefillId)}
      data-testid="session-launcher-agent-prefill-notice"
    />
  );
};

export default SessionLauncherAgentPrefillNotice;
