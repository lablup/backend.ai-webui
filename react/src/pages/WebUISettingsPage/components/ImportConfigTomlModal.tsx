/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../../app-shim';
import BAICodeEditor from '../../../components/BAICodeEditor';
import { downloadBlob } from '../../../helper/csv-util';
import type { WebUISettingDefinition } from '../../../helper/webuiSettings';
import {
  exportConfigToml,
  importConfigToml,
  type ImportedSetting,
  type SkippedKey,
  type SkipReason,
} from '../helper/importConfigToml';
import ImportedValueCell from './ImportedValueCell';
import { useWebUISettingLabels } from './WebUISettingLabels';
import { Button } from '@lablup/ui-common/Button';
import { Collapsible } from '@lablup/ui-common/Collapsible';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIAlert,
  BAIFlex,
  BAIModal,
  BAITable,
  useBAILogger,
} from 'backend.ai-ui';
import { ExternalLink, Import } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Large enough for any real config.toml, small enough to reject a wrong file early.
const MAX_FILE_SIZE = 1024 * 1024;

export interface ImportConfigTomlModalProps {
  open: boolean;
  /** The value the page shows now for a setting (draft, else default). */
  currentValueOf: (definition: WebUISettingDefinition) => unknown;
  /** Loads the values into the page draft; saving stays with the page's Apply. */
  onLoad: (imported: ImportedSetting[]) => void;
  onCancel: () => void;
}

const ImportConfigTomlModal: React.FC<ImportConfigTomlModalProps> = ({
  open,
  currentValueOf,
  onLoad,
  onCancel,
}) => {
  'use memo';
  const { t } = useTranslation();
  const labels = useWebUISettingLabels();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const [text, setText] = useState('');
  // Values edited in the preview, by setting key; a new file clears them.
  const [edits, setEdits] = useState<Record<string, unknown>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const result = text.trim() ? importConfigToml(text) : undefined;
  const imported = (result?.ok ? result.imported : []).map((entry) =>
    entry.definition.key in edits
      ? { ...entry, value: edits[entry.definition.key] }
      : entry,
  );
  const skipped = result?.ok ? result.skipped : [];

  const reasonLabel: Record<SkipReason, string> = {
    fileOnly: t('webuiSettings.ImportReasonFileOnly'),
    unknown: t('webuiSettings.ImportReasonUnknown'),
    invalid: t('webuiSettings.ImportReasonInvalid'),
    empty: t('webuiSettings.ImportReasonEmpty'),
    duplicate: t('webuiSettings.ImportReasonDuplicate'),
  };

  const replaceText = (next: string) => {
    setText(next);
    setEdits({});
  };

  const close = () => {
    replaceText('');
    onCancel();
  };

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      message.error(t('webuiSettings.ImportFileTooLarge'));
      return;
    }
    try {
      replaceText(await file.text());
    } catch (error) {
      logger.error('Failed to read the config.toml file', error);
      message.error(t('webuiSettings.ImportFileReadError'));
    }
  };

  const load = () => {
    onLoad(imported);
    replaceText('');
  };

  return (
    <BAIModal
      open={open}
      title={t('webuiSettings.ImportConfigToml')}
      width={880}
      onCancel={close}
      footer={
        <BAIFlex direction="row" justify="between" gap="xs">
          <BAIFlex gap="sm">
            <input
              ref={fileInputRef}
              type="file"
              accept=".toml,text/plain"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                void readFile(file);
              }}
            />
            <Button
              data-testid="import-config-toml-file"
              icon={<Import size="1em" />}
              label={t('webuiSettings.ImportFromFile')}
              onClick={() => fileInputRef.current?.click()}
            />
            <Button
              data-testid="import-config-toml-export"
              icon={<ExternalLink size="1em" />}
              label={t('webuiSettings.ExportToFile')}
              onClick={() =>
                downloadBlob(
                  new Blob([exportConfigToml(currentValueOf)], {
                    type: 'application/toml',
                  }),
                  'config.toml',
                )
              }
            />
          </BAIFlex>
          <BAIFlex gap="sm">
            <Button
              variant="secondary"
              label={t('button.Cancel')}
              onClick={close}
            />
            <Button
              variant="primary"
              label={t('button.Apply')}
              isDisabled={imported.length === 0}
              onClick={load}
            />
          </BAIFlex>
        </BAIFlex>
      }
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIAlert
          type="info"
          showIcon
          title={t('webuiSettings.ImportConfigTomlDesc')}
        />
        <BAICodeEditor
          language="toml"
          height={240}
          value={text}
          options={{ ariaLabel: t('webuiSettings.ImportPasteLabel') }}
        />
        {result && !result.ok && (
          <BAIAlert
            type="error"
            showIcon
            title={t('webuiSettings.ImportParseError', {
              error: result.error,
            })}
          />
        )}
        {result?.ok && imported.length === 0 && (
          <BAIAlert
            type="warning"
            showIcon
            title={t('webuiSettings.ImportNothing')}
          />
        )}
        {imported.length > 0 && (
          <Collapsible
            defaultIsOpen={false}
            chevronPosition="start"
            trigger={
              <Text weight="semibold">
                {t('webuiSettings.ImportPreview', { count: imported.length })}
              </Text>
            }
          >
            <BAITable<ImportedSetting>
              data-testid="import-config-toml-preview"
              size="small"
              rowKey={(entry) => entry.definition.key}
              dataSource={imported}
              pagination={false}
              columns={[
                {
                  key: 'setting',
                  title: t('webuiSettings.ImportColumnSetting'),
                  render: (_v, entry) =>
                    labels.items[entry.definition.key]?.title ??
                    entry.definition.key,
                },
                {
                  key: 'path',
                  title: t('webuiSettings.ImportColumnSettingKey'),
                  dataIndex: 'path',
                },
                {
                  key: 'value',
                  title: t('webuiSettings.ImportColumnValue'),
                  render: (_v, entry) => (
                    <ImportedValueCell
                      definition={entry.definition}
                      label={
                        labels.items[entry.definition.key]?.title ??
                        entry.definition.key
                      }
                      value={entry.value}
                      onChange={(value) =>
                        setEdits((prev) => ({
                          ...prev,
                          [entry.definition.key]: value,
                        }))
                      }
                    />
                  ),
                },
              ]}
            />
          </Collapsible>
        )}
        {skipped.length > 0 && (
          <Collapsible
            defaultIsOpen={false}
            chevronPosition="start"
            trigger={
              <Text weight="semibold">
                {t('webuiSettings.ImportSkipped', { count: skipped.length })}
              </Text>
            }
          >
            <BAITable<SkippedKey>
              data-testid="import-config-toml-skipped"
              size="small"
              rowKey="path"
              dataSource={skipped}
              pagination={false}
              columns={[
                {
                  key: 'path',
                  title: t('webuiSettings.ImportColumnKey'),
                  dataIndex: 'path',
                },
                {
                  key: 'reason',
                  title: t('webuiSettings.ImportColumnReason'),
                  render: (_v, entry) => reasonLabel[entry.reason],
                },
              ]}
            />
          </Collapsible>
        )}
      </BAIFlex>
    </BAIModal>
  );
};

export default ImportConfigTomlModal;
