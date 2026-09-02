/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIColorPicker` (to-astryx final-A).

 GAP COMPONENT — Astryx ships no colour picker. Re-checked at the endgame with
 `astryx component ColorPicker` / `astryx component ColorInput` (both "No
 component named …") and `astryx search "picker swatch hex"`, which returns
 only the Selector family. The `component --list` roster (155 components) has
 no colour entry either. antd `ColorPicker` was graded MAPPING NONE, and that
 grade stands.

 So the widget is built here, on the two things that do exist: the platform's
 own `<input type="color">` for the colour *area*, and Astryx chrome for
 everything around it (`Popover`, `TextInput`, `Button`, plus the field styling
 in BAIColorPicker.css). Nothing renders antd.

 SCOPE — this covers exactly the prop slice the three live call sites use
 (`LightDarkColorPicker` and, through it, the Branding `ThemeColorPicker` and
 the User Settings `ThemeAccentColorPicker`): `value`, `onChangeComplete`,
 `allowClear` + `onClear`, `showText`, `disabled`, `style`, `data-testid`. It
 is not a general-purpose reimplementation of antd's picker, and deliberately
 has no gradient/HSB canvas, no preset palettes, no alpha and no format switch.

 PILOT-DECISION — **the value is a hex STRING on both edges.** antd handed
 `onChangeComplete` a `Color` object and every call site immediately called
 `.toHexString()`; `format="hex"` and `disabledAlpha` were passed to force
 exactly that. Carrying a colour class across the boundary just to have all
 three consumers unwrap it is the antd accident, not a requirement — so the
 callback emits `#rrggbb` directly and the two format props are gone rather
 than kept as no-ops. `disabledAlpha` is not "dropped": alpha never exists
 here, which is what those call sites asked for.

 PILOT-DECISION — **`onChangeComplete` fires on commit, not on drag.** antd
 distinguished `onChange` (live) from `onChangeComplete` (settled) and the call
 sites all write a *setting* — a live callback would rebuild the theme on every
 pointer move. The native input's `change` event is exactly antd's "complete"
 signal, so it is subscribed directly (React's `onChange` maps to the `input`
 event, which is the live one); the hex field commits as soon as the typed text
 is a whole colour, or on Enter. Closing the popover commits NOTHING — see the
 note on `onOpenChange`.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import './BAIColorPicker.css';
import BAIFlex from './BAIFlex';
import { Button } from '@astryxdesign/core/Button';
import { Popover } from '@astryxdesign/core/Popover';
import { TextInput } from '@astryxdesign/core/TextInput';
import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const FULL_HEX = /^#[0-9a-fA-F]{6}$/;
const SHORT_HEX = /^#[0-9a-fA-F]{3}$/;
const HEX_WITH_ALPHA = /^#[0-9a-fA-F]{8}$/;
const RGB_FUNCTION = /^rgba?\(([^)]+)\)$/i;

const toHexPair = (channel: number) =>
  Math.max(0, Math.min(255, Math.round(channel)))
    .toString(16)
    .padStart(2, '0');

/**
 * Normalise whatever the caller holds into the `#rrggbb` a native colour
 * input accepts. Theme documents store hex, but a token read straight off the
 * shim can still arrive as `rgb()` / `rgba()` (the probe's native output) or
 * as `#rgb`, and an unparseable value must not silently paint black — it
 * returns `null` so the swatch can render "unset" instead.
 */
export const toHexColor = (value?: string | null): string | null => {
  if (!value) return null;
  const raw = value.trim();
  if (FULL_HEX.test(raw)) return raw.toLowerCase();
  if (HEX_WITH_ALPHA.test(raw)) return raw.slice(0, 7).toLowerCase();
  if (SHORT_HEX.test(raw)) {
    const [, r, g, b] = raw;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const rgb = RGB_FUNCTION.exec(raw);
  if (rgb) {
    const parts = rgb[1]
      .split(/[,/\s]+/)
      .filter(Boolean)
      .map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
      return `#${toHexPair(parts[0])}${toHexPair(parts[1])}${toHexPair(parts[2])}`;
    }
  }
  return null;
};

