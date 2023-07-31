import React, { PropsWithChildren } from "react";
import { Typography } from "antd";

interface Props extends PropsWithChildren {
  text?: string;
}

const CopyableCodeText: React.FC<Props> = ({ text, children }) => {
  return (
    <Typography.Text copyable code>
      {text || children}
    </Typography.Text>
  );
};

export default CopyableCodeText;
