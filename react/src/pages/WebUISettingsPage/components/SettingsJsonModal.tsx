/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../../app-shim';
import BAICodeEditor from '../../../components/BAICodeEditor';
import { downloadBlob } from '../../../helper/csv-util';
import type { WebUISettingDefinition } from '../../../helper/webuiSettings';
import {
  parseSettingsJson,
  toSettingsJson,
  type SettingsJsonIssue,
} from '../helper/settingsJson';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import { BAIAlert, BAIFlex, BAIModal, useBAILogger } from 'backend.ai-ui';
import { ExternalLink, Import } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Large enough for any real settings file, small enough to reject a wrong file early.
const MAX_FILE_SIZE = 1024 * 1024;

export interface SettingsJsonModalProps {
  open: boolean;
  /** The value the page shows now for a setting (saved, else the default). */
  currentValueOf: (definition: WebUISettingDefinition) => unknown;
  /** Loads the values into the page draft; saving stays with the page's Apply. */
  onLoad: (
    values: Array<{ definition: WebUISettingDefinition; value: unknown }>,
  ) => void;
  onCancel: () => void;
}

const SettingsJsonEditor: React.FC<Omit<SettingsJsonModalProps, 'open'>> = ({
  currentValueOf,
  onLoad,
  onCancel,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const current = () => JSON.stringify(toSettingsJson(currentValueOf), null, 2);
  const [text, setText] = useState(current);
  const [parseError, setParseError] = useState<string | null>(null);
  const [issues, setIssues] = useState<SettingsJsonIssue[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const edit = (next: string) => {
    setText(next);
    setParseError(null);
    setIssues([]);
  };

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      message.error(t('webuiSettings.ImportFileTooLarge'));
      return;
    }
    try {
      edit(await file.text());
    } catch (error) {
      logger.error('Failed to read the settings file', error);
      message.error(t('webuiSettings.ImportFileReadError'));
    }
  };

  const apply = () => {
    const result = parseSettingsJson(text);
    if (result.ok) {
      onLoad(result.values);
    } else if ('error' in result) {
      setParseError(result.error);
    } else {
      setIssues(result.issues);
    }
  };

  return (
    <BAIModal
      open
      title={t('webuiSettings.JsonConfig')}
      width={800}
      onCancel={onCancel}
      footer={
        <BAIFlex direction="row" justify="between" gap="xs">
          <BAIFlex gap="sm">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                void readFile(file);
              }}
            />
            <Button
              data-testid="webui-settings-json-import"
              icon={<Import size="1em" />}
              label={t('webuiSettings.ImportJson')}
              onClick={() => fileInputRef.current?.click()}
            />
            <Button
              data-testid="webui-settings-json-export"
              icon={<ExternalLink size="1em" />}
              label={t('webuiSettings.ExportJson')}
              onClick={() =>
                downloadBlob(
                  new Blob([current()], { type: 'application/json' }),
                  'webui-settings.json',
                )
              }
            />
          </BAIFlex>
          <BAIFlex gap="sm">
            <Button
              variant="secondary"
              label={t('button.Cancel')}
              onClick={onCancel}
            />
            <Button
              variant="primary"
              label={t('button.Apply')}
              onClick={apply}
            />
          </BAIFlex>
        </BAIFlex>
      }
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIAlert
          type="info"
          showIcon
          title={t('webuiSettings.JsonConfigDesc')}
        />
        <BAICodeEditor
          language="json"
          editable
          height={400}
          value={text}
          onChange={edit}
          options={{ ariaLabel: t('webuiSettings.JsonConfig') }}
        />
        {parseError && (
          <BAIAlert
            type="error"
            showIcon
            title={t('webuiSettings.JsonInvalid', { error: parseError })}
          />
        )}
        {issues.length > 0 && (
          <BAIAlert
            type="error"
            showIcon
            title={t('webuiSettings.JsonIssues')}
            description={
              <BAIFlex
                direction="column"
                align="stretch"
                data-testid="webui-settings-json-issues"
              >
                {issues.map(({ path, reason }) => (
                  <Text key={path}>
                    {reason === 'unknown'
                      ? t('webuiSettings.JsonIssueUnknown', { key: path })
                      : t('webuiSettings.JsonIssueInvalid', { key: path })}
                  </Text>
                ))}
              </BAIFlex>
            }
          />
        )}
      </BAIFlex>
    </BAIModal>
  );
};

/**
 * The System Settings as JSON: the values the page shows (saved, else the
 * default), editable, importable from a file and exportable as one.
 */
const SettingsJsonModal: React.FC<SettingsJsonModalProps> = ({
  open,
  ...props
}) => {
  'use memo';
  // Mounted per opening, so the editor starts from the page's values each time.
  return open ? <SettingsJsonEditor {...props} /> : null;
};

export default SettingsJsonModal;
