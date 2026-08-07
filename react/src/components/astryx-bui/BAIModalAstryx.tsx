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
import type { DialogProps } from '@astryxdesign/core/Dialog';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { HStack } from '@astryxdesign/core/Stack';
import { XIcon } from 'lucide-react';
import React, { useEffect } from 'react';

export interface BAIModalAstryxProps extends Omit<
  DialogProps,
  'children' | 'isOpen' | 'onOpenChange'
> {
  /** Astryx `Dialog` naming — NOT antd's `open`. */
  isOpen?: boolean;
  /** Astryx `Dialog` naming — NOT antd's `onCancel`. Called with `false`. */
  onOpenChange?: (isOpen: boolean) => void;
  title?: string;
  subtitle?: string;
  /**
   * Full custom header row (ticket 16, FolderExplorer). Astryx
   * `DialogHeader.title` is a plain string (P2); a JSX title (identicon +
   * editable name + action buttons) needs the whole header slot. A close
   * IconButton is appended so dismissal stays reachable.
   */
  headerContent?: React.ReactNode;
  /** Accessible name for the generated close button of `headerContent`. */
  closeLabel?: string;
  /**
   * Ref to the element wrapping the body content — the FolderExplorer uses it
   * as its file drag-and-drop container.
   */
  bodyRef?: React.Ref<HTMLDivElement>;
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
  /**
   * Fired once each time the dialog transitions to open. Astryx `Dialog` has
   * no such hook; the form modals need it to kick off initial validation.
   */
  onAfterOpen?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const BAIModalAstryx: React.FC<BAIModalAstryxProps> = ({
  isOpen = false,
  onOpenChange,
  title,
  subtitle,
  headerContent,
  closeLabel = 'Close',
  bodyRef,
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
  onAfterOpen,
  className,
  style,
  purpose = 'form',
  ...dialogProps
}) => {
  'use memo';

  // Must run before the early return — hooks cannot sit behind a conditional.
  useEffect(() => {
    if (isOpen) onAfterOpen?.();
    // `onAfterOpen` is a stable callback at every call site in this graph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;
  const close = () => onOpenChange?.(false);

  const generatedFooter = actionLabel ? (
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
  ) : null;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      width={width}
      // `form` blocks accidental backdrop dismissal, matching how these modals
      // behave today (all wrap a form or a destructive act).
      purpose={purpose}
      {...dialogProps}
    >
      <Layout
        className={className}
        style={style}
        header={
          headerContent ? (
            <LayoutHeader>
              <HStack justify="between" align="center" gap={2} width="100%">
                {headerContent}
                <IconButton
                  label={closeLabel}
                  icon={<XIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={close}
                />
              </HStack>
            </LayoutHeader>
          ) : (
            <DialogHeader
              title={title ?? ''}
              subtitle={subtitle}
              onOpenChange={(next) => {
                if (!next) close();
              }}
            />
          )
        }
        content={
          <LayoutContent>
            <div ref={bodyRef} style={{ minHeight: '100%' }}>
              {isLoading ? <Skeleton height={120} /> : children}
            </div>
          </LayoutContent>
        }
        footer={
          (footer ?? generatedFooter) ? (
            <LayoutFooter hasDivider>{footer ?? generatedFooter}</LayoutFooter>
          ) : undefined
        }
      />
    </Dialog>
  );
};

export default BAIModalAstryx;
