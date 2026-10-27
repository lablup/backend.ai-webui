/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The text-input adapter on its own, so the login path does not pull the
// Typeahead / Tokenizer / MultiSelector controls; see astryxFormControls.tsx.
import type { TextInputProps } from '@lablup/ui-common/TextInput';
import { TextInput } from '@lablup/ui-common/TextInput';
import type { SizeValue } from '@lablup/ui-common/utils';
import React from 'react';

export interface AstryxFormTextInputProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
  /** Accessible name (`aria-label`); the enclosing `Form.Item` renders the visible one. */
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
      aria-label={label}
      placeholder={placeholder}
      disabled={disabled}
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
