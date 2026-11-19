/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getAIErrorMessage } from '../Chat/ChatModel';
import { useWebUIAssistantModel } from '../WebUIAssistant/useWebUIAssistantModel';
import {
  buildPanelPrompt,
  parsePanelReply,
  type PanelDraft,
  type PanelSourceSpec,
} from './panelFromRequest';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, BAITextInput } from 'backend.ai-ui';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardPanelRequestProps {
  sources: ReadonlyArray<PanelSourceSpec>;
  /** Fills the panel modal's fields; its preview then shows the result. */
  onDraft: (draft: PanelDraft) => void;
}

/**
 * The panel modal's natural-language input: the WebUI Assistant's model turns a
 * description into the modal's fields. Renders nothing while the assistant is
 * off or not connected.
 */
const DashboardPanelRequest: React.FC<DashboardPanelRequestProps> = ({
  sources,
  onDraft,
}) => {
  'use memo';
  const { t } = useTranslation();
  const model = useWebUIAssistantModel();
  const [request, setRequest] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [result, setResult] = useState<
    | { status: 'filled' }
    | { status: 'none' }
    | { status: 'error'; message: string }
    | null
  >(null);

  if (!model.isAvailable) return null;

  const ask = async () => {
    const text = request.trim();
    if (!text || isAsking) return;
    setResult(null);
    setIsAsking(true);
    try {
      const reply = await model.complete({
        system: buildPanelPrompt(sources),
        prompt: text,
      });
      const draft = parsePanelReply(reply, sources);
      if (draft) {
        onDraft(draft);
        setResult({ status: 'filled' });
      } else {
        setResult({ status: 'none' });
      }
    } catch (e) {
      setResult({ status: 'error', message: getAIErrorMessage(e) });
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="xs"
      style={{ marginBottom: 'var(--spacing-4)' }}
    >
      <BAIFlex gap="xs" align="center">
        <Sparkles size="1em" aria-hidden />
        <Text weight="semibold">{t('webuiAssistant.PanelAskTitle')}</Text>
      </BAIFlex>
      <BAIFlex gap="xs" align="center">
        <BAITextInput
          value={request}
          onChange={(value) => setRequest(value)}
          placeholder={t('webuiAssistant.PanelAskPlaceholder')}
          aria-label={t('webuiAssistant.PanelAskTitle')}
          onEnter={() => void ask()}
          width="100%"
        />
        <Button
          label={t('webuiAssistant.PanelAsk')}
          isDisabled={!request.trim()}
          isLoading={isAsking}
          onClick={() => void ask()}
        />
      </BAIFlex>
      {result?.status === 'filled' ? (
        <Text size="sm" color="secondary">
          {t('webuiAssistant.PanelFilled')}
        </Text>
      ) : null}
      {result?.status === 'none' ? (
        <Text size="sm" color="secondary">
          {t('webuiAssistant.PanelNotUnderstood')}
        </Text>
      ) : null}
      {result?.status === 'error' ? (
        <Banner status="error" title={result.message} role="alert" />
      ) : null}
    </BAIFlex>
  );
};

export default DashboardPanelRequest;
