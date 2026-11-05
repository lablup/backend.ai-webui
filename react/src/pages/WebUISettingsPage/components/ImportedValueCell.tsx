/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isValidWebUISettingValue,
  restrictToOptions,
  type WebUISettingDefinition,
} from '../../../helper/webuiSettings';
import './ImportedValueCell.css';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAIMultiSelector,
  BAINumberInput,
  BAISwitch,
  BAITextInput,
} from 'backend.ai-ui';
import { Check, SquarePenIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ImportedValueCellProps {
  definition: WebUISettingDefinition;
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

export const formatSettingValue = (value: unknown): string =>
  Array.isArray(value) ? value.join(', ') : String(value ?? '');

const parseList = (raw: string) =>
  raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

/** A value in the import preview; the pen icon edits it in place. */
const ImportedValueCell: React.FC<ImportedValueCellProps> = ({
  definition,
  label,
  value,
  onChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [draft, setDraft] = useState<unknown>(undefined);
  const isEditing = draft !== undefined;

  const candidate =
    definition.type === 'stringList' && typeof draft === 'string'
      ? restrictToOptions(definition, parseList(draft))
      : draft;
  const isValid =
    isEditing && isValidWebUISettingValue(definition.type, candidate);

  const commit = () => {
    if (!isValid) return;
    onChange(candidate);
    setDraft(undefined);
  };
  const cancel = () => setDraft(undefined);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      e.stopPropagation();
      cancel();
    }
  };

  if (!isEditing) {
    return (
      <BAIFlex gap="xs" align="center" className="bai-imported-value-cell">
        <Text>{formatSettingValue(value)}</Text>
        <BAIFlex className="bai-imported-value-cell__edit">
          <IconButton
            size="sm"
            variant="ghost"
            icon={<SquarePenIcon size="1em" />}
            label={t('button.Edit')}
            onClick={() =>
              setDraft(
                definition.type === 'stringList' && !definition.options
                  ? formatSettingValue(value)
                  : value,
              )
            }
          />
        </BAIFlex>
      </BAIFlex>
    );
  }

  const control = (() => {
    switch (definition.type) {
      case 'boolean':
        return (
          <BAISwitch
            aria-label={label}
            value={draft as boolean}
            onChange={(checked) => setDraft(checked)}
          />
        );
      case 'number':
        return (
          <BAINumberInput
            aria-label={label}
            size="sm"
            value={draft as number}
            onChange={(next) => setDraft(next ?? '')}
            onKeyDown={onKeyDown}
          />
        );
      case 'stringList':
        if (definition.options) {
          return (
            <BAIMultiSelector
              aria-label={label}
              options={definition.options.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={draft as Array<string>}
              onChange={(values) => setDraft(values)}
            />
          );
        }
        return (
          <BAITextInput
            aria-label={label}
            size="sm"
            value={draft as string}
            onChange={(next) => setDraft(next)}
            onKeyDown={onKeyDown}
          />
        );
      default:
        return (
          <BAITextInput
            aria-label={label}
            size="sm"
            value={draft as string}
            status={isValid ? '' : 'error'}
            onChange={(next) => setDraft(next)}
            onKeyDown={onKeyDown}
          />
        );
    }
  })();

  return (
    <BAIFlex gap="xs" align="center">
      {control}
      <IconButton
        size="sm"
        variant="ghost"
        icon={<Check size="1em" />}
        label={t('button.Save')}
        isDisabled={!isValid}
        onClick={commit}
      />
      <IconButton
        size="sm"
        variant="ghost"
        icon={<X size="1em" />}
        label={t('button.Cancel')}
        onClick={cancel}
      />
    </BAIFlex>
  );
};

export default ImportedValueCell;
