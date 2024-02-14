import { useEventNotStable } from '../hooks/useEventNotStable';
import { useIntervalValue } from '../hooks/useIntervalValue';
import React from 'react';

const BAIIntervalText: React.FC<{
  callback: (props: any) => any;
  delay: number;
}> = ({ callback, delay }) => {
  const handler = useEventNotStable(callback);
  const value = useIntervalValue(handler, delay);
  return value;
};

export default BAIIntervalText;
