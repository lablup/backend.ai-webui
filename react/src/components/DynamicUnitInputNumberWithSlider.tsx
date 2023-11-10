import { compareNumberWithUnits, iSizeToSize } from '../helper';
import DynamicUnitInputNumber, {
  DynamicUnitInputNumberProps,
} from './DynamicUnitInputNumber';
import Flex from './Flex';
import { useControllableValue } from 'ahooks';
import { Slider, theme } from 'antd';
import { SliderMarks } from 'antd/es/slider';
import _ from 'lodash';
import React, { useMemo } from 'react';

export interface DynamicUnitInputNumberWithSliderProps
  extends DynamicUnitInputNumberProps {
  extraMarks?: SliderMarks;
  warn?: string;
}
const DynamicUnitInputNumberWithSlider: React.FC<
  DynamicUnitInputNumberWithSliderProps
> = ({
  min = '0m',
  max = '32g',
  warn,
  units = ['m', 'g'],
  extraMarks,
  ...otherProps
}) => {
  const [value, setValue] = useControllableValue<string | undefined | null>(
    otherProps,
    {
      defaultValue: '0g',
    },
  );
  const { token } = theme.useToken();
  const minGiB = useMemo(() => iSizeToSize(min, 'g', 2), [min]);
  const maxGiB = useMemo(() => iSizeToSize(max, 'g', 2), [max]);
  const valueGiB = useMemo(() => iSizeToSize(value || '0g', 'g', 2), [value]);

  const warnPercent = useMemo(() => {
    return warn
      ? ((iSizeToSize(warn, 'g', 2)?.number || 0) / (maxGiB?.number || 1)) * 100
      : undefined;
  }, [warn, maxGiB?.number]);
  // console.log('##marks', marks);
  return (
    <Flex direction="row" gap={'md'}>
      <Flex direction="column" align="stretch" style={{ flex: 3 }}>
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
            trackStyle={
              (warn && {
                backgroundColor:
                  compareNumberWithUnits(warn, value || '0b') < 0
                    ? token.colorWarning
                    : undefined,
              }) ||
              undefined
            }
            railStyle={
              {
                // backgroundColor:'red',
                // fill: 'red',
              }
            }
            step={0.05}
            // min={minGiB.number}  // DO NOT use min, because slider left should be 0
            value={valueGiB?.number}
            tooltip={{
              formatter: (value = 0) => {
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
            marks={{
              // 0: {
              //   style: {
              //     color: token.colorTextSecondary,
              //   },
              //   label: 0,
              // },
              ...(minGiB &&
                _.isNumber(minGiB?.number) && {
                  [minGiB.number]: {
                    style: {
                      color: token.colorTextSecondary,
                    },
                    // if 0, without unit
                    label: minGiB.number + (minGiB.number ? 'g' : ''),
                  },
                }),
              ...(maxGiB?.number && {
                [maxGiB.number]: {
                  style: {
                    color: token.colorTextSecondary,
                  },
                  label: maxGiB.number + 'g',
                },
              }),
              // ...extraMarks,
            }}
          />
        </Flex>
      </Flex>
      <Flex
        style={{ flex: 2, minWidth: 130 }}
        direction="column"
        align="stretch"
      >
        <DynamicUnitInputNumber
          {...otherProps}
          min={min}
          max={max}
          units={units}
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue);
          }}
          style={{
            minWidth: 130,
          }}
        />
      </Flex>
    </Flex>
  );
};

export default DynamicUnitInputNumberWithSlider;