export interface BAIColorPickerProps {
  /** Current colour. Hex, or anything `toHexColor` can normalise. */
  value?: string | null;
  /** Fires with `#rrggbb` when the user settles on a colour. */
  onChangeComplete?: (hex: string) => void;
  /** Renders the hex next to the swatch on the trigger (antd's `showText`). */
  showText?: boolean;
  /** Offers a "clear" action inside the popover. */
  allowClear?: boolean;
  onClear?: () => void;
  disabled?: boolean;
  /**
   * Accessible name for the trigger. Falls back to a generic one; the call
   * sites sit under a visible label of their own.
   */
  label?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

const BAIColorPicker: React.FC<BAIColorPickerProps> = ({
  value,
  onChangeComplete,
  showText,
  allowClear,
  onClear,
  disabled,
  label,
  style,
  'data-testid': testId,
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const areaRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const hex = toHexColor(value);
  // The popover's working copy — session state, seeded when the popover opens
  // rather than mirrored from `value` by an effect (the trigger's swatch reads
  // `hex` directly, so there is nothing to keep in sync while closed). When
  // the caller's value is not a colour we can show, the area still needs
  // *something*, so it opens on black while the swatch keeps rendering the
  // checkerboard until a real choice is committed.
  const [draft, setDraft] = useState<string>(hex ?? '#000000');
  const [text, setText] = useState<string>(hex ?? '');

  const commit = (next: string) => {
    const normalised = toHexColor(next);
    if (!normalised || normalised === hex) return;
    onChangeComplete?.(normalised);
  };

  // antd's `onChangeComplete` == the native `change` event. React's `onChange`
  // is wired to `input` (fires all through a drag), so the settled signal has
  // to be subscribed on the node itself.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const handleChange = () => commit(el.value);
    el.addEventListener('change', handleChange);
    return () => el.removeEventListener('change', handleChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hex]);

  const triggerLabel = label ?? t('comp:BAIColorPicker.SelectColor');

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          setDraft(hex ?? '#000000');
          setText(hex ?? '');
        }
        // Nothing to commit on CLOSE. Both real commit paths have already
        // fired by then (the native `change` event, and the hex field on a
        // complete value), so a close-commit could only ever re-send a value
        // — and it did exactly that after `onClear`, re-writing the accent the
        // user had just cleared. Caught by the live probe, not by any gate.
      }}
      label={triggerLabel}
      placement="below"
      alignment="start"
      content={
        <BAIFlex
          direction="column"
          align="stretch"
          gap="sm"
          style={{ minWidth: 200 }}
        >
          <input
            ref={areaRef}
            type="color"
            className="bai-color-picker__area"
            aria-label={triggerLabel}
            data-testid={testId ? `${testId}-area` : undefined}
            value={draft}
            disabled={disabled}
            onChange={(e) => {
              setDraft(e.target.value);
              setText(e.target.value);
            }}
          />
          <TextInput
            label={t('comp:BAIColorPicker.HexValue')}
            isLabelHidden
            size="sm"
            value={text}
            placeholder="#000000"
            isDisabled={disabled}
            data-testid={testId ? `${testId}-hex` : undefined}
            onChange={(next) => {
              setText(next);
              // Commit as soon as the typed text is a whole colour — the
              // field has no OK button, and waiting for blur loses the value
              // when the user clicks straight back onto the page.
              const normalised = toHexColor(next);
              if (normalised) {
                setDraft(normalised);
                commit(normalised);
              }
            }}
            onEnter={() => commit(text)}
          />
          {allowClear ? (
            <Button
              variant="ghost"
              size="sm"
              label={t('comp:BAIColorPicker.Clear')}
              data-testid={testId ? `${testId}-clear` : undefined}
              isDisabled={disabled}
              onClick={() => {
                onClear?.();
                setIsOpen(false);
              }}
            />
          ) : null}
        </BAIFlex>
      }
    >
      <button
        type="button"
        className="bai-color-picker__trigger"
        disabled={disabled}
        style={style}
        data-testid={testId}
        aria-label={showText ? undefined : triggerLabel}
      >
        <span className="bai-color-picker__swatch" aria-hidden="true">
          <span
            className="bai-color-picker__swatch-fill"
            style={{ backgroundColor: hex ?? 'transparent' }}
          />
        </span>
        {showText ? (
          <span data-testid={testId ? `${testId}-value` : undefined}>
            {hex ?? t('comp:BAIColorPicker.NoColor')}
          </span>
        ) : null}
      </button>
    </Popover>
  );
};

export default BAIColorPicker;
