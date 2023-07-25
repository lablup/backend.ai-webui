import React from "react";
import { Typography } from "antd";

interface Props {
  text: string;
}

const CopyableCodeText: React.FC<Props> = ({ text = "" }) => {
  return (
    <Typography.Text copyable code>
      {text}
    </Typography.Text>
  );
};

export default CopyableCodeText;
