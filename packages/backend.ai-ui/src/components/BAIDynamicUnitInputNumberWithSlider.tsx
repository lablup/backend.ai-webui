/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDynamicUnitInputNumberWithSlider` on Astryx (to-astryx W2-D).

 antd `Slider` -> Astryx `Slider` (MAPPING §4, a DIRECT mapping):
 `tooltip.formatter` -> `formatValue` + `valueDisplay`, `disabled` ->
 `isDisabled`, `marks` ✅ (shape change, below). The paired number field is the
 already-converted `BAIDynamicUnitInputNumber`.

 PILOT-DECISION — **`extraMarks` keeps its antd shape on the surface and is
 translated inside.** antd `SliderMarks` is a `{[position]: ReactNode | {label,
 style}}` map; Astryx wants `{value: number, label?: string}[]` — an ARRAY, and
 the label is a plain STRING. The one live consumer
 (`ResourceAllocationFormItems`) passes a JSX `<RemainingMark />` label, so per
 the frontier rule the prop type stays antd-shaped (restated locally, no antd
 import) and `toAstryxMarks` flattens each label with
 `nodeToAccessibleLabel` — a JSX label degrades to its text, or to an unlabelled
 tick when it has none (P2: casting the node `as string` would have printed
 `[object Object]` on the rail).

 PILOT-DECISION — **the per-mark `style={{color: colorTextSecondary}}` and the
 `styles.track` warning tint are DROPPED.** Astryx `Slider` exposes no slot
 styling at all (no `styles`, no per-mark style) — closed by construction (P5).
 The mark colour was already the secondary text colour Astryx paints marks in
 by default, so nothing changes there; the warning-track tint is a real loss
 and the `warn` prop is now inert. It has no live consumer: `warn` is passed
 nowhere in the repo (measured), and the code that drew the matching warning
 arrow was already commented out.
*/
import {
  convertToBinaryUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { nodeToAccessibleLabel } from '../helper/astryxLabel';
import { useControllableValue, useUpdatableState } from '../hooks';
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIDynamicUnitInputNumber, {
  BAIDynamicUnitInputNumberProps,
} from './BAIDynamicUnitInputNumber';
import BAIFlex from './BAIFlex';
import { Slider } from '@astryxdesign/core/Slider';
import * as _ from 'lodash-es';
import React, { useEffect, useMemo } from 'react';

/**
 * antd's `SliderMarks`, restated locally (the antd type import is what kept
 * this module in the antd import graph — P15).
 */
export type BAISliderMarks = Record<
  string | number,
  React.ReactNode | { style?: React.CSSProperties; label?: React.ReactNode }
>;

/** antd's position-keyed map -> Astryx's sorted `{value, label}` array. */
const toAstryxMarks = (
  marks: BAISliderMarks,
): Array<{ value: number; label?: string }> =>
  _.sortBy(
    _.map(marks, (mark, key) => {
      const node =
        mark && typeof mark === 'object' && 'label' in mark
          ? (mark as { label?: React.ReactNode }).label
          : (mark as React.ReactNode);
      const label = nodeToAccessibleLabel(node ?? null);
      return { value: Number(key), label: label === '' ? undefined : label };
    }),
    'value',
  );

export interface BAIDynamicUnitInputNumberWithSliderProps extends BAIDynamicUnitInputNumberProps {
  extraMarks?: BAISliderMarks;
  hideSlider?: boolean;
  warn?: string;
  step?: number;
  inputMinWidth?: number;
  addonPrefix?: React.ReactNode;
  addonSuffix?: React.ReactNode;
}
const BAIDynamicUnitInputNumberWithSlider: React.FC<
  BAIDynamicUnitInputNumberWithSliderProps
> = ({
  min = '0m',
  max = '32g',
  warn: _warn,
  units = ['m', 'g'],
  extraMarks,
  hideSlider,
  step = 0.05,
  addonPrefix,
  addonSuffix,
  defaultUnit,
  ...otherProps
}) => {
  const [value, setValue] = useControllableValue<string | undefined | null>(
    otherProps,
    {
      defaultValue: undefined,
    },
  );
  const { t } = useBAIi18n();
  const minGiB = useMemo(() => convertToBinaryUnit(min, 'g', 2), [min]);
  const maxGiB = useMemo(() => convertToBinaryUnit(max, 'g', 2), [max]);
  const valueGiB = useMemo(
    () => convertToBinaryUnit(value || '0g', 'g', 2),
    [value],
  );

  // FIXME: this is a workaround to fix the issue that the value is not updated when the value is controlled
  const [key, updateKey] = useUpdatableState('first');
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateKey(value?.toString());
    }, 0);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMinOversMaxValue =
    _.isNumber(minGiB?.number) &&
    _.isNumber(maxGiB?.number) &&
    minGiB?.number > maxGiB?.number;

  const filterOutInvalidMarks = (marks: BAISliderMarks) =>
    toAstryxMarks(
      _.omitBy({ ...marks }, (_option, key) => {
        const markNumber = parseFloat(key);
        return (
          minGiB &&
          maxGiB &&
          (minGiB?.number > markNumber || maxGiB?.number < markNumber)
        );
      }),
    );

  return (
    <BAIFlex direction="row" gap={'md'}>
      <BAIFlex
        style={{ flex: 2, minWidth: 190 }}
        direction="column"
        align="stretch"
      >
        <BAIDynamicUnitInputNumber
          {...otherProps}
          key={key}
          min={min}
          max={max}
          units={units}
          defaultUnit={defaultUnit}
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue);
          }}
          style={{
            width: '100%',
          }}
          roundStep={step}
          // antd's `changeOnBlur` is gone with `InputNumberProps`: the Astryx
          // number field commits on change and rounds on blur unconditionally,
          // so there is no "only commit on blur" mode left to toggle.
          addonPrefix={addonPrefix}
          addonSuffix={addonSuffix}
        />
      </BAIFlex>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 3,
          ...(hideSlider && {
            visibility: 'hidden',
            height: 0,
          }),
        }}
      >
        <BAIFlex direction="column" align="stretch">
          {/* {warn && (
            <BAIFlex
              direction="row"
              style={{
                position: 'absolute',
                left: 0,
                top: 14.5,
                width: '100%',
                height: 4,
                padding: '0 5px',
              }}
              align="start"
            >
              <div
                style={{
                  width: warnPercent + '%',
                  height: 4,
                }}
              ></div>
              <div
                style={{
                  marginTop: 3,
                  marginLeft: -3.5,
                  width: 0,
                  height: 0,

                  borderTop: '4px solid transparent',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: `7px solid ${token.colorWarning}`,
                }}
              ></div>
            </BAIFlex>
          )} */}
          <Slider
            label={t('comp:BAIDynamicUnitInputNumberWithSlider.Amount')}
            isLabelHidden
            // antd's `Slider` filled its flex track; Astryx's sizes to its
            // CONTENT unless told otherwise, which collapsed the rail to a
            // few pixels and stacked the marks on top of each other. Caught by
            // the Storybook screenshot, not by any gate (the classic P10/P12
            // shape).
            width="100%"
            max={maxGiB?.number}
            step={step}
            // min={minGiB.number}  // DO NOT use min, because slider left should be 0

            // For the slider, when min value overs max value, it will not work.
            // In this case, hide all information and disabled the slider.
            // Most of case, it's not a good idea to set the different value to the control value,
            // but in this case, it's okay to hide all information and disabled the slider.
            value={isMinOversMaxValue ? 0 : (valueGiB?.number ?? 0)}
            isDisabled={isMinOversMaxValue}
            valueDisplay={isMinOversMaxValue ? 'none' : 'tooltip'}
            formatValue={(sliderValue = 0) =>
              sliderValue < 1
                ? `${(sliderValue * 1024).toFixed(2)} MiB`
                : `${sliderValue.toFixed(2)} GiB`
            }
            onChange={(newNumValue: number) => {
              if (minGiB?.number && minGiB.number > newNumValue) {
                setValue(min);
              } else {
                setValue(
                  newNumValue < 1
                    ? `${newNumValue * 1024}m`
                    : `${newNumValue}g`,
                );
              }
            }}
            marks={filterOutInvalidMarks({
              ...(minGiB &&
                _.isNumber(minGiB?.number) && {
                  [minGiB.number]: {
                    // if 0, without unit
                    label:
                      minGiB.number === 0
                        ? minGiB.number
                        : minGiB.number >= 1
                          ? minGiB.number + 'g'
                          : minGiB.number * 1024 + 'm',
                  },
                }),
              // extra: remaining mark code should be located before max mark code to prevent overlapping when it is same value
              ..._.omitBy(extraMarks, (_option, key) => {
                return _.isNumber(maxGiB?.number)
                  ? _.parseInt(key) > (maxGiB?.number as number)
                  : false;
              }),
              ...(maxGiB?.number && {
                [maxGiB.number]: {
                  label:
                    maxGiB.number === 0
                      ? maxGiB.number
                      : maxGiB.number >= 1
                        ? toFixedFloorWithoutTrailingZeros(maxGiB.number, 2) +
                          'g'
                        : toFixedFloorWithoutTrailingZeros(
                            maxGiB.number * 1024,
                            2,
                          ) + 'm',
                },
              }),
            })}
          />
        </BAIFlex>
      </BAIFlex>
    </BAIFlex>
  );
};

export default BAIDynamicUnitInputNumberWithSlider;
