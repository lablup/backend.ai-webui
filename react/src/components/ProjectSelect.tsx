import { Select } from "antd";
import React from "react";
import { useWebComponentInfo } from "./DefaultProviders";

const ProjectSelect: React.FC = () => {
  const {
    props: { value, dispatchEvent },
  } = useWebComponentInfo();

  // const data = JSON.parse(value || "");

  return (
    <Select
      value={"a"}
      onChange={(value) => dispatchEvent && dispatchEvent("change", value)}
    >
      <Select.Option key={"a"}>
        <div>optionA</div>
      </Select.Option>
      <Select.Option key={"b"}>
        <div>optionB</div>
      </Select.Option>
    </Select>
  );
};

export default ProjectSelect;
