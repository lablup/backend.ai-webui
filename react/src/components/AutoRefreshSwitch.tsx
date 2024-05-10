import Flex from './Flex';
import { useRafInterval } from 'ahooks';
import { Space, Switch, Typography } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

interface Props {
  children?: React.ReactNode;
  onRefresh: () => void;
  interval: number;
}
const AutoRefreshSwitch: React.FC<Props> = ({
  children,
  interval,
  onRefresh,
}) => {
  const [on, setOn] = useState(true);

  useRafInterval(
    () => {
      onRefresh();
    },
    on ? interval : undefined,
  );
  return (
    <Flex direction="row" gap={'xs'}>
      <Switch size="small" checked={on} onChange={setOn} />
      <Text>{children}</Text>
    </Flex>
  );
};

export default AutoRefreshSwitch;
