/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebUISettingDefinition } from '../../../helper/webuiSettings';
import {
  importConfigToml,
  type ImportedSetting,
  type SkippedKey,
  type SkipReason,
} from '../helper/importConfigToml';
import { useWebUISettingLabels } from './WebUISettingLabels';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIAlert,
  BAIFileInput,
  BAIFlex,
  BAIModal,
  BAITable,
  BAITextArea,
} from 'backend.ai-ui';
import { useState } from 'react';
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

const formatValue = (value: unknown): string =>
  Array.isArray(value) ? value.join(', ') : String(value ?? '');

const ImportConfigTomlModal: React.FC<ImportConfigTomlModalProps> = ({
  open,
  currentValueOf,
  onLoad,
  onCancel,
}) => {
  'use memo';
  const { t } = useTranslation();
  const labels = useWebUISettingLabels();
  const [text, setText] = useState('');

  const result = text.trim() ? importConfigToml(text) : undefined;
  const imported = result?.ok ? result.imported : [];
  const skipped = result?.ok ? result.skipped : [];

  const reasonLabel: Record<SkipReason, string> = {
    fileOnly: t('webuiSettings.ImportReasonFileOnly'),
    unknown: t('webuiSettings.ImportReasonUnknown'),
    invalid: t('webuiSettings.ImportReasonInvalid'),
    empty: t('webuiSettings.ImportReasonEmpty'),
    duplicate: t('webuiSettings.ImportReasonDuplicate'),
  };

  const close = () => {
    setText('');
    onCancel();
  };

  return (
    <BAIModal
      open={open}
      title={t('webuiSettings.ImportConfigToml')}
      width={880}
      okText={t('webuiSettings.ImportLoad')}
      okButtonProps={{ disabled: imported.length === 0 }}
      onOk={() => {
        onLoad(imported);
        setText('');
      }}
      cancelText={t('button.Cancel')}
      onCancel={close}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Text>{t('webuiSettings.ImportConfigTomlDesc')}</Text>
        <BAIFileInput
          aria-label={t('webuiSettings.ImportFile')}
          accept=".toml,text/plain"
          maxSize={MAX_FILE_SIZE}
          onChange={async (file) => {
            const single = Array.isArray(file) ? file[0] : file;
            setText(single ? await single.text() : '');
          }}
        />
        <BAITextArea
          aria-label={t('webuiSettings.ImportPasteLabel')}
          placeholder={t('webuiSettings.ImportPasteLabel')}
          data-testid="import-config-toml-text"
          rows={8}
          width="100%"
          value={text}
          onChange={(value) => setText(value)}
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
          <BAIFlex direction="column" align="stretch" gap="xs">
            <Text weight="semibold">
              {t('webuiSettings.ImportPreview', { count: imported.length })}
            </Text>
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
                  key: 'imported',
                  title: t('webuiSettings.ImportColumnImported'),
                  render: (_v, entry) => formatValue(entry.value),
                },
                {
                  key: 'current',
                  title: t('webuiSettings.ImportColumnCurrent'),
                  render: (_v, entry) =>
                    formatValue(currentValueOf(entry.definition)),
                },
                {
                  key: 'scope',
                  title: t('webuiSettings.ImportColumnScope'),
                  render: (_v, entry) =>
                    entry.definition.scope === 'public'
                      ? t('webuiSettings.ImportScopePublic')
                      : t('webuiSettings.ImportScopeDomain'),
                },
              ]}
            />
          </BAIFlex>
        )}
        {skipped.length > 0 && (
          <BAIFlex direction="column" align="stretch" gap="xs">
            <Text weight="semibold">
              {t('webuiSettings.ImportSkipped', { count: skipped.length })}
            </Text>
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
          </BAIFlex>
        )}
      </BAIFlex>
    </BAIModal>
  );
};

export default ImportConfigTomlModal;
