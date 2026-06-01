/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import useControllableState_deprecated from '../hooks/useControllableState';
import {
  InputNumber,
  Slider,
  InputNumberProps,
  SliderSingleProps,
  GetRef,
  Space,
} from 'antd';
import { SliderRangeProps } from 'antd/es/slider';
import { useUpdatableState, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useEffect } from 'react';

type OmitControlledProps<T> = Omit<T, 'value' | 'onChange'>;

interface InputNumberWithSliderProps {
  min?: number;
  max?: number;
  step?: number | null;
  disabled?: boolean;
  /**
   * Controls how the control looks while non-interactive.
   * - `'normal'` (default): standard antd `disabled` styling; the current
   *   value and slider handle remain visible.
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
  inputNumberProps?: OmitControlledProps<InputNumberProps>;
  inputContainerMinWidth?: number;
  style?: React.CSSProperties;
  sliderProps?:
    | OmitControlledProps<SliderSingleProps>
    | OmitControlledProps<SliderRangeProps>;
}
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
  ...otherProps
}) => {
  const [value, setValue] = useControllableState_deprecated(otherProps);
  const inputRef = React.useRef<GetRef<typeof InputNumber>>(null);

  // `'empty'` renders the control as disabled with no value, handle, or marks.
  const isEmptyMode = disableMode === 'empty';
  const isDisabled = disabled || isEmptyMode;
  const displayValue = isEmptyMode ? undefined : value;

  useEffect(() => {
    if (!allowNegative && _.isNumber(value)) {
      // when step is 1, make sure the value is integer
      if (step === 1 && value % 1 !== 0) {
        setValue(_.max([Math.round(value), min]));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // FIXME: this is a workaround to fix the issue that the value is not updated when the value is controlled
  const [key, updateKey] = useUpdatableState('first');
  useEffect(() => {
    if (!allowNegative) {
      const timeoutId = setTimeout(() => {
        updateKey(value);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BAIFlex direction="row" gap={'md'} style={style}>
      <BAIFlex
        style={{ flex: 2, minWidth: inputContainerMinWidth }}
        align="stretch"
        direction="column"
      >
        <Space.Compact block>
          {inputNumberProps?.addonBefore ? inputNumberProps.addonBefore : null}
          <InputNumber
            key={key}
            ref={inputRef}
            max={max}
            min={min}
            step={step ?? undefined}
            disabled={isDisabled}
            value={displayValue}
            onChange={setValue}
            onBlur={() => {
              if (_.isNumber(step) && step > 0) {
                if (
                  _.isNumber(max) &&
                  max < _.toNumber(inputRef.current?.value || '0')
                ) {
                  return; // do not update value if it is greater than max
                }
                const decimalCount = step.toString().split('.')[1]?.length || 0;
                setValue(
                  _.max([
                    _.toNumber(
                      (
                        Math.round(
                          _.toNumber(inputRef.current?.value || '0') / step,
                        ) * step
                      ).toFixed(decimalCount),
                    ),
                    min,
                  ]),
                );
              }
            }}
            {..._.omit(inputNumberProps, ['addonAfter', 'addonBefore'])}
            style={{
              width: '100%',
              ...inputNumberProps?.style,
            }}
          />
          {inputNumberProps?.addonAfter ? inputNumberProps.addonAfter : null}
        </Space.Compact>
      </BAIFlex>
      <BAIFlex direction="column" align="stretch" style={{ flex: 3 }}>
        <Slider
          max={max}
          min={min}
          step={step}
          disabled={isDisabled}
          value={displayValue}
          onChange={(value: any) => {
            if (min !== undefined && value < min) {
              return;
            } else {
              setValue(value);
            }
          }}
          {...sliderProps}
          // In empty mode, hide the handle and filled track (only the muted
          // rail remains) so the slider implies no value.
          styles={{
            ...sliderProps?.styles,
            ...(isEmptyMode
              ? { handle: { display: 'none' }, track: { display: 'none' } }
              : {}),
          }}
          // remove marks that are greater than max; empty mode shows none
          marks={
            isEmptyMode
              ? {}
              : _.omitBy(sliderProps?.marks, (_option, key) => {
                  return _.isNumber(max) ? _.parseInt(key) > max : false;
                })
          }
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default InputNumberWithSlider;
