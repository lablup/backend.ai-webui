/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 antd `InputNumber` + `Slider` -> Astryx `NumberInput` + `Slider`
 (to-astryx final-A). This file was PARKED in W2-B under the frontier rule:
 its public API is two antd prop bags, and two of the keys its four call sites
 pass (`sliderProps.marks` with a JSX label, `sliderProps.tooltip.open`) had no
 Astryx destination. Both are resolved here; nothing is dropped.

 The public contract is unchanged. Per the frontier rule the prop bags stay
 antd-SHAPED — restated locally as `SliderMarks` / `InputNumberBag` /
 `SliderBag` rather than imported from antd, which is what kept this module (and
 everything downstream of the session launcher) in the antd import graph (P15).

 Mapping:

   `Space.Compact` + addonBefore/addonAfter -> `InputGroup` (the idiom
                                               `BAIDynamicUnitInputNumber`
                                               established in W2-D)
   `InputNumber`                            -> `NumberInput`
   `InputNumber.suffix`                     -> `NumberInput.units`
   `Slider.disabled`                        -> `isDisabled`
   `Slider.tooltip.formatter`               -> `formatValue`
   `Slider.tooltip.open === false`          -> `valueDisplay="none"`
   `Slider.marks`                           -> `marks` + the overlay below

 RESOLVED — **`tooltip.open`.** W2-B recorded this as having "no Astryx knob".
 It does: `valueDisplay`. The one consumer that passes it
 (`ResourceAllocationFormItems`, force-hiding the accelerator tooltip when the
 image supports no accelerator) passes `false | undefined` and never `true`, so
 `open === false -> valueDisplay="none"` covers the live behaviour exactly.
 A forced-OPEN tooltip would still have no equivalent; no call site wants one.

 RESOLVED — **JSX `marks` labels, via a marks overlay.** Astryx `Slider.marks`
 takes `{value, label?: string}[]` — a plain string — and every consumer places
 a `<RemainingMark />` (the "resources remaining" chevron) at a computed
 position. The sibling `BAIDynamicUnitInputNumberWithSlider` degraded those to
 `nodeToAccessibleLabel` in W2-D, which for `RemainingMark` means an unlabelled
 tick: the chevron disappears.

 It does not have to. Astryx's own mark geometry is plain and inset-free —
 `marksContainer` spans the track container edge to edge, each mark sits at
 `inset-inline-start: ${percent}%` with `translateX(-50%)`, and the label sits
 `THUMB_SIZE / 2 + 4` below that (`@astryxdesign/core/src/Slider/Slider.tsx`).
 So the node-valued marks are rendered in a second, absolutely-positioned layer
 built from the SAME formula, over a `position: relative` wrapper sized to the
 slider. Every mark value — string or node — is still handed to Astryx so it
 draws its tick; only the label rendering splits. The layer is
 `pointer-events: none`, so dragging the rail underneath is unaffected.

 PILOT-DECISION — **per-mark `style` is honoured, `sliderProps.styles` is not.**
 `RuntimeParameterFormSection` tints its max mark with `{style: {color:
 colorTextSecondary}}`; a mark rendered in our own layer can simply take that
 style, so it is applied (the string-labelled marks Astryx draws cannot, and
 Astryx already paints marks in the secondary text colour — which is what that
 style asked for). `styles.track` / `styles.handle` were only ever set by this
 file itself, for `disableMode="empty"`; see `bai-slider--empty` below.

 PILOT-DECISION — **the `useUpdatableState` remount hack is deleted.** It held
 a `key` on the `InputNumber` and bumped it once, on a `setTimeout(0)` after
 mount, under a `FIXME: workaround to fix the issue that the value is not
 updated when the value is controlled`. That is an antd `InputNumber` bug:
 Astryx's `NumberInput` is a plain controlled native input, so remounting it
 fixes nothing and only throws away focus. The same call also made the
 `inputRef` DOM read in `onBlur` necessary (antd's own value could lag the
 input's); the step-snapping now reads the controlled value directly.
*/
import useControllableState_deprecated from '../hooks/useControllableState';
import './InputNumberWithSlider.css';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Slider } from '@astryxdesign/core/Slider';
import { HStack } from '@astryxdesign/core/Stack';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** antd's `SliderMarks`, restated locally (P15 — no antd type imports). */
export type SliderMarks = Record<
  string | number,
  ReactNode | { style?: CSSProperties; label?: ReactNode }
>;

