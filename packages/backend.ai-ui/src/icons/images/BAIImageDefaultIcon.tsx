import { default as src } from './default.png';
import React from 'react';

interface BAIImageDefaultIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `default.png` (see `image_metadata.json`). */
const BAIImageDefaultIcon: React.FC<BAIImageDefaultIconProps> = ({
  alt = 'default',
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

export default BAIImageDefaultIcon;
