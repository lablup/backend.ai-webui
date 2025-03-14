import { QuestionCircleOutlined } from '@ant-design/icons';
import { theme, Tooltip } from 'antd';
import { TooltipPropsWithTitle } from 'antd/es/tooltip';
import React from 'react';

interface QuestionIconWithTooltipProps
  extends Omit<TooltipPropsWithTitle, 'children'> {
  iconProps?: React.ComponentProps<typeof QuestionCircleOutlined>;
}
const QuestionIconWithTooltip = ({
  iconProps,
  ...tooltipProps
}: QuestionIconWithTooltipProps) => {
  const { token } = theme.useToken();
  return (
    <Tooltip {...tooltipProps}>
      <QuestionCircleOutlined
        style={{
          color: token.colorTextTertiary,
          cursor: 'help',
        }}
        {...iconProps}
      />
    </Tooltip>
  );
};

export default QuestionIconWithTooltip;
