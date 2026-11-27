/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../form-engine';
import BAIFormItem from './BAIFormItem';
import EndpointHistoryField, {
  type EndpointHistoryEntry,
} from './EndpointHistoryField';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import { BAIFlex, BAITextInput } from 'backend.ai-ui';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export interface LoginEndpointStepProps {
  defaultEndpoint: string;
  isConnecting: boolean;
  error: string | null;
  onContinue: (endpoint: string) => void;
  /** The saved endpoints, offered under the field as on the login form. */
  history?: EndpointHistoryEntry[];
  onDeleteEndpoint?: (endpoint: string) => void;
}

/**
 * The login's first step when config.toml pins no endpoint (always in
 * Electron): the server address, read before the login form so that form can
 * follow the server's own settings (#10872).
 */
const LoginEndpointStep: React.FC<LoginEndpointStepProps> = ({
  defaultEndpoint,
  isConnecting,
  error,
  onContinue,
  history = [],
  onDeleteEndpoint = () => {},
}) => {
  'use memo';
  const { t } = useTranslation();
  const [endpoint, setEndpoint] = useState(defaultEndpoint);

  const submit = () => {
    if (!isConnecting) onContinue(endpoint);
  };

  return (
    <Form layout="vertical">
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFormItem
          label={t('login.LoginEndpoint')}
          required
          tooltip={<Trans i18nKey="login.DescEndpoint" />}
          style={{ marginBottom: 0 }}
        >
          <EndpointHistoryField
            history={history}
            onSelect={setEndpoint}
            onDelete={onDeleteEndpoint}
          >
            <BAITextInput
              data-testid="login-endpoint-step-input"
              aria-label={t('login.LoginEndpoint', { postProcess: [] })}
              placeholder="https://"
              value={endpoint}
              disabled={isConnecting}
              onChange={(value) => setEndpoint(value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
          </EndpointHistoryField>
        </BAIFormItem>
        {error && <Banner role="alert" status="error" title={error} />}
        <Button
          data-testid="login-endpoint-step-continue"
          variant="primary"
          width="100%"
          onClick={submit}
          isLoading={isConnecting}
          isDisabled={endpoint.trim() === ''}
          label={t('login.Continue')}
        />
      </BAIFlex>
    </Form>
  );
};

export default LoginEndpointStep;