/** The `InputNumberProps` slice the four call sites actually pass. */
interface InputNumberBag {
  placeholder?: string;
  /** antd's trailing unit text -> `NumberInput.units`. */
  suffix?: ReactNode;
  addonBefore?: ReactNode;
  addonAfter?: ReactNode;
  style?: CSSProperties;
}

/** The `SliderSingleProps` slice the four call sites actually pass. */
interface SliderBag {
  marks?: SliderMarks;
  tooltip?: {
    formatter?: (value?: number) => ReactNode;
    /** Only `false` is used in the repo — see the header. */
    open?: boolean;
  };
}

interface InputNumberWithSliderProps {
  min?: number;
  max?: number;
  step?: number | null;
  disabled?: boolean;
  /**
   * Controls how the control looks while non-interactive.
   * - `'normal'` (default): standard disabled styling; the current value and
   *   slider handle remain visible.
   * - `'empty'`: render the control as disabled AND visually empty — the
   *   number input shows no value, the slider hides its handle and filled
   *   track (only the muted rail remains), and no marks are shown. Use this
   *   for derived / auto-allocated fields that have no user-settable value
   *   (e.g. unified-memory accelerators).
   *
   * Note: `'empty'` only affects presentation. Clear the bound form value
   * separately if it must also be excluded from submission.
   */
  disableMode?: 'normal' | 'empty';
  value?: number;
  allowNegative?: boolean;
  onChange?: (value: number) => void;
  inputNumberProps?: InputNumberBag;
  inputContainerMinWidth?: number;
  style?: CSSProperties;
  sliderProps?: SliderBag;
  /**
   * Accessible name for the pair. Astryx requires one on both controls (antd
   * required none); surfaced here so a call site can name the field it sits
   * under instead of taking the generic default.
   */
  label?: string;
}

/** A mark label Astryx can render itself. */
const isPlainLabel = (label: ReactNode): label is string | number =>
  _.isString(label) || _.isNumber(label);

interface NormalizedMark {
  value: number;
  label: ReactNode;
  style?: CSSProperties;
}

/** antd's position-keyed map -> a sorted list, `{label, style}` flattened. */
const normalizeMarks = (marks: SliderMarks | undefined): NormalizedMark[] =>
  _.sortBy(
    _.map(marks, (mark, key) => {
      const isConfigObject =
        _.isObject(mark) && !React.isValidElement(mark) && 'label' in mark;
      return {
        value: Number(key),
        label: isConfigObject
          ? (mark as { label?: ReactNode }).label
          : (mark as ReactNode),
        style: isConfigObject
          ? (mark as { style?: CSSProperties }).style
          : undefined,
      };
    }),
    'value',
  );

/** Astryx's own mark maths, so the overlay lands on the same pixels. */
const percentOf = (value: number, min: number, max: number) =>
  max === min ? 0 : ((value - min) / (max - min)) * 100;

