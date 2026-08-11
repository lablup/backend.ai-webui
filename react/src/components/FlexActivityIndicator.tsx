/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Spinner } from '@astryxdesign/core/Spinner';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
import React from 'react';

/**
 * PILOT-DECISION: antd `Spin` (MAPPING §3.14, bare-indicator branch) →
 * Astryx `Spinner`. The custom `indicator={<LoaderCircle/>}` node has no
 * destination (`indicator` ×3 → NONE) — Astryx draws its own spinner, so the
 * lucide glyph is dropped. `size` keeps the antd-shaped `small|default|large`
 * prop surface (this is a 40-consumer shared component — frontier rule) and
 * is translated to Astryx `sm|md|lg` internally.
 */
type FlexActivitySpinSize = 'small' | 'default' | 'large';

const SPINNER_SIZE: Record<FlexActivitySpinSize, 'sm' | 'md' | 'lg'> = {
  small: 'sm',
  default: 'md',
  large: 'lg',
};

interface FlexActivityIndicatorProps extends BAIFlexProps {
  spinSize?: FlexActivitySpinSize;
}

const FlexActivityIndicator: React.FC<FlexActivityIndicatorProps> = ({
  style,
  children,
  spinSize = 'default',
}) => {
  return (
    <BAIFlex
      direction="row"
      justify="center"
      align="center"
      style={{ width: '100%', height: '100%', ...style }}
    >
      <Spinner size={SPINNER_SIZE[spinSize]} />
      {children}
    </BAIFlex>
  );
};

export default FlexActivityIndicator;
