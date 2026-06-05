import { QuestionCircleOutlined } from '@ant-design/icons';
import { theme, Tooltip, type TooltipProps } from 'antd';
import React from 'react';

interface BAIQuestionIconWithTooltipProps extends Omit<
  TooltipProps,
  'children'
> {
  iconProps?: React.ComponentProps<typeof QuestionCircleOutlined>;
}
const BAIQuestionIconWithTooltip = ({
  iconProps,
  ...tooltipProps
}: BAIQuestionIconWithTooltipProps) => {
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

export default BAIQuestionIconWithTooltip;
