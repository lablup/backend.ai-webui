import { useIntervalValue } from '../hooks/useIntervalValue';
import React from 'react';

const BAIIntervalText: React.FC<{
  callback: () => any;
  delay: number;
}> = ({ callback, delay }) => {
  const value = useIntervalValue(callback, delay);
  return value;
};

export default BAIIntervalText;
