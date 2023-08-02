import { Tag } from "antd";
import Flex from "./Flex";
import _ from "lodash";

type ObjectValue = {
  label: string;
  color?: string;
};
const DoubleTag: React.FC<{
  values?: string[] | ObjectValue[];
}> = ({ values = [] }) => {
  if (values.length === 0) return null;
  let objectValues: ObjectValue[];
  if (_.isString(values[0])) {
    objectValues = values.map((value) => ({
      label: value as string,
      color: "blue",
    }));
  } else {
    objectValues = values as ObjectValue[];
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
