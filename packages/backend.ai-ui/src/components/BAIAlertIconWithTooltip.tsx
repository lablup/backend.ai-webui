import { theme, Tooltip, type TooltipProps } from 'antd';
import { CircleAlertIcon } from 'lucide-react';
import React from 'react';

interface BAIAlertIconWithTooltipProps extends Omit<TooltipProps, 'children'> {
  iconProps?: React.ComponentProps<typeof CircleAlertIcon>;
  type?: 'warning' | 'error';
}
const BAIAlertIconWithTooltip = ({
  iconProps,
  type,
  ...tooltipProps
}: BAIAlertIconWithTooltipProps) => {
  const { token } = theme.useToken();
  return (
    <Tooltip {...tooltipProps}>
      <CircleAlertIcon
        style={{
          color:
            type === 'warning'
              ? token.colorWarning
              : type === 'error'
                ? token.colorError
                : undefined,
          cursor: 'help',
        }}
        {...iconProps}
      />
    </Tooltip>
  );
};

export default BAIAlertIconWithTooltip;
