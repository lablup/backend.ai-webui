import BAIConfirmModalWithInput from './BAIConfirmModalWithInput';
import BAIFlex from './BAIFlex';
import BAIModal, { type BAIModalProps } from './BAIModal';
import BAIText from './BAIText';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { theme, Typography, type InputProps } from 'antd';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

const { Text } = Typography;

export interface BAIDeleteConfirmModalItem {
  /** Unique key for React list rendering */
  key: string;
  /** Display label — accepts ReactNode for custom rendering (icons, tags, etc.) */
  label: React.ReactNode;
}

export interface BAIDeleteConfirmModalProps extends Omit<
  BAIModalProps,
  'title' | 'children'
> {
  /** Items to be deleted. */
  items: BAIDeleteConfirmModalItem[];
  /** Custom modal title. Defaults to "Delete" / "Delete N items". */
  title?: React.ReactNode;
  /** Description shown above the item list. Defaults to "Are you sure you want to delete?" */
  description?: React.ReactNode;
  /** Force text-input confirmation even for a single item. Default: false */
  requireConfirmInput?: boolean;
  /**
   * Custom confirmation text the user must type.
   * Defaults: single item → item label as string (falls back to localized "Delete" if label is ReactNode),
   * multiple items → localized "Delete".
   * When using ReactNode labels with requireConfirmInput, provide this prop explicitly.
   */
  confirmText?: string;
  /** Label above the confirmation input. Default: "Type {confirmText} to confirm." */
  inputLabel?: React.ReactNode;
  /** Additional props for the confirmation Input. */
  inputProps?: InputProps;
  /** Content rendered between the item list and the input field (e.g. checkboxes). */
  extraContent?: React.ReactNode;
  /** Max height (px) of the scrollable item list. Default: 200. Set 0 for no limit. */
  itemListMaxHeight?: number;
}

function extractTextFromNode(node: React.ReactNode): string | undefined {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  return undefined;
}

const BAIDeleteConfirmModal: React.FC<BAIDeleteConfirmModalProps> = ({
  items,
  title,
  description,
  requireConfirmInput = false,
  confirmText: confirmTextProp,
  inputLabel,
  inputProps,
  extraContent,
  itemListMaxHeight = 200,
  onOk,
  onCancel,
  okText,
  okButtonProps,
  ...restModalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const needsInput = items.length > 1 || requireConfirmInput;

  const resolvedTitle =
    title ??
    (items.length > 1
      ? t('comp:BAIDeleteConfirmModal.DeleteNItems', {
          count: items.length,
        })
      : t('comp:BAIDeleteConfirmModal.DeleteItem'));

  const resolvedDescription =
    description ?? t('comp:BAIDeleteConfirmModal.AreYouSureToDelete');

  const resolvedConfirmText =
    confirmTextProp ??
    (items.length === 1
      ? (extractTextFromNode(items[0]?.label) ?? t('general.button.Delete'))
      : t('general.button.Delete'));

  const resolvedOkText = okText ?? t('general.button.Delete');

  const resolvedInputLabel = inputLabel ?? (
    <Trans
      i18nKey="comp:BAIDeleteConfirmModal.TypeToConfirm"
      values={{ confirmText: resolvedConfirmText }}
      components={{ code: <BAIText code /> }}
    />
  );

  const itemListContent =
    items.length > 0 ? (
      <div
        role="list"
        style={{
          maxHeight: itemListMaxHeight || undefined,
          overflowY: itemListMaxHeight ? 'auto' : undefined,
          backgroundColor: token.colorFillQuaternary,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusSM,
          padding: token.paddingXS,
          paddingInline: token.padding,
        }}
      >
        <BAIFlex direction="column" align="stretch" gap="xxs">
          {items.map((item) => (
            <div key={item.key} role="listitem">
              {item.label}
            </div>
          ))}
        </BAIFlex>
      </div>
    ) : null;

  const bodyContent = (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <Text>{resolvedDescription}</Text>
      {itemListContent}
      <Text type="danger">
        {t('comp:BAIDeleteConfirmModal.CannotBeUndone')}
      </Text>
      {extraContent}
    </BAIFlex>
  );

  if (needsInput) {
    return (
      <BAIConfirmModalWithInput
        {...restModalProps}
        destroyOnHidden
        title={resolvedTitle}
        confirmText={resolvedConfirmText}
        content={bodyContent}
        inputLabel={resolvedInputLabel}
        inputProps={inputProps}
        okText={resolvedOkText}
        okButtonProps={okButtonProps}
        onOk={onOk}
        onCancel={onCancel}
      />
    );
  }

  return (
    <BAIModal
      {...restModalProps}
      destroyOnHidden
      title={
        <BAIFlex direction="column" justify="start" align="start">
          <Text strong>
            <ExclamationCircleFilled
              style={{ color: token.colorWarning, marginRight: 5 }}
            />
            {resolvedTitle}
          </Text>
        </BAIFlex>
      }
      okText={resolvedOkText}
      okButtonProps={{
        danger: true,
        disabled: items.length === 0,
        ...okButtonProps,
      }}
      onOk={onOk}
      onCancel={onCancel}
    >
      {bodyContent}
    </BAIModal>
  );
};

BAIDeleteConfirmModal.displayName = 'BAIDeleteConfirmModal';

export default BAIDeleteConfirmModal;
