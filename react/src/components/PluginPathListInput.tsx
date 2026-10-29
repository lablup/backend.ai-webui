/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isValidPluginPath,
  joinPluginPath,
  splitPluginPath,
} from '../helper/pluginPath';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, BAIUncontrolledInput } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleMinus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PluginPathRow {
  id: string;
  folder: string;
  file: string;
}

interface PluginPathListInputProps {
  /** Paths relative to `/dist/plugins/` without extension, e.g. `vendor/page`. */
  value: ReadonlyArray<string>;
  onChange: (value: Array<string>) => void;
}

const FOLDER_WIDTH = 280;
const FILE_WIDTH = 200;

const newRow = (path = ''): PluginPathRow => ({
  id: _.uniqueId('plugin-path-'),
  ...splitPluginPath(path),
});
const toRows = (value: ReadonlyArray<string>): Array<PluginPathRow> =>
  value.map((path) => newRow(path));
// A row without a file name is still being typed and is not a path yet.
const toValue = (rows: ReadonlyArray<PluginPathRow>): Array<string> =>
  rows
    .map(({ folder, file }) => joinPluginPath(folder, file))
    .filter((path) => splitPluginPath(path).file !== '');

/** One folder/file row per plugin path, with add and remove controls. */
const PluginPathListInput: React.FC<PluginPathListInputProps> = ({
  value,
  onChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [rows, setRows] = useState<Array<PluginPathRow>>(() => toRows(value));
  // An outside change (reset, apply) replaces the rows; our own commits do not.
  if (!_.isEqual(value, toValue(rows))) {
    setRows(toRows(value));
  }

  const update = (next: Array<PluginPathRow>) => {
    setRows(next);
    const nextValue = toValue(next);
    if (!_.isEqual(nextValue, value)) onChange(nextValue);
  };
  const patchRow = (id: string, patch: Partial<PluginPathRow>) =>
    update(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  return (
    <BAIFlex direction="column" gap="xs" align="start">
      {rows.length > 0 && (
        <BAIFlex direction="row" gap="xs">
          <Text color="secondary" style={{ width: FOLDER_WIDTH }}>
            {t('webuiSettings.PluginFolderPath')}
          </Text>
          <Text color="secondary" style={{ width: FILE_WIDTH }}>
            {t('webuiSettings.PluginFileName')}
          </Text>
        </BAIFlex>
      )}
      {rows.map((row) => {
        const path = joinPluginPath(row.folder, row.file);
        const isInvalid = row.file !== '' && !isValidPluginPath(path);
        return (
          <BAIFlex key={row.id} direction="row" gap="xs" align="center">
            <BAIUncontrolledInput
              label={t('webuiSettings.PluginFolderPath')}
              isLabelHidden
              defaultValue={row.folder}
              status={isInvalid ? 'error' : undefined}
              onCommit={(folder) => patchRow(row.id, { folder })}
              style={{ width: FOLDER_WIDTH }}
            />
            <BAIUncontrolledInput
              label={t('webuiSettings.PluginFileName')}
              isLabelHidden
              defaultValue={row.file}
              status={isInvalid ? 'error' : undefined}
              onCommit={(file) => patchRow(row.id, { file })}
              style={{ width: FILE_WIDTH }}
            />
            <IconButton
              icon={<CircleMinus size="1em" />}
              label={t('button.Delete')}
              variant="ghost"
              size="sm"
              onClick={() => update(rows.filter((r) => r.id !== row.id))}
            />
          </BAIFlex>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        icon={<Plus size="1em" />}
        label={t('webuiSettings.AddPluginPath')}
        onClick={() => update([...rows, newRow()])}
      />
    </BAIFlex>
  );
};

export default PluginPathListInput;
