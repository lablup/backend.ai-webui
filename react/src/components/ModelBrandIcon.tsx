/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { findBrandIconLoader } from '../helper/modelBrandIcons';
import { RobotOutlined } from '@ant-design/icons';
import type { IconType } from '@lobehub/icons/es/types';
import { theme } from 'antd';
import React, { use } from 'react';

export interface ModelBrandIconProps {
  modelName: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

const iconCache = new Map<Function | string, Promise<IconType | null>>();

function getIconPromise(modelName: string): Promise<IconType | null> {
  const loader = findBrandIconLoader(modelName);
  const cacheKey = loader ?? modelName.toLowerCase();

  const cached = iconCache.get(cacheKey);
  if (cached) return cached;

  const promise = loader
    ? loader()
        .then((mod) => mod.default)
        .catch(() => null)
    : Promise.resolve(null);
  iconCache.set(cacheKey, promise);
  return promise;
}

/**
 * Inner component that renders the resolved icon SVG.
 * Separated to avoid "component created during render" lint error.
 */
const ResolvedIcon: React.FC<{
  icon: IconType;
  size: number;
  style?: React.CSSProperties;
  className?: string;
}> = ({ icon: Icon, size, style, className }) => {
  'use memo';
  return (
    <Icon
      className={className}
      size={size}
      style={{ flexShrink: 0, ...style }}
    />
  );
};

/**
 * Displays a brand SVG icon for a known model via @lobehub/icons,
 * or a generic robot icon as fallback.
 */
const ModelBrandIcon: React.FC<ModelBrandIconProps> = ({
  modelName,
  size = 14,
  style,
  className,
}) => {
  'use memo';

  const { token } = theme.useToken();
  const resolvedIcon = use(getIconPromise(modelName));

  if (!resolvedIcon) {
    return (
      <RobotOutlined
        className={className}
        style={{
          fontSize: size,
          color: token.colorTextSecondary,
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  return (
    <ResolvedIcon
      icon={resolvedIcon}
      size={size}
      style={style}
      className={className}
    />
  );
};

export default ModelBrandIcon;
