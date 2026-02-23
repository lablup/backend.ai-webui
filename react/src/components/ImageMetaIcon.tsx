/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBackendAIImageMetaData } from '../hooks';
import React from 'react';

const ImageMetaIcon: React.FC<{
  image: string | null;
  style?: React.CSSProperties;
  alt?: string;
}> = ({ image, style = {}, alt = '' }) => {
  const [, { getImageIcon }] = useBackendAIImageMetaData();
  return (
    <img
      src={getImageIcon(image)}
      style={{
        width: '1em',
        height: '1em',
        verticalAlign: 'middle',
        ...style,
      }}
      alt={alt}
    />
  );
};

export default React.memo(ImageMetaIcon);
