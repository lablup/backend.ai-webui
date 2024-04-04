import { useIntervalValue } from '../hooks/useIntervalValue';
import React from 'react';

const BAIIntervalText: React.FC<{
  callback: () => any;
  delay: number;
  triggerKey?: string;
}> = ({ callback, delay, triggerKey }) => {
  const value = useIntervalValue(callback, delay, triggerKey);
  return value;
};

export default BAIIntervalText;
