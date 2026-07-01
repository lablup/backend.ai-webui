import { default as src } from './gcc.png';
import React from 'react';

interface BAIImageGccIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `gcc.png` (see `image_metadata.json`). */
const BAIImageGccIcon: React.FC<BAIImageGccIconProps> = ({
  alt = 'gcc',
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

export default BAIImageGccIcon;
