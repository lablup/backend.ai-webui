/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Banner } from '@astryxdesign/core/Banner';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Selector, type SelectorOptionData } from '@astryxdesign/core/Selector';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Text } from '@astryxdesign/core/Text';
import { useToggle } from 'ahooks';
import { BAIFlex, BAIModal } from 'backend.ai-ui';
import { t } from 'i18next';
import { Settings } from 'lucide-react';
import React, { ReactElement, ReactNode, useState } from 'react';

type BaseSettingItemProps = {
  'data-testid'?: string;
  title: string;
  description?: string | ReactElement;
  children?: ReactNode;
  showResetButton?: boolean;
  onReset?: () => void;
};

type CheckboxSettingItemProps = BaseSettingItemProps & {
  type: 'checkbox';
  defaultValue?: boolean;
  value?: boolean;
  onChange?: (value?: boolean) => void;
  // PILOT-DECISION: narrowed from `Omit<CheckboxProps,...>` to the one field
  // every call site in this area actually passes (grepped, P1) — `disabled`.
  checkboxProps?: { disabled?: boolean };
  selectProps?: never;
};

/** Re-exported so callers can build option lists without importing Astryx directly. */
export type SettingSelectOption = SelectorOptionData;

type SelectSettingItemProps = BaseSettingItemProps & {
  type: 'select';
  // PILOT-DECISION: antd's `Select` tolerated a `number` value/option (the
  // "max concurrent uploads" 2|3|4|5 picker); Astryx `Selector.value` is
  // `string`-only (P3/P4). Narrowed to `string` here — the one numeric call
  // site converts at its own boundary (`String(n)` in / `_.toNumber(v)` out).
  defaultValue?: string;
  value?: string;
  onChange?: (value?: string) => void;
  // PILOT-DECISION: narrowed from `Omit<BAISelectProps,...>` to the fields
  // this area's call sites actually pass (grepped, P1) — `options`,
  // `showSearch` (renamed `hasSearch`). antd's `optionFilterProp:
  // 'filterValue'` sites always set `filterValue` equal to the label text,
  // which is Selector's default search target — dropped as a no-op.
  selectProps?: {
    options: SettingSelectOption[];
    hasSearch?: boolean;
    disabled?: boolean;
  };
  checkboxProps?: never;
};

type CustomSettingItemProps = BaseSettingItemProps & {
  type: 'custom';
  defaultValue?: any;
  value?: any;
  onChange?: (value?: any) => void;
  selectProps?: never;
  checkboxProps?: never;
};

export type SettingItemProps =
  CheckboxSettingItemProps | SelectSettingItemProps | CustomSettingItemProps;

const SettingItem: React.FC<SettingItemProps> = ({
  'data-testid': dataTestId,
  type,
  title,
  description,
  children,
  defaultValue,
  value,
  onChange,
  onReset,
  selectProps,
  checkboxProps,
  showResetButton = true,
}) => {
  'use memo';

  const [isRowHovered, setIsRowHovered] = useState(false);
  const [isOpenResetChangesModal, { toggle: setIsOpenResetChangesModal }] =
    useToggle(false);

  const resetItem = () => {
    if (onReset) {
      onReset();
    } else if (isEnabled && onChange) {
      onChange(defaultValue);
    }
  };

  const isEnabled =
    (type === 'select' && !selectProps?.disabled) ||
    (type === 'checkbox' && !checkboxProps?.disabled) ||
    type === 'custom';

  return (
    <BAIFlex
      data-testid={dataTestId}
      direction="column"
      align="stretch"
      gap={'xxs'}
      onMouseEnter={() => setIsRowHovered(true)}
      onMouseLeave={() => setIsRowHovered(false)}
    >
      <BAIFlex direction="row" gap={'xxs'}>
        <BAIFlex gap="xxs" align="center">
          <Text weight="semibold">{title}</Text>
          {isEnabled &&
            value !== undefined &&
            value !== null &&
            defaultValue !== value && (
              <StatusDot
                variant="warning"
                label={t('settings.ChangedFromDefault', 'Changed from default')}
              />
            )}
          {isEnabled && showResetButton && (
            // PILOT-DECISION: antd's `Dropdown` wrapping a single "Reset"
            // menu item (with `danger` red tint, dropped separately per
            // ticket-18 precedent) collapses to a direct reset action — a
            // one-item menu is pure indirection (simplicity policy,
            // MIGRATION-SPEC §0).
            <IconButton
              icon={<Settings size="1em" />}
              label={t('button.Reset')}
              tooltip={t('button.Reset')}
              variant="ghost"
              size="sm"
              style={{
                opacity: isRowHovered ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out',
              }}
              onClick={() => setIsOpenResetChangesModal()}
            />
          )}
        </BAIFlex>
      </BAIFlex>
      {type === 'custom' && (
        <BAIFlex
          direction="column"
          gap="xs"
          align="start"
          style={{ width: '100%' }}
        >
          {description}
          {children}
        </BAIFlex>
      )}
      {type === 'checkbox' && (
        // PILOT-DECISION: antd rendered `description` (often rich JSX with
        // conditional extra lines) AS the checkbox's own clickable label
        // (P2: label is a required string here). The row's `title` above
        // already supplies an accessible name, so the checkbox reuses it
        // (`isLabelHidden`) and `description` renders as plain auxiliary
        // text below — clicking the description no longer toggles the
        // checkbox, a minor interaction loss traded for keeping the rich
        // JSX content intact.
        <BAIFlex direction="column" gap="xs" align="start">
          <CheckboxInput
            label={title}
            isLabelHidden
            value={!!value}
            isDisabled={checkboxProps?.disabled}
            onChange={(checked) => onChange?.(checked)}
          />
          {description && (
            <Text
              color={checkboxProps?.disabled ? 'disabled' : 'primary'}
              display="block"
            >
              {description}
            </Text>
          )}
        </BAIFlex>
      )}
      {type === 'select' && (
        <BAIFlex direction="column" gap="xs" align="start">
          {description && (
            <Text
              color={selectProps?.disabled ? 'disabled' : 'primary'}
              display="block"
            >
              {description}
            </Text>
          )}
          <Selector
            label={title}
            isLabelHidden
            options={selectProps?.options ?? []}
            hasSearch={selectProps?.hasSearch}
            isDisabled={selectProps?.disabled}
            value={value}
            width="fit-content"
            onChange={(nextValue) => onChange?.(nextValue)}
          />
        </BAIFlex>
      )}
      <BAIModal
        open={isOpenResetChangesModal}
        title={t('dialog.ask.DoYouWantToResetChanges')}
        okText={t('button.Reset')}
        okButtonProps={{ danger: true }}
        onOk={() => {
          resetItem();
          setIsOpenResetChangesModal();
        }}
        cancelText={t('button.Cancel')}
        onCancel={() => setIsOpenResetChangesModal()}
      >
        <Banner status="warning" title={t('dialog.warning.CannotBeUndone')} />
      </BAIModal>
    </BAIFlex>
  );
};

export default SettingItem;
