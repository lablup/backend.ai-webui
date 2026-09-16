/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBackendAIImageMetaData } from '../hooks';
import { CodeXml } from 'lucide-react';
import React from 'react';

const ImageMetaIcon: React.FC<{
  image: string | null;
  style?: React.CSSProperties;
  alt?: string;
}> = ({ image, style = {}, alt = '' }) => {
  'use memo';
  const [, { getImageIcon, hasImageIcon }] = useBackendAIImageMetaData();
  const iconStyle: React.CSSProperties = {
    width: '1em',
    height: '1em',
    verticalAlign: 'middle',
    ...style,
  };

  // The raster fallback is fixed dark ink, so images without a vendor icon get a
  // themed glyph instead (FR-3587).
  return hasImageIcon(image) ? (
    <img src={getImageIcon(image)} style={iconStyle} alt={alt} />
  ) : (
    <CodeXml
      style={{ color: 'var(--color-text-primary)', ...iconStyle }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    />
  );
};

export default React.memo(ImageMetaIcon);
