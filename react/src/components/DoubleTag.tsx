import Flex from './Flex';
import TextHighlighter from './TextHighlighter';
import { Tag } from 'antd';
import _ from 'lodash';
import React from 'react';

export type DoubleTagObjectValue = {
  label: string;
  color?: string;
};

const DoubleTag: React.FC<{
  values?: Array<string> | Array<DoubleTagObjectValue>;
  highlightKeyword?: string;
}> = ({ values = [], highlightKeyword }) => {
  if (values.length === 0) return null;
  let objectValues: Array<DoubleTagObjectValue>;
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
      {_.map(objectValues, (objValue, idx) =>
        !_.isEmpty(objValue.label) ? (
          <Tag
            key={idx}
            style={
              _.last(objectValues) === objValue
                ? undefined
                : { margin: 0, marginRight: -1 }
            }
            color={objValue.color}
          >
            {!_.isUndefined(highlightKeyword) ? (
              <TextHighlighter keyword={highlightKeyword}>
                {objValue.label}
              </TextHighlighter>
            ) : (
              objValue.label
            )}
          </Tag>
        ) : null,
      )}
    </Flex>
  );
};

export default DoubleTag;
