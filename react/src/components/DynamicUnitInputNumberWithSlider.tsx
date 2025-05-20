import {
  compareNumberWithUnits,
  convertBinarySizeUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useUpdatableState } from '../hooks';
import useControllableState from '../hooks/useControllableState';
import DynamicUnitInputNumber, {
  DynamicUnitInputNumberProps,
} from './DynamicUnitInputNumber';
import Flex from './Flex';
import { Slider, theme } from 'antd';
import { SliderMarks } from 'antd/es/slider';
import _ from 'lodash';
import React, { useEffect, useMemo } from 'react';

export interface DynamicUnitInputNumberWithSliderProps
  extends DynamicUnitInputNumberProps {
  extraMarks?: SliderMarks;
  hideSlider?: boolean;
  warn?: string;
  step?: number;
  inputMinWidth?: number;
}
const DynamicUnitInputNumberWithSlider: React.FC<
  DynamicUnitInputNumberWithSliderProps
> = ({
  min = '0m',
  max = '32g',
  warn,
  units = ['m', 'g'],
  extraMarks,
  hideSlider,
  step = 0.05,
  ...otherProps
}) => {
  const [value, setValue] = useControllableState<string | undefined | null>(
    otherProps,
    {
      defaultValue: '0g',
    },
  );
  const { token } = theme.useToken();
  const minGiB = useMemo(() => convertBinarySizeUnit(min, 'g', 2), [min]);
  const maxGiB = useMemo(() => convertBinarySizeUnit(max, 'g', 2), [max]);
  const valueGiB = useMemo(
    () => convertBinarySizeUnit(value || '0g', 'g', 2),
    [value],
  );

  // const warnPercent = useMemo(() => {
  //   return warn
  //     ? ((iSizeToSize(warn, 'g', 2)?.number || 0) / (maxGiB?.number || 1)) * 100
  //     : undefined;
  // }, [warn, maxGiB?.number]);
  // console.log('##marks', marks);

  // FIXME: this is a workaround to fix the issue that the value is not updated when the value is controlled
  const [key, updateKey] = useUpdatableState('first');
  useEffect(() => {
    setTimeout(() => {
      updateKey(value?.toString());
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMinOversMaxValue =
    _.isNumber(minGiB?.number) &&
    _.isNumber(maxGiB?.number) &&
    minGiB?.number > maxGiB?.number;

  const filterOutInvalidMarks = (marks: SliderMarks) => {
    return _.omitBy({ ...marks }, (option, key) => {
      const markNumber = parseFloat(key);
      return (
        minGiB &&
        maxGiB &&
        (minGiB?.number > markNumber || maxGiB?.number < markNumber)
      );
    });
  };

  return (
    <Flex direction="row" gap={'md'}>
      <Flex
        style={{ flex: 2, minWidth: 190 }}
        direction="column"
        align="stretch"
      >
        <DynamicUnitInputNumber
          {...otherProps}
          key={key}
          min={min}
          max={max}
          units={units}
          // set value to 0mib when min value overs max value
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue);
          }}
          style={{
            minWidth: 130,
          }}
          roundStep={step}
          changeOnBlur={!isMinOversMaxValue}
        />
      </Flex>
      <Flex
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
        <Flex direction="column" align="stretch">
          {/* {warn && (
            <Flex
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
            </Flex>
          )} */}
          <Slider
            max={maxGiB?.number}
            styles={{
              track:
                (warn && {
                  backgroundColor:
                    compareNumberWithUnits(warn, value || '0b') < 0
                      ? token.colorWarning
                      : undefined,
                }) ||
                undefined,
              rail: {
                // backgroundColor:'red',
                // fill: 'red',
              },
            }}
            step={step}
            // min={minGiB.number}  // DO NOT use min, because slider left should be 0

            // For the slider, when min value overs max value, it will not work.
            // In this case, hide all information and disabled the slider.
            // Most of case, it's not a good idea to set the different value to the control value,
            // but in this case, it's okay to hide all information and disabled the slider.
            value={isMinOversMaxValue ? 0 : valueGiB?.number}
            disabled={isMinOversMaxValue}
            tooltip={{
              formatter: isMinOversMaxValue
                ? null
                : (value = 0) => {
                    return value < 1
                      ? `${(value * 1024).toFixed(2)} MiB`
                      : `${value.toFixed(2)} GiB`;
                  },
            }}
            onChange={(newNumValue) => {
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
                    style: {
                      color: token.colorTextSecondary,
                    },
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
              ..._.omitBy(extraMarks, (option, key) => {
                return _.isNumber(maxGiB?.number)
                  ? _.parseInt(key) > (maxGiB?.number as number)
                  : false;
              }),
              ...(maxGiB?.number && {
                [maxGiB.number]: {
                  style: {
                    color: token.colorTextSecondary,
                  },
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
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DynamicUnitInputNumberWithSlider;
