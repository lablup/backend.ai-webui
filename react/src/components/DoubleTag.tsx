import { Tag } from "antd";
import Flex from "./Flex";
import _ from "lodash";
import React from "react";

type ObjectValue = {
  label: ValueType;
  color?: string;
};

type ValueType = string | React.ReactNode;
const DoubleTag: React.FC<{
  values?: ValueType[] | ObjectValue[];
}> = ({ values = [] }) => {
  if (values.length === 0) return null;
  let objectValues: ObjectValue[];
  if (
    values[0] &&
    (typeof values[0] === "string" || React.isValidElement(values[0]))
  ) {
    objectValues = values.map(
      (value) =>
        ({
          label: value,
          color: "blue",
        } as ObjectValue)
    );
  } else {
    objectValues = values as ObjectValue[];
  }

  console.log(values, objectValues);

  return (
    <Flex direction="row">
      {_.map(objectValues, (objValue, idx) => {
        return (
          <Tag
            key={idx}
            style={
              _.last(objectValues) === objValue
                ? undefined
                : { margin: 0, marginRight: -1, zIndex: 1 }
            }
          >
            {objValue.label}
          </Tag>
        );
      })}
    </Flex>
  );
};

export default DoubleTag;
