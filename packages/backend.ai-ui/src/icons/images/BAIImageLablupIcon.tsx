import { default as src } from './lablup.png';
import React from 'react';

interface BAIImageLablupIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `lablup.png` (see `image_metadata.json`). */
const BAIImageLablupIcon: React.FC<BAIImageLablupIconProps> = ({
  alt = 'lablup',
  style,
  ...props
}) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '1em', height: '1em', verticalAlign: 'middle', ...style }}
      {...props}
    />
  );
};

export default BAIImageLablupIcon;
