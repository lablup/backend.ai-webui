import { Tag } from 'antd';
import React from 'react';

/**
 * Renders a colored tag representing a boolean value with customizable labels and fallback content.
 *
 * @param value - The boolean value to display; non-boolean values render the fallback.
 * @param trueLabel - Optional label shown when the value is true, defaults to `True`.
 * @param falseLabel - Optional label shown when the value is false, defaults to `False`.
 * @param fallback - Optional node rendered when the value is not a boolean, defaults to `-`.
 * @returns A green tag for true, a semi-transparent default tag for false, or the fallback node otherwise.
 */
const BooleanTag: React.FC<{
  value: boolean | null | undefined;
  trueLabel?: string;
  falseLabel?: string;
  fallback?: React.ReactNode;
}> = ({ value, fallback = '-', trueLabel = 'True', falseLabel = 'False' }) => {
  if (typeof value !== 'boolean') {
    return fallback;
  }
  return value ? (
    <Tag color="green">{trueLabel}</Tag>
  ) : (
    <Tag
      style={{
        opacity: 0.5,
      }}
    >
      {falseLabel}
    </Tag>
  );
};

export default BooleanTag;
