import BAIFlex from './BAIFlex';
import BAIModal, { type BAIModalProps } from './BAIModal';
import BAIText from './BAIText';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Form, Input, theme, Typography, type InputProps } from 'antd';
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
  /** Description shown above the item list. If omitted, falls back to a `target`-based or generic default. */
  description?: React.ReactNode;
  /**
   * Resource type label (e.g. "Credential", "Project"). When provided and `description` is not,
   * the default description becomes "Are you sure you want to permanently delete {target}?".
   */
  target?: React.ReactNode;
  /**
   * Marks the confirmed action as reversible (e.g. revoke a role assignment,
   * remove a permission from a role). When true the modal keeps the exact same
   * header / footer / body design as the irreversible-delete modal, but never
   * renders the typed-confirmation input (even for multiple items or when
   * `requireConfirmInput` is set) and omits the "This action cannot be undone."
   * warning. Use for actions the user can recover from in <30s without
   * contacting support — see `.claude/rules/destructive-confirmation.md`.
   * Default: false
   */
  reversible?: boolean;
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
  /** Content rendered between the input field and "cannot be undone" text (e.g. checkboxes). */
  extraContent?: React.ReactNode;
  /** Max height (px) of the scrollable item list. Default: 200. Set 0 for no limit. */
  itemListMaxHeight?: number;
  /**
   * Render items without the default surface (background / border / padding /
   * scroll) container. Use when an item's `label` is already a self-contained
   * block (e.g. a table) so the default box does not create a redundant
   * double border. Default: false
   */
  plainItems?: boolean;
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
  target,
  reversible = false,
  requireConfirmInput = false,
  confirmText: confirmTextProp,
  inputLabel,
  inputProps,
  extraContent,
  itemListMaxHeight = 200,
  plainItems = false,
  onOk,
  onCancel,
  okText,
  okButtonProps,
  ...restModalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const typedText = Form.useWatch('confirmText', form) ?? '';

  const needsInput = !reversible && (items.length > 1 || requireConfirmInput);

  const resolvedTitle =
    title ??
    (items.length > 1
      ? t('comp:BAIDeleteConfirmModal.DeleteNItems', {
          count: items.length,
        })
      : t('comp:BAIDeleteConfirmModal.DeleteItem'));

  const resolvedConfirmText =
    confirmTextProp ??
    (items.length === 1
      ? (extractTextFromNode(items[0]?.label) ?? t('general.button.Delete'))
      : t('general.button.Delete'));

  const resolvedDescription =
    description ??
    (target
      ? t('comp:BAIDeleteConfirmModal.AreYouSureToPermanentlyDeleteTarget', {
          target,
        })
      : t('comp:BAIDeleteConfirmModal.AreYouSureToDelete'));

  const resolvedOkText = okText ?? t('general.button.Delete');

  const resolvedInputLabel = inputLabel ?? (
    <Trans
      i18nKey="comp:BAIDeleteConfirmModal.TypeToConfirm"
      values={{ confirmText: resolvedConfirmText }}
      components={{ code: <BAIText code /> }}
    />
  );

  const modalTitle = (
    <BAIFlex
      direction="column"
      justify="start"
      align="stretch"
      style={{ width: '100%' }}
    >
      <Text
        strong
        style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
      >
        <ExclamationCircleFilled
          style={{ color: token.colorWarning, marginRight: token.sizeXXS }}
        />
        {resolvedTitle}
      </Text>
    </BAIFlex>
  );

  const itemListContent =
    items.length > 0 ? (
      <div
        role="list"
        style={
          plainItems
            ? undefined
            : {
                maxHeight: itemListMaxHeight || undefined,
                overflowY: itemListMaxHeight ? 'auto' : undefined,
                backgroundColor: token.colorFillQuaternary,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusSM,
                padding: token.paddingXS,
                paddingInline: token.padding,
              }
        }
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

  if (needsInput) {
    return (
      <BAIModal
        destroyOnHidden
        {...restModalProps}
        title={modalTitle}
        okText={resolvedOkText}
        okButtonProps={{
          danger: true,
          disabled: typedText !== resolvedConfirmText,
          ...okButtonProps,
        }}
        onOk={(e) => {
          form.resetFields();
          onOk?.(e);
        }}
        onCancel={(e) => {
          form.resetFields();
          onCancel?.(e);
        }}
      >
        <BAIFlex direction="column" align="stretch" gap="xs">
          {resolvedDescription && <Text>{resolvedDescription}</Text>}
          {items.length > 1 && itemListContent}
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            preserve={false}
          >
            <Form.Item
              name="confirmText"
              label={resolvedInputLabel}
              style={{ marginBottom: 0 }}
            >
              <Input autoFocus autoComplete="off" allowClear {...inputProps} />
            </Form.Item>
          </Form>
          <Text type="danger">
            {t('comp:BAIDeleteConfirmModal.CannotBeUndone')}
          </Text>
          {extraContent}
        </BAIFlex>
      </BAIModal>
    );
  }

  return (
    <BAIModal
      {...restModalProps}
      destroyOnHidden
      title={modalTitle}
      okText={resolvedOkText}
      okButtonProps={{
        danger: true,
        disabled: items.length === 0,
        ...okButtonProps,
      }}
      onOk={onOk}
      onCancel={onCancel}
    >
      <BAIFlex direction="column" align="stretch" gap="xs">
        {resolvedDescription && <Text>{resolvedDescription}</Text>}
        {itemListContent}
        {!reversible && (
          <Text type="danger">
            {t('comp:BAIDeleteConfirmModal.CannotBeUndone')}
          </Text>
        )}
        {extraContent}
      </BAIFlex>
    </BAIModal>
  );
};

BAIDeleteConfirmModal.displayName = 'BAIDeleteConfirmModal';

export default BAIDeleteConfirmModal;
