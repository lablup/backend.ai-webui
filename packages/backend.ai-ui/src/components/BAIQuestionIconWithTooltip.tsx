import { theme } from '../theme-shim';
import { Tooltip, type TooltipProps } from 'antd';
import { CircleHelp } from 'lucide-react';
import React from 'react';

interface BAIQuestionIconWithTooltipProps extends Omit<
  TooltipProps,
  'children'
> {
  iconProps?: React.ComponentProps<typeof CircleHelp>;
}
const BAIQuestionIconWithTooltip = ({
  iconProps,
  ...tooltipProps
}: BAIQuestionIconWithTooltipProps) => {
  const { token } = theme.useToken();
  return (
    <Tooltip {...tooltipProps}>
      <CircleHelp
        style={{
          color: token.colorTextTertiary,
          cursor: 'help',
        }}
        {...iconProps}
        size="1em"
      />
    </Tooltip>
  );
};

export default BAIQuestionIconWithTooltip;
