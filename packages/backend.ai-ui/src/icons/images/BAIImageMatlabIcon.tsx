import { default as src } from './matlab.png';
import React from 'react';

interface BAIImageMatlabIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `matlab.png` (see `image_metadata.json`). */
const BAIImageMatlabIcon: React.FC<BAIImageMatlabIconProps> = ({
  alt = 'matlab',
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

export default BAIImageMatlabIcon;
