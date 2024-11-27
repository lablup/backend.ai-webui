import { useIntervalValue } from '../hooks/useIntervalValue';
import _ from 'lodash';
import React from 'react';

type RenderProp<T> = (data: T) => React.ReactNode;
const BAIIntervalView = <T,>({
  callback,
  render,
  delay,
  triggerKey,
}: {
  callback: () => T;
  render?: RenderProp<T>;
  delay: number;
  triggerKey?: string;
}) => {
  const value = useIntervalValue(callback, delay, triggerKey);
  return _.isUndefined(render) ? value : render(value);
};

export default BAIIntervalView;
