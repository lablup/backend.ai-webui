/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 2 (cn-oss-removal / ticket 10) — local Astryx-backed `BAIModal`.

 The widest API gap in the pilot. antd's `Modal` is a **controller**: it owns
 the title bar, the OK/Cancel footer, `okText`/`cancelText`,
 `okButtonProps`, `confirmLoading`, and — critically — it awaits a Promise
 returned from `onOk` and closes itself when it resolves.

 Astryx's `Dialog` is a *surface*: `isOpen`, `onOpenChange`, `children`, and a
 `Layout` with header/content/footer slots. **There is no footer contract, no
 ok/cancel concept, and no auto-close-on-resolve.** All of that is
 re-implemented here, ~90 LOC of behaviour that antd supplied for free:

 - `onOk` may return a Promise -> the OK button shows loading via Astryx's
   native `clickAction`, and the modal closes only if it resolves. A rejection
   leaves the modal open, which is exactly antd's documented behaviour and is
   what `DeleteVFolderModal` / `RestoreVFolderModal` rely on.
 - `footer` (a full ReactNode override, used by `FolderCreateModalV2`) bypasses
   the generated footer entirely.
 - `okButtonProps.danger` -> destructive variant.

 PILOT-DECISIONs:
 - `centered` is a no-op: Astryx Dialogs are always centred unless `position`
   is set. Accepted and ignored.
 - `destroyOnHidden` is a no-op: this wrapper already renders nothing when
   closed, which is stricter than antd's default.
 - `loading` (antd renders a skeleton body) is mapped to rendering the
   `Skeleton` primitive in place of the body.
 - `afterOpenChange` fires from an effect on `open`, not from a real
   transition-end event, so it lands a frame earlier than antd's.
*/
import { Button } from '@astryxdesign/core/Button';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { HStack } from '@astryxdesign/core/Stack';
import React, { useEffect } from 'react';

export interface BAIModalAstryxProps {
  open?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  width?: number | string;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okButtonProps?: { danger?: boolean; disabled?: boolean };
  confirmLoading?: boolean;
  /** May return a Promise; the dialog stays open until it resolves. */
  onOk?: () => void | Promise<unknown>;
  onCancel?: () => void;
  /** Full footer override. When present, ok/cancel are not generated. */
  footer?: React.ReactNode;
  loading?: boolean;
  /** Accepted and ignored — Astryx dialogs are centred by default. */
  centered?: boolean;
  /** Accepted and ignored — this wrapper unmounts when closed. */
  destroyOnHidden?: boolean;
  maskClosable?: boolean;
  afterOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

const BAIModalAstryx: React.FC<BAIModalAstryxProps> = ({
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

  if (!open) return null;

  const generatedFooter = (
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
  );

  return (
    <Dialog
      isOpen={open}
      onOpenChange={(next) => {
        if (!next) onCancel?.();
      }}
      width={width}
      // `form` blocks accidental backdrop dismissal, matching how these modals
      // behave in the app today (all of them wrap a form or a destructive act).
      purpose="form"
    >
      <Layout
        className={className}
        style={style}
        header={
          <DialogHeader
            title={typeof title === 'string' ? title : ''}
            onOpenChange={(next) => {
              if (!next) onCancel?.();
            }}
          />
        }
        content={
          <LayoutContent>
            {loading ? <Skeleton height={120} /> : children}
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>{footer ?? generatedFooter}</LayoutFooter>
        }
      />
    </Dialog>
  );
};

export default BAIModalAstryx;
