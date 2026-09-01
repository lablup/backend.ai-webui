/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Node-labelled marks are drawn in a second, absolutely-positioned layer built
 from Astryx's own mark formula (`inset-inline-start: ${percent}%`), because
 `Slider.marks` accepts only string labels. Astryx still draws every tick.

 Astryx's `NumberInput` REJECTS an out-of-range entry (`parseNumberInput`
 returns null past either bound) rather than clamping it, so `onBlur` reads the
 raw field text — the only surviving trace — and clamps from there.
*/
import useControllableState_deprecated from '../hooks/useControllableState';
import './InputNumberWithSlider.css';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Slider } from '@astryxdesign/core/Slider';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** antd-shaped position-keyed marks map — frozen for the call sites. */
type SliderMarks = Record<
  string | number,
  ReactNode | { style?: CSSProperties; label?: ReactNode }
>;

/** The number-input prop slice the call sites actually pass. */
interface InputNumberBag {
  placeholder?: string;
  /** Trailing unit text -> `NumberInput.units`. */
  suffix?: ReactNode;
  /**
   * Rendered as a direct `InputGroup` child so it welds onto the field — pass
   * an Astryx-weldable control, or wrap it in `InputGroupText` yourself.
   */
  addonAfter?: ReactNode;
  style?: CSSProperties;
}

/** The slider prop slice the call sites actually pass. */
interface SliderBag {
  marks?: SliderMarks;
  tooltip?: {
    formatter?: (value?: number) => ReactNode;
    /** Only `false` is used in the repo -> `valueDisplay="none"`. */
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
   * Accessible name for the pair. Astryx requires one on both controls;
   * surfaced here so a call site can name the field it sits under.
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

/** The position-keyed map -> a sorted list, `{label, style}` flattened. */
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
  'use memo';
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
          <NumberInput
            label={accessibleLabel}
            isLabelHidden
            max={max}
            min={min}
            step={step ?? undefined}
            hasNumberSteppers
            isDisabled={isDisabled}
            value={displayValue ?? null}
            placeholder={inputNumberProps?.placeholder}
            // Typed `ReactNode`, but every call site passes a plain string.
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
              // Astryx rejects an out-of-range entry instead of clamping it,
              // so the raw field text is the only surviving trace. (React 19
              // does not pool events, so reading `target.value` here is safe.)
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
          {inputNumberProps?.addonAfter}
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
