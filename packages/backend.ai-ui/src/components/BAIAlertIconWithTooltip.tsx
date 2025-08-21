import { theme, Tooltip } from 'antd';
import { TooltipPropsWithTitle } from 'antd/es/tooltip';
import { CircleAlertIcon } from 'lucide-react';
import React from 'react';

interface BAIAlertIconWithTooltipProps
  extends Omit<TooltipPropsWithTitle, 'children'> {
  iconProps?: React.ComponentProps<typeof CircleAlertIcon>;
  type?: 'warning' | 'error';
}
const BAIAlertIconWithTooltip = ({
  iconProps,
  type = 'error',
  ...tooltipProps
}: BAIAlertIconWithTooltipProps) => {
  const { token } = theme.useToken();
  return (
    <Tooltip {...tooltipProps}>
      <CircleAlertIcon
        style={{
          color: type === 'warning' ? token.colorWarning : token.colorError,
          cursor: 'help',
        }}
        {...iconProps}
      />
    </Tooltip>
  );
};

export default BAIAlertIconWithTooltip;
