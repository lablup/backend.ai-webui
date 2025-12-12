import { Tag } from 'antd';
import React from 'react';

const BooleanTagWithFallBack: React.FC<{
  value: boolean | null | undefined;
  fallback?: React.ReactNode;
}> = ({ value, fallback = '-' }) => {
  if (typeof value !== 'boolean') {
    return fallback;
  }
  return value ? (
    <Tag color="warning">true</Tag>
  ) : (
    <Tag
      style={{
        opacity: 0.5,
      }}
    >
      false
    </Tag>
  );
};

export default BooleanTagWithFallBack;
