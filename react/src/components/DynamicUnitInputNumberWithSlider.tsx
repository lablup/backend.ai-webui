import { iSizeToSize } from '../helper';
import DynamicUnitInputNumber, {
  DynamicUnitInputNumberProps,
} from './DynamicUnitInputNumber';
import Flex from './Flex';
import { useControllableValue } from 'ahooks';
import { Slider } from 'antd';
import React, { useMemo } from 'react';

export interface DynamicUnitInputNumberWithSliderProps
  extends DynamicUnitInputNumberProps {}
const DynamicUnitInputNumberWithSlider: React.FC<
  DynamicUnitInputNumberWithSliderProps
> = ({ min = '0m', max = '32g', units = ['m', 'g'], ...otherProps }) => {
  const [value, setValue] = useControllableValue<string>(otherProps, {
    defaultValue: '0g',
  });
  // const { token } = theme.useToken();
  const minGiB = useMemo(() => iSizeToSize(min, 'g', 2), [min]);
  const maxGiB = useMemo(() => iSizeToSize(max, 'g', 2), [max]);
  const valueGiB = useMemo(() => iSizeToSize(value, 'g', 2), [value]);
  return (
    <Flex direction="row" gap={'md'}>
      <Flex direction="column" align="stretch" style={{ flex: 3 }}>
        <Slider
          max={maxGiB.number}
          step={0.05}
          // min={minGiB.number}  // DO NOT use min, because slider left should be 0
          value={valueGiB.number}
          tooltip={{
            formatter: (value = 0) => {
              return value < 1
                ? `${(value * 1024).toFixed(2)} MiB`
                : `${value.toFixed(2)} GiB`;
            },
          }}
          onChange={(newNumValue) => {
            if (minGiB.number > newNumValue) {
              setValue(min);
            } else {
              setValue(
                newNumValue < 1 ? `${newNumValue * 1024}m` : `${newNumValue}g`,
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
            [minGiB.number]: minGiB.number + 'g',
            [maxGiB.number]: maxGiB.number + 'g',
          }}
        />
      </Flex>
      <Flex style={{ flex: 2 }}>
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
