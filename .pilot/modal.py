import pathlib

f = pathlib.Path('react/src/components/astryx-bui/BAIModalAstryx.tsx')
s = f.read_text()

start = s.index('export interface BAIModalAstryxProps {')
end = s.index('const BAIModalAstryx: React.FC<BAIModalAstryxProps> = ({')
new_props = '''export interface BAIModalAstryxProps
  extends Omit<DialogProps, 'children' | 'isOpen' | 'onOpenChange'> {
  /** Astryx `Dialog` naming — NOT antd's `open`. */
  isOpen?: boolean;
  /** Astryx `Dialog` naming — NOT antd's `onCancel`. Called with `false`. */
  onOpenChange?: (isOpen: boolean) => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** Action button label. Omit to render no generated footer action. */
  actionLabel?: string;
  cancelLabel?: string;
  /** Astryx `ButtonVariant`, not antd's `okButtonProps.danger`. */
  actionVariant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  isActionDisabled?: boolean;
  isActionLoading?: boolean;
  /**
   * May return a promise; the dialog stays open until it settles and closes
   * only on success. This await-then-close controller is the whole reason the
   * component exists — Astryx `Dialog` has no action contract at all.
   */
  onAction?: () => void | Promise<unknown>;
  /** Full footer override; suppresses the generated action row. */
  footer?: React.ReactNode;
  /** Renders a Skeleton in place of the body. */
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

'''
s = s[:start] + new_props + s[end:]

s = s.replace("""const BAIModalAstryx: React.FC<BAIModalAstryxProps> = ({
  open = false,
  title,
  children,
  width = 520,
  okText,
  cancelText,
  okButtonProps,
  confirmLoading,
  onOk,
  onCancel,
  footer,
  loading,
  afterOpenChange,
  className,
  style,
}) => {
  'use memo';

  useEffect(() => {
    afterOpenChange?.(open);
    // `afterOpenChange` is a stable callback at every call site in this graph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;""",
"""const BAIModalAstryx: React.FC<BAIModalAstryxProps> = ({
  isOpen = false,
  onOpenChange,
  title,
  subtitle,
  children,
  width = 520,
  actionLabel,
  cancelLabel = 'Cancel',
  actionVariant = 'primary',
  isActionDisabled,
  isActionLoading,
  onAction,
  footer,
  isLoading,
  className,
  style,
  purpose = 'form',
  ...dialogProps
}) => {
  'use memo';

  if (!isOpen) return null;
  const close = () => onOpenChange?.(false);""")

s = s.replace("""  const generatedFooter = (
    <HStack justify="end" gap={2} align="center">
      <Button
        label={typeof cancelText === 'string' ? cancelText : 'Cancel'}
        variant="secondary"
        onClick={() => onCancel?.()}
      />
      <Button
        label={typeof okText === 'string' ? okText : 'OK'}
        variant={okButtonProps?.danger ? 'destructive' : 'primary'}
        isDisabled={okButtonProps?.disabled}
        isLoading={confirmLoading}
        // Astryx's native async-click handles the spinner; the close is ours.
        clickAction={async () => {
          await onOk?.();
        }}
      />
    </HStack>
  );""",
"""  const generatedFooter = actionLabel ? (
    <HStack justify="end" gap={2} align="center">
      <Button label={cancelLabel} variant="secondary" onClick={close} />
      <Button
        label={actionLabel}
        variant={actionVariant}
        isDisabled={isActionDisabled}
        isLoading={isActionLoading}
        // `clickAction` is Astryx-native async-with-loading; the close is ours.
        clickAction={async () => {
          await onAction?.();
        }}
      />
    </HStack>
  ) : null;""")

s = s.replace("""    <Dialog
      isOpen={open}
      onOpenChange={(next) => {
        if (!next) onCancel?.();
      }}
      width={width}
      // `form` blocks accidental backdrop dismissal, matching how these modals
      // behave in the app today (all of them wrap a form or a destructive act).
      purpose="form"
    >""",
"""    <Dialog
      isOpen={isOpen}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      width={width}
      // `form` blocks accidental backdrop dismissal, matching how these modals
      // behave today (all wrap a form or a destructive act).
      purpose={purpose}
      {...dialogProps}
    >""")

s = s.replace("""          <DialogHeader
            title={typeof title === 'string' ? title : ''}
            onOpenChange={(next) => {
              if (!next) onCancel?.();
            }}
          />""",
"""          <DialogHeader
            title={title ?? ''}
            subtitle={subtitle}
            onOpenChange={(next) => {
              if (!next) close();
            }}
          />""")
s = s.replace("            {loading ? <Skeleton height={120} /> : children}",
              "            {isLoading ? <Skeleton height={120} /> : children}")
s = s.replace("""        footer={
          <LayoutFooter hasDivider>{footer ?? generatedFooter}</LayoutFooter>
        }""",
"""        footer={
          footer ?? generatedFooter ? (
            <LayoutFooter hasDivider>{footer ?? generatedFooter}</LayoutFooter>
          ) : undefined
        }""")
s = s.replace("import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';",
              "import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';\n"
              "import type { DialogProps } from '@astryxdesign/core/Dialog';")
s = s.replace("import React, { useEffect } from 'react';", "import React from 'react';")
f.write_text(s)
print('modal re-based')
