/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx ticket 04 — antd `modal.confirm/error/info/...` drop-in composed on
 `BAIDialog` (Astryx `Dialog`'s surface, portalled — FR-3578).

 antd call-site contract preserved:

     modal.confirm({ title, content, okText, cancelText, okType, onOk, onCancel });
     const h = modal.confirm({...}); h.destroy();      // imperative handle
     const ok = await modal.confirm({...});            // thenable: true=ok, false=cancel
     modal.error({ title, content, onOk });            // single-button variants

 Architecture: imperative calls push a task into a module-level store; the
 `<AppShimModalHost>` (mounted once by `<BAIAppProvider>`) subscribes via
 `useSyncExternalStore` and renders one Astryx dialog per task. No bridge
 registration is needed — tasks created before the host mounts simply wait in
 the store. This also gives us the cancel signal that Astryx's own
 `useImperativeAlertDialog` swallows (its internal `onOpenChange` only closes,
 with no callback), plus per-task ok-button loading state.

 Branching (answers/07 §4): `confirm` with plain-text title/content renders the
 WAI-ARIA alert-dialog shape, which is `BAIAlertDialog`. Everything else gets
 the `DialogHeader` + `Layout` shape on `BAIDialog`. Both keep antd's
 confirm-family dismissal: Escape yes, backdrop no.

 Promise/close semantics (all antd-matching):
 - `onOk` returning a promise puts the ok button into loading and closes only
   on resolve; a REJECTED promise keeps the dialog open.
 - Escape / cancel button / header close -> `onCancel()` + resolve(false).
 - `.destroy()` closes without firing onOk/onCancel.
 - `.update()` throws — 0 real usages repo-wide (answers/07 §1.1), kept loud.
*/
import BAIAlertDialog from '../components/BAIAlertDialog';
import BAIDialog from '../components/BAIDialog';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { Button } from '@astryxdesign/core/Button';
import { DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { HStack } from '@astryxdesign/core/Stack';
import React, { isValidElement, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

export type ModalKind = 'confirm' | 'info' | 'success' | 'error' | 'warning';

export interface ModalShimFuncProps {
  title?: ReactNode;
  content?: ReactNode;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okType?: 'primary' | 'danger' | 'default' | 'dashed' | 'link' | 'text';
  /**
   * `danger`/`disabled` are honoured. `loading` is accepted and ignored:
   * antd itself only reflects a *static* `loading` here (there is no
   * `.update()` path in this repo), and the shim derives ok-button loading
   * from the pending `onOk` promise instead.
   */
  okButtonProps?: { danger?: boolean; disabled?: boolean; loading?: unknown };
  /** `disabled` is honoured on the cancel button; other keys are ignored. */
  cancelButtonProps?: {
    danger?: boolean;
    disabled?: boolean;
    loading?: unknown;
  };
  /** May return a promise — see the promise semantics note above. */
  onOk?: () => unknown;
  onCancel?: () => unknown;
  width?: number | string;
  /**
   * Stacking override for the portal root, floored at `BAI_Z_INDEX.modalBase`;
   * reach for a `BAI_Z_INDEX` layer before a literal.
   */
  zIndex?: number;
  /**
   * PILOT-DECISION: the following antd props are accepted for call-site
   * compatibility but have no Astryx destination and are ignored:
   * - `centered` — Astryx dialogs are always centered.
   * - `icon` — the dialog has no icon slot; severity reads from the action
   *   button variant instead.
   * - `maskClosable`/`keyboard` — dismissal is governed by Dialog `purpose`;
   *   the shim always uses antd's confirm-family defaults (Escape yes,
   *   backdrop no).
   * - `closable` — the alert-dialog branch never has a header X; the other
   *   branch always has one (DialogHeader). Either way Escape already
   *   cancels (see `maskClosable`/`keyboard` above), so a header-X toggle
   *   cannot enforce anything Escape does not already allow.
   */
  centered?: boolean;
  icon?: ReactNode;
  maskClosable?: boolean;
  keyboard?: boolean;
  closable?: boolean;
}

/** antd's confirm return: an imperative handle that is also thenable. */
export interface ModalShimReturn extends PromiseLike<boolean> {
  destroy: () => void;
  update: (config: ModalShimFuncProps) => void;
}

/* ------------------------------------------------------------------- store */

interface ModalTask {
  id: number;
  kind: ModalKind;
  options: ModalShimFuncProps;
  isLoading: boolean;
  resolve: (confirmed: boolean) => void;
}

let tasks: readonly ModalTask[] = [];
let nextTaskId = 1;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): readonly ModalTask[] {
  return tasks;
}

function patchTask(id: number, patch: Partial<ModalTask>): void {
  tasks = tasks.map((task) => (task.id === id ? { ...task, ...patch } : task));
  emit();
}

function removeTask(id: number): void {
  tasks = tasks.filter((task) => task.id !== id);
  emit();
}

function settleTask(task: ModalTask, confirmed: boolean): void {
  removeTask(task.id);
  task.resolve(confirmed);
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

function runOk(task: ModalTask): void {
  // A synchronous throw propagates from the click handler and keeps the
  // dialog open — same observable behaviour as a rejected promise.
  const result = task.options.onOk?.();
  if (isThenable(result)) {
    patchTask(task.id, { isLoading: true });
    result.then(
      () => settleTask(task, true),
      // antd keeps the dialog open when onOk's promise rejects.
      () => patchTask(task.id, { isLoading: false }),
    );
  } else {
    settleTask(task, true);
  }
}

function runCancel(task: ModalTask): void {
  task.options.onCancel?.();
  settleTask(task, false);
}

function openModal(
  kind: ModalKind,
  options: ModalShimFuncProps,
): ModalShimReturn {
  let resolve: (confirmed: boolean) => void = () => {};
  const settled = new Promise<boolean>((r) => {
    resolve = r;
  });
  const id = nextTaskId++;
  tasks = [...tasks, { id, kind, options, isLoading: false, resolve }];
  emit();
  return {
    destroy: () => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        // antd's destroy() closes without firing onOk/onCancel; resolve(false)
        // so an awaiting caller is never left dangling.
        settleTask(task, false);
      }
    },
    update: () => {
      throw new Error(
        'app-shim modal .update() is not implemented — 0 real usages ' +
          'repo-wide (answers/07 §1.1). Re-show a new modal instead.',
      );
    },
    then: (onfulfilled, onrejected) => settled.then(onfulfilled, onrejected),
  };
}

export const modal = {
  confirm: (options: ModalShimFuncProps) => openModal('confirm', options),
  info: (options: ModalShimFuncProps) => openModal('info', options),
  success: (options: ModalShimFuncProps) => openModal('success', options),
  error: (options: ModalShimFuncProps) => openModal('error', options),
  warning: (options: ModalShimFuncProps) => openModal('warning', options),
};

export type ModalApi = typeof modal;

/* -------------------------------------------------------------------- host */

function isPlainText(node: ReactNode): boolean {
  return node == null || typeof node === 'string' || typeof node === 'number';
}

/**
 * Best-effort text extraction for string-typed Astryx slots
 * (`DialogHeader.title`, `Button.label`). antd accepts ReactNode everywhere;
 * JSX structure is flattened to its text.
 */
function toText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string') {
    return node;
  }
  if (typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(toText).join('');
  }
  if (isValidElement(node)) {
    return toText((node.props as { children?: ReactNode }).children);
  }
  return '';
}

