import { Switch, SwitchProps, Typography } from 'antd';
import { BAIFlex, useInterval } from 'backend.ai-ui';
import React from 'react';

const { Text } = Typography;

interface Props extends SwitchProps {
  children?: React.ReactNode;
  onRefresh: () => void;
  interval: number | null;
}

const AutoRefreshSwitch: React.FC<Props> = ({
  children,
  interval,
  onRefresh,
  ...switchProps
}) => {
  useInterval(
    () => {
      onRefresh();
    },
    switchProps.checked ? interval : null,
  );

  return (
    <BAIFlex direction="row" gap={'xs'}>
      <Switch size="small" {...switchProps} />
      <Text>{children}</Text>
    </BAIFlex>
  );
};

export default AutoRefreshSwitch;
