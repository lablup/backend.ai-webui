/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The text-input adapter on its own, so the login path does not pull the
// Typeahead / Tokenizer / MultiSelector controls; see astryxFormControls.tsx.
import { FormItemInputContext } from '../form-engine';
import type { TextInputProps } from '@lablup/ui-common/TextInput';
import { TextInput } from '@lablup/ui-common/TextInput';
import type { SizeValue } from '@lablup/ui-common/utils';
import { useBAIFormListInputCellStatus } from 'backend.ai-ui';
import React from 'react';

/**
 * RESTORED (input-parity pass) — **the control paints the field's validation
 * status again.**
 *
 * antd's `Form.Item` published its merged status on `FormItemInputContext` and
 * every antd control read it, which is how an invalid field got a red border
 * without a single call site passing anything. None of the Astryx adapters read
 * that context, so after the migration a failed rule printed a red MESSAGE
 * under a field that still looked pristine — on every `rules=`-bearing item in
 * the app.
 *
 * `statusVariant="detached"` with no `message` is deliberate: it is the one
 * combination that paints the border and NOTHING else. `'attached'` (Astryx's
 * default) would add an in-field status glyph antd never drew unless
 * `hasFeedback` was set — and where `hasFeedback` IS set, the form item already
 * renders that glyph itself, so the field would carry two.
 *
 * `'validating'` / `'success'` are intentionally not forwarded: antd painted
 * neither on the control (they drive the `hasFeedback` icon, which the item
 * owns).
 *
 * **`statusVariant` is CONSTANT — never conditional on `status`.** Astryx's
 * `Field` renders `{children}` inside an extra `<div>` when
 * `statusVariant === 'attached'` (its default) and as a bare fragment
 * otherwise. Returning `{}` while pristine and `{statusVariant: 'detached'}`
 * once a rule fails therefore changed the ELEMENT STRUCTURE at the control's
 * position, so React unmounted the whole control subtree and mounted a fresh
 * one — the `<input>` node was replaced and **focus was lost on the very first
 * keystroke** of any field carrying `rules` (measured on the login screen's
 * `api_endpoint`: character 1 landed, the node was swapped,
 * `document.activeElement` fell back to `<body>`, and characters 2..n went
 * nowhere). Pinning the variant keeps `Field`'s tree stable; with no
 * `status.message` the detached branch renders exactly `{children}`, so the
 * only thing dropped is that wrapper div (`display:flex;flex-direction:column`
 * inside a `Field` container that is already `flex column`) — layout-neutral.
 * `astryxFormControls.test.tsx` locks this in.
 */
export const useFormControlStatusProps = ():
  | {
      status?: { type: 'error' | 'warning' };
      statusVariant: 'detached';
    }
  | NonNullable<ReturnType<typeof useBAIFormListInputCellStatus>> => {
  'use memo';
  // Inside a BAIFormListInput cell the message goes to a tooltip instead.
  const cellStatus = useBAIFormListInputCellStatus();
  const { status } = React.useContext(FormItemInputContext);
  if (cellStatus) return cellStatus;
  if (status !== 'error' && status !== 'warning')
    return { statusVariant: 'detached' };
  return { status: { type: status }, statusVariant: 'detached' };
};

/**
 * Status without `statusVariant`, for the controls that are NOT built on
 * Astryx's `Field` (`Switch`, `CheckboxInput`): they accept `status` but do
 * not declare `statusVariant`, so passing it would only land an unknown
 * attribute on the DOM. They render no structural branch on status either, so
 * they never had the remount problem the hook above fixes.
 */
export const useFormControlStatusOnly = (): {
  status?: { type: 'error' | 'warning' };
} => {
  'use memo';
  const { status } = React.useContext(FormItemInputContext);
  if (status !== 'error' && status !== 'warning') return {};
  return { status: { type: status } };
};

