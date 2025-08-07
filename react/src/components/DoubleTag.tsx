import TextHighlighter from './TextHighlighter';
import { Tag } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';

export type DoubleTagObjectValue = {
  label: string;
  color?: string;
  style?: React.CSSProperties; // style 속성 추가
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
    <BAIFlex direction="row">
      {_.map(objectValues, (objValue, idx) =>
        !_.isEmpty(objValue.label) ? (
          <Tag
            key={idx}
            style={{
              ...(_.last(objectValues) === objValue
                ? {}
                : { margin: 0, marginRight: -1 }),
              ...objValue.style,
            }}
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
    </BAIFlex>
  );
};

export default DoubleTag;
