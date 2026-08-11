/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx ticket 04 — antd `message` drop-in backed by Astryx `useToast`.

 antd call-site contract preserved:

     message.success('Saved');                       // ReactNode shorthand
     message.error({ content: t('...') });           // ArgsProps object form
     message.info('...', 10, () => afterClose());    // duration + onClose
     const close = message.warning('...');           // returns a close handle
     close();                                        // manual dismiss
     message.loading?  -> throws (0 usages repo-wide, kept loud on purpose)
     await message.success('...');                   // thenable: resolves on close

 Semantics mapped onto Astryx `showToast`:
 - `duration` is in antd's unit, SECONDS (default from <BAIAppProvider message>);
   `0` disables auto-dismiss. Astryx wants milliseconds -> converted here.
 - The returned handle is BOTH a function (closes the toast) and a
   PromiseLike<boolean> that resolves once the toast is gone (auto or manual)
   — antd's `MessageType` chaining contract.
 - `key` maps to Astryx `uniqueID` (collision default 'overwrite', which is
   exactly antd's key-based replace behaviour).
*/
import { getDefaultMessageDurationS, withBridge } from './bridge';
import { HStack } from '@astryxdesign/core/Stack';
import { CheckIcon, TriangleAlertIcon } from 'lucide-react';
import { isValidElement, type ReactNode } from 'react';

export type MessageKind = 'success' | 'info' | 'warning' | 'error';

export interface MessageArgsProps {
  content: ReactNode;
  /** Auto-dismiss delay in seconds; `0` keeps the toast until dismissed. */
  duration?: number;
  onClose?: () => void;
  /** antd keyed-replace; mapped to Astryx `uniqueID` + 'overwrite'. */
  key?: string | number;
  /**
   * PILOT-DECISION: antd's custom `icon` override has no Astryx destination
   * (Toast has no leading-icon slot; severity is background color). Accepted
   * and ignored so object-form call sites keep compiling.
   */
  icon?: ReactNode;
}

export type JointContent = ReactNode | MessageArgsProps;

/** antd's MessageType: a close function that is also thenable. */
export interface MessageType extends PromiseLike<boolean> {
  (): void;
}

function isArgsProps(content: JointContent): content is MessageArgsProps {
  return (
    typeof content === 'object' &&
    content !== null &&
    !Array.isArray(content) &&
    !isValidElement(content) &&
    'content' in content
  );
}

/**
 * PILOT-DECISION: Astryx Toast is 2-way (`info` | `error`) where antd message
 * is 4-way. success/warning collapse onto `info` and get a small leading
 * glyph so the severity distinction survives; colours stay Astryx defaults
 * (defaults-first policy — restoring antd's green/amber would need a theme
 * extension, not a per-call hack). info/error carry no glyph: Astryx already
 * distinguishes them by background.
 */
function kindGlyph(kind: MessageKind): ReactNode {
  switch (kind) {
    case 'success':
      return <CheckIcon size={16} aria-hidden />;
    case 'warning':
      return <TriangleAlertIcon size={16} aria-hidden />;
    default:
      return null;
  }
}

function open(
  kind: MessageKind,
  content: JointContent,
  duration?: number,
  onClose?: () => void,
): MessageType {
  const args: MessageArgsProps = isArgsProps(content)
    ? content
    : { content, duration, onClose };
  const durationS = args.duration ?? getDefaultMessageDurationS();
  const glyph = kindGlyph(kind);
  const body = glyph ? (
    <HStack gap={1} align="center">
      {glyph}
      {args.content}
    </HStack>
  ) : (
    args.content
  );

  let dismiss: (() => void) | null = null;
  let settled = false;
  let resolveClosed: (value: boolean) => void = () => {};
  const closed = new Promise<boolean>((resolve) => {
    resolveClosed = resolve;
  });
  const settle = () => {
    if (settled) {
      return;
    }
    settled = true;
    args.onClose?.();
    resolveClosed(true);
  };

  withBridge((b) => {
    if (settled) {
      // Closed via the handle before the provider mounted — never show it.
      return;
    }
    dismiss = b.showToast({
      body,
      type: kind === 'error' ? 'error' : 'info',
      isAutoHide: durationS !== 0,
      autoHideDuration: durationS * 1000,
      uniqueID: args.key != null ? String(args.key) : undefined,
      // Astryx fires this for BOTH auto and manual dismissal, so `settle`
      // (onClose + promise resolution) is single-sourced here.
      onHide: settle,
    });
  });

  const close = () => {
    if (dismiss) {
      dismiss(); // fires onHide('manual') -> settle
    } else {
      settle();
    }
  };
  return Object.assign(close, {
    then: <TResult1 = boolean, TResult2 = never>(
      onfulfilled?:
        ((value: boolean) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?:
        ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) => closed.then(onfulfilled, onrejected),
  }) as MessageType;
}

export interface MessageOpenArgs extends MessageArgsProps {
  type: MessageKind;
}

export const message = {
  success: (content: JointContent, duration?: number, onClose?: () => void) =>
    open('success', content, duration, onClose),
  info: (content: JointContent, duration?: number, onClose?: () => void) =>
    open('info', content, duration, onClose),
  warning: (content: JointContent, duration?: number, onClose?: () => void) =>
    open('warning', content, duration, onClose),
  error: (content: JointContent, duration?: number, onClose?: () => void) =>
    open('error', content, duration, onClose),
  /** Covers the `message.open({ type, content })` shape (answers/07 §1.3). */
  open: ({ type, ...args }: MessageOpenArgs) => open(type, args),
  /**
   * Known gap, kept loud: `message.loading` has 0 call sites in this repo
   * (answers/07 §1) and Astryx Toast has no loading concept. A future call
   * site should fail fast here, not silently drop feedback.
   */
  loading: (): MessageType => {
    throw new Error(
      'app-shim message.loading is not implemented — no Astryx destination. ' +
        'Use useSetBAINotification for long-running feedback.',
    );
  },
  /** Known gap, kept loud: keyed `message.destroy` has 0 call sites. */
  destroy: (): void => {
    throw new Error('app-shim message.destroy is not implemented (0 usages).');
  },
};

export type MessageApi = typeof message;
