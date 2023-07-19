import React from "react";
import { Typography } from "antd";
import { CheckOutlined, CopyOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;

interface Props {
  text: string;
}

const CopyableText: React.FC<Props> = ({ text = "" }) => {
  return (
    <Paragraph
      copyable={{
        icon: [
          <CopyOutlined style={{ color: "green" }} />,
          <CheckOutlined style={{ color: "green" }} />,
        ],
      }}
    >
      {text}
    </Paragraph>
  );
};

export default CopyableText;