const AppShimModalTask: React.FC<{ task: ModalTask }> = ({ task }) => {
  'use memo';
  const { t } = useBAIi18n();
  const { kind, options } = task;
  const isDanger =
    options.okType === 'danger' || options.okButtonProps?.danger === true;
  const okLabel = toText(options.okText) || 'OK';
  const cancelLabel = toText(options.cancelText) || undefined;

  // Escape, the mask, the header X and the cancel button all land here.
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      runCancel(task);
    }
  };

  if (
    kind === 'confirm' &&
    isPlainText(options.title) &&
    isPlainText(options.content)
  ) {
    return (
      <BAIAlertDialog
        isOpen
        onOpenChange={handleOpenChange}
        width={options.width}
        zIndex={options.zIndex}
        title={toText(options.title)}
        description={toText(options.content)}
        cancelLabel={cancelLabel}
        isCancelDisabled={options.cancelButtonProps?.disabled}
        actionLabel={okLabel}
        actionVariant={isDanger ? 'destructive' : 'primary'}
        isActionLoading={task.isLoading}
        isActionDisabled={options.okButtonProps?.disabled}
        onAction={() => runOk(task)}
      />
    );
  }

  return (
    <BAIDialog
      isOpen
      onOpenChange={handleOpenChange}
      width={options.width}
      zIndex={options.zIndex}
      purpose="form"
    >
      <Layout
        header={
          <DialogHeader
            title={toText(options.title)}
            onOpenChange={handleOpenChange}
          />
        }
        content={
          options.content != null ? (
            <LayoutContent>{options.content}</LayoutContent>
          ) : undefined
        }
        footer={
          <LayoutFooter>
            <HStack justify="end" gap={2} align="center">
              {kind === 'confirm' && (
                <Button
                  label={cancelLabel ?? t('general.button.Cancel')}
                  variant="secondary"
                  isDisabled={options.cancelButtonProps?.disabled}
                  onClick={() => runCancel(task)}
                />
              )}
              <Button
                label={okLabel}
                // antd's confirm default is a plain primary ok, not destructive.
                variant={isDanger ? 'destructive' : 'primary'}
                isLoading={task.isLoading}
                isDisabled={options.okButtonProps?.disabled}
                onClick={() => runOk(task)}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </BAIDialog>
  );
};

/**
 * Renders every pending imperative modal task. Mounted exactly once by
 * `<BAIAppProvider>`. Concurrent tasks each get their own portal, and
 * `BAIDialog`'s level stack keeps them in call order.
 */
export const AppShimModalHost: React.FC = () => {
  'use memo';
  const currentTasks = useSyncExternalStore(subscribe, getSnapshot);
  return (
    <>
      {currentTasks.map((task) => (
        <AppShimModalTask key={task.id} task={task} />
      ))}
    </>
  );
};
