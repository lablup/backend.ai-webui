import Flex, { FlexProps } from "./Flex";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import React from "react";

const FlexActivityIndicator: React.FC<FlexProps> = ({ style, children }) => {
  return (
    <Flex
      direction="row"
      justify="center"
      align="center"
      style={{ width: "100%", height: "100%", ...style }}
    >
      <Spin indicator={<LoadingOutlined spin />} />
      {children}
    </Flex>
  );
};

export default FlexActivityIndicator;
