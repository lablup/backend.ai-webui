import { Tag } from 'antd';
import React from 'react';

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