export interface AstryxFormTextInputProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  disabled?: boolean;
  /** Astryx spelling. */
  hasClear?: boolean;
  /** antd spelling of `hasClear`, kept so migrated call sites read naturally. */
  allowClear?: boolean;
  /** antd `prefix` icon -> Astryx `startIcon` (icon component, not element). */
  startIcon?: TextInputProps['startIcon'];
  /** Astryx `TextInput.hasAutoFocus` passthrough (inline edit flows). */
  hasAutoFocus?: boolean;
  width?: SizeValue;
  /**
   * Astryx `TextInput.size`. Inline editors want `lg`, in-row fields want
   * `sm`; without it those call sites had to hand-roll a local adapter (D10).
   */
  size?: TextInputProps['size'];
  /**
   * antd `Input.onPressEnter` is Astryx's `onEnter` — with one difference the
   * adapter papers over: antd guarded the callback with
   * `!e.nativeEvent.isComposing`, Astryx does not. Without the guard the Enter
   * that CONFIRMS an IME candidate (Hangul, Kana, Pinyin …) also submits the
   * field, so a CJK user can never finish a word. See `handleKeyDown` below.
   */
  onEnter?: () => void;
  /**
   * antd `Input.maxLength` — the native attribute, hard-truncating input.
   * Astryx does not declare it, but it spreads unknown props onto the
   * `<input>`, so DECLARING it here is enough to make it work again.
   */
  maxLength?: number;
  /**
   * Native `autocomplete`. Same mechanism as `maxLength` — Astryx does not
   * declare it but spreads it onto the `<input>`, and without it browsers and
   * password managers lose the login form's field roles.
   */
  autoComplete?: string;
  /**
   * The key event Astryx exposes. antd's `onKeyUp`-based Escape-to-cancel
   * becomes `onKeyDown` here; inline editors are the only users.
   */
  onKeyDown?: TextInputProps['onKeyDown'];
  /** Native `name` attribute (autofill / password-manager hints). */
  htmlName?: string;
  /**
   * Fired with the new value AFTER `Form.Item`'s injected `onChange`. This is
   * the reason several call sites forked their own adapter: they need a side
   * effect (mark dirty, clear a resolved lookup) alongside the form write,
   * and `onChange` itself is owned by `Form.Item`.
   */
  onValueChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  'data-testid'?: string;
}

export const AstryxFormTextInput: React.FC<AstryxFormTextInputProps> = ({
  value,
  onChange,
  label,
  type,
  placeholder,
  disabled,
  hasClear,
  allowClear,
  startIcon,
  hasAutoFocus,
  width = '100%',
  size,
  onEnter,
  onKeyDown,
  htmlName,
  onValueChange,
  onBlur,
  ...rest
}) => {
  'use memo';
  const statusProps = useFormControlStatusProps();
  // antd's IME guard, reinstated. Astryx runs `onEnter` from its own keydown
  // handler BEFORE it calls ours, so the guard cannot live in `onKeyDown` — it
  // has to wrap `onEnter` itself, and `onEnter` carries no event. A composition
  // flag is the substitute: browsers deliver the confirming `keydown`
  // (`isComposing`/`keyCode === 229`) while the composition is still open, so
  // the flag is still set when `onEnter` fires.
  const composingRef = React.useRef(false);
  return (
    <TextInput
      type={type}
      value={value ?? ''}
      onChange={(next) => {
        onChange?.(next);
        onValueChange?.(next);
      }}
      label={label}
      isLabelHidden
      placeholder={placeholder}
      isDisabled={disabled}
      hasClear={hasClear ?? allowClear}
      startIcon={startIcon}
      hasAutoFocus={hasAutoFocus}
      width={width}
      size={size}
      onEnter={
        onEnter &&
        (() => {
          if (composingRef.current) return;
          onEnter();
        })
      }
      onKeyDown={onKeyDown}
      htmlName={htmlName}
      onBlur={onBlur}
      {...statusProps}
      {...(rest as object)}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={() => {
        composingRef.current = false;
      }}
    />
  );
};