const InputNumberWithSlider: React.FC<InputNumberWithSliderProps> = ({
  min,
  max,
  step,
  disabled,
  disableMode = 'normal',
  inputNumberProps,
  sliderProps,
  allowNegative,
  inputContainerMinWidth,
  style,
  label,
  ...otherProps
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useControllableState_deprecated(otherProps);

  // `'empty'` renders the control as disabled with no value, handle, or marks.
  const isEmptyMode = disableMode === 'empty';
  const isDisabled = disabled || isEmptyMode;
  const displayValue = isEmptyMode ? undefined : value;
  const accessibleLabel = label ?? t('general.Value');

  useEffect(() => {
    if (!allowNegative && _.isNumber(value)) {
      // when step is 1, make sure the value is integer
      if (step === 1 && value % 1 !== 0) {
        setValue(_.max([Math.round(value), min]));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const sliderMin = min ?? 0;
  const sliderMax = max ?? 100;

  // Marks above `max` are dropped (a remaining-marker can outrun a lowered
  // limit); empty mode shows none at all.
  const marks = isEmptyMode
    ? []
    : _.filter(
        normalizeMarks(sliderProps?.marks),
        (mark) => !_.isNumber(max) || mark.value <= max,
      );
  // Astryx draws every tick; it renders only the labels it can (strings).
  const astryxMarks = _.map(marks, (mark) => ({
    value: mark.value,
    label: isPlainLabel(mark.label) ? String(mark.label) : undefined,
  }));
  // …and the node labels are drawn by the overlay, on the same geometry.
  const nodeMarks = _.filter(
    marks,
    (mark) => !_.isNil(mark.label) && !isPlainLabel(mark.label),
  );

  const formatter = sliderProps?.tooltip?.formatter;

  return (
    <BAIFlex direction="row" gap={'md'} style={style}>
      <BAIFlex
        style={{ flex: 2, minWidth: inputContainerMinWidth }}
        align="stretch"
        direction="column"
      >
        <InputGroup
          label={accessibleLabel}
          isLabelHidden
          isDisabled={isDisabled}
        >
          {inputNumberProps?.addonBefore ? (
            <HStack align="center">{inputNumberProps.addonBefore}</HStack>
          ) : null}
          <NumberInput
            label={accessibleLabel}
            isLabelHidden
            max={max}
            min={min}
            step={step ?? undefined}
            isDisabled={isDisabled}
            value={displayValue ?? null}
            placeholder={inputNumberProps?.placeholder}
            // antd's `suffix` was a unit hint rendered inside the field —
            // exactly what `units` is. It is typed `ReactNode` on the antd
            // side but every call site passes a plain unit string.
            units={
              _.isString(inputNumberProps?.suffix)
                ? inputNumberProps.suffix
                : undefined
            }
            onChange={(next) => {
              if (_.isNil(next)) return;
              setValue(next);
            }}
            onBlur={(event) => {
              // RESTORED: antd's `InputNumber` CLAMPED an out-of-range entry
              // on blur. Astryx's rejects it instead — `parseNumberInput`
              // returns null past either bound, so `onChange` never fires and
              // the entry silently reverts. The raw field text is the only
              // surviving trace; clamp from there. (React 19 does not pool
              // events, so reading `target.value` in the handler is safe.)
              const rawText = (event.target as HTMLInputElement).value;
              const typed = rawText.trim() === '' ? NaN : Number(rawText);
              let current = value;
              if (
                Number.isFinite(typed) &&
                typed !== value &&
                (_.isNumber(min) || _.isNumber(max))
              ) {
                const clamped = _.clamp(
                  typed,
                  _.isNumber(min) ? min : -Infinity,
                  _.isNumber(max) ? max : Infinity,
                );
                if (clamped !== value) {
                  current = clamped;
                  setValue(clamped);
                }
              }
              // Snap to the nearest step. antd needed the raw DOM value for
              // this because its own value could lag; Astryx commits on
              // change, so the controlled value is already current.
              if (_.isNumber(step) && step > 0 && _.isNumber(current)) {
                if (_.isNumber(max) && max < current) {
                  return; // do not update value if it is greater than max
                }
                const decimalCount = step.toString().split('.')[1]?.length || 0;
                setValue(
                  _.max([
                    _.toNumber(
                      (Math.round(current / step) * step).toFixed(decimalCount),
                    ),
                    min,
                  ]),
                );
              }
            }}
            width="100%"
            style={inputNumberProps?.style}
          />
          {inputNumberProps?.addonAfter ? (
            <HStack align="center">{inputNumberProps.addonAfter}</HStack>
          ) : null}
        </InputGroup>
      </BAIFlex>
      <BAIFlex direction="column" align="stretch" style={{ flex: 3 }}>
        {/* The positioning context the marks overlay is measured against. The
            Astryx slider's track container fills it edge to edge, which is
            what makes `percent%` land on the same pixel as Astryx's own
            ticks. */}
        <div
          className={
            isEmptyMode ? 'bai-slider bai-slider--empty' : 'bai-slider'
          }
        >
          <Slider
            label={accessibleLabel}
            isLabelHidden
            width="100%"
            max={sliderMax}
            min={sliderMin}
            step={step ?? undefined}
            isDisabled={isDisabled}
            value={displayValue ?? sliderMin}
            valueDisplay={
              isEmptyMode || sliderProps?.tooltip?.open === false
                ? 'none'
                : 'tooltip'
            }
            formatValue={
              formatter
                ? (sliderValue) => String(formatter(sliderValue) ?? '')
                : undefined
            }
            marks={astryxMarks.length ? astryxMarks : undefined}
            onChange={(next: number) => {
              if (min !== undefined && next < min) {
                return;
              }
              setValue(next);
            }}
          />
          {nodeMarks.length ? (
            <div className="bai-slider__node-marks" aria-hidden="true">
              {_.map(nodeMarks, (mark) => (
                <span
                  key={mark.value}
                  className="bai-slider__node-mark"
                  style={{
                    insetInlineStart: `${percentOf(mark.value, sliderMin, sliderMax)}%`,
                    ...mark.style,
                  }}
                >
                  {mark.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </BAIFlex>
    </BAIFlex>
  );
};

export default InputNumberWithSlider;
