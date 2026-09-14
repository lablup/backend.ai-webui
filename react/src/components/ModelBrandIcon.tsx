/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { findBrandIconLoader } from '../helper/modelBrandIcons';
import type { BrandIconType } from './brandIcons/createBrandIcon';
import { useTheme } from '@astryxdesign/core/theme';
import { Bot } from 'lucide-react';
import React, { Suspense, use } from 'react';

export interface ModelBrandIconProps {
  modelName: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

const iconCache = new Map<Function | string, Promise<BrandIconType | null>>();

function getIconPromise(modelName: string): Promise<BrandIconType | null> {
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

const DefaultIcon: React.FC<{
  size: number;
  style?: React.CSSProperties;
  className?: string;
}> = ({ size, style, className }) => {
  'use memo';
  const { token } = useTheme();
  return (
    <Bot
      className={className}
      style={{
        fontSize: size,
        color: token('--color-text-secondary'),
        flexShrink: 0,
        ...style,
      }}
      size="1em"
    />
  );
};

/**
 * Inner component that renders the resolved icon SVG.
 * Separated to avoid "component created during render" lint error.
 */
const ResolvedIcon: React.FC<{
  icon: BrandIconType;
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
 * Inner component that uses `use()` to resolve the icon.
 * Separated so that Suspense is contained within ModelBrandIcon
 * and does not propagate to the parent tree.
 */
const SuspendingIcon: React.FC<{
  modelName: string;
  size: number;
  style?: React.CSSProperties;
  className?: string;
}> = ({ modelName, size, style, className }) => {
  'use memo';
  const resolvedIcon = use(getIconPromise(modelName));

  if (!resolvedIcon) {
    return <DefaultIcon size={size} style={style} className={className} />;
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

/**
 * Displays a brand SVG icon for a known model via `brandIcons/generated`,
 * or a generic robot icon as fallback.
 * Uses internal Suspense boundary so loading never propagates to parent.
 */
const ModelBrandIcon: React.FC<ModelBrandIconProps> = ({
  modelName,
  size = 14,
  style,
  className,
}) => {
  'use memo';
  return (
    <Suspense
      fallback={<DefaultIcon size={size} style={style} className={className} />}
    >
      <SuspendingIcon
        modelName={modelName}
        size={size}
        style={style}
        className={className}
      />
    </Suspense>
  );
};

export default ModelBrandIcon;
