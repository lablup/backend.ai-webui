/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  restrictToOptions,
  type WebUISettingDefinition,
} from '../../../helper/webuiSettings';
import {
  isApplicableSettingValue,
  isUnsetText,
} from '../helper/importConfigToml';
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
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ImportedValueCellProps {
  definition: WebUISettingDefinition;
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

const formatSettingValue = (value: unknown): string =>
  Array.isArray(value) ? value.join(', ') : String(value ?? '');

// The value a cleared (default) setting starts editing from.
const emptyDraftOf = (definition: WebUISettingDefinition): unknown => {
  switch (definition.type) {
    case 'boolean':
      return false;
    case 'stringList':
      return definition.options ? [] : '';
    default:
      return '';
  }
};

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
  const [draft, setDraftState] = useState<unknown>(undefined);
  // NumberInput reports on Enter right before onKeyDown, so commit reads this.
  const latestDraft = useRef<unknown>(undefined);
  const setDraft = (next: unknown) => {
    latestDraft.current = next;
    setDraftState(next);
  };
  const isEditing = draft !== undefined;

  // An emptied editor means the default, as an empty value in the file does.
  const toCandidate = (raw: unknown): unknown => {
    if (raw === null || (Array.isArray(raw) && raw.length === 0)) {
      return undefined;
    }
    if (typeof raw !== 'string') return raw;
    if (isUnsetText(raw)) return undefined;
    if (definition.type === 'stringList') {
      const list = parseList(raw);
      return list.length === 0
        ? undefined
        : restrictToOptions(definition, list);
    }
    return raw.trim();
  };
  const isValid = isApplicableSettingValue(definition, toCandidate(draft));

  const commit = () => {
    const candidate = toCandidate(latestDraft.current);
    if (!isApplicableSettingValue(definition, candidate)) return;
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
        {value === undefined ? (
          <Text color="secondary">{t('webuiSettings.ImportDefaultValue')}</Text>
        ) : (
          <Text>{formatSettingValue(value)}</Text>
        )}
        <BAIFlex className="bai-imported-value-cell__edit">
          <IconButton
            size="sm"
            variant="ghost"
            icon={<SquarePenIcon size="1em" />}
            label={t('button.Edit')}
            onClick={() =>
              setDraft(
                value === undefined
                  ? emptyDraftOf(definition)
                  : definition.type === 'stringList' && !definition.options
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
            status={isValid ? '' : 'error'}
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
