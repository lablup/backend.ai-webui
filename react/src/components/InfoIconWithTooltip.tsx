import { InfoCircleOutlined } from '@ant-design/icons';
import { theme, Tooltip } from 'antd';
import { TooltipPropsWithTitle } from 'antd/es/tooltip';
import React from 'react';

interface InfoIconWithTooltipProps
  extends Omit<TooltipPropsWithTitle, 'children'> {
  iconProps?: React.ComponentProps<typeof InfoCircleOutlined>;
}
const InfoIconWithTooltip = ({
  iconProps,
  ...tooltipProps
}: InfoIconWithTooltipProps) => {
  const { token } = theme.useToken();
  return (
    <Tooltip {...tooltipProps}>
      <InfoCircleOutlined
        style={{
          color: token.colorTextTertiary,
        }}
        {...iconProps}
      />
    </Tooltip>
  );
};

export default InfoIconWithTooltip;
