import { SemanticColor, useSemanticColorMap } from '../helper';
import { Badge, BadgeProps, theme } from 'antd';
import React from 'react';

/**
 * Props interface for BAIBadge component.
 * Extends Ant Design Badge props with semantic color support.
 */
export interface BAIBadgeProps extends Omit<
  BadgeProps,
  'color' | 'status' | 'styles'
> {
  /**
   * Semantic color of the badge dot.
   * Pass `undefined` when the status is unknown or indeterminate to render
   * an outline-only (border) dot instead of a filled dot.
   */
  color?: SemanticColor;
  /** When true, shows a processing (ripple) animation on the badge dot. */
  processing?: boolean;
}

/**
 * BAIBadge - Semantic color-coded status dot badge.
 *
 * Wraps Ant Design Badge to provide a consistent semantic color system
 * (`success`, `info`, `warning`, `error`, `default`). When `color` is
 * omitted, renders a transparent dot with a border to indicate an
 * unknown or indeterminate status.
 */
const BAIBadge: React.FC<BAIBadgeProps> = ({
  color,
  processing,
  ...badgeProps
}) => {
  'use memo';
  const { token } = theme.useToken();
  const semanticColorMap = useSemanticColorMap();

  return (
    <Badge
      {...badgeProps}
      status={processing ? 'processing' : 'default'}
      color={color ? semanticColorMap[color] : undefined}
      styles={
        color
          ? undefined
          : {
              indicator: {
                border: '1px solid',
                borderColor: token.colorTextDisabled,
                backgroundColor: 'transparent',
              },
            }
      }
    />
  );
};

export default BAIBadge;
