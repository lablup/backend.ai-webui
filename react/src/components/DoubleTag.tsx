import Flex from './Flex';
import { Space, Tag } from 'antd';
import _ from 'lodash';
import React from 'react';

export type DoubleTagObjectValue = {
  label: ValueType;
  color?: string;
};

type ValueType = string | React.ReactNode;
const DoubleTag: React.FC<{
  values?: ValueType[] | DoubleTagObjectValue[];
}> = ({ values = [] }) => {
  if (values.length === 0) return null;
  let objectValues: DoubleTagObjectValue[];
  if (
    values[0] &&
    (typeof values[0] === 'string' || React.isValidElement(values[0]))
  ) {
    objectValues = values.map(
      (value) =>
        ({
          label: value,
          color: 'blue',
        }) as DoubleTagObjectValue,
    );
  } else {
    objectValues = values as DoubleTagObjectValue[];
  }

  return (
    <Flex direction="row">
      {_.map(objectValues, (objValue, idx) => {
        return (
          <Tag
            key={idx}
            style={
              _.last(objectValues) === objValue
                ? undefined
                : { margin: 0, marginRight: -1 }
            }
            color={objValue.color}
          >
            {objValue.label}
          </Tag>
        );
      })}
    </Flex>
  );
};

export default DoubleTag;
