import { default as src } from './h2o.png';
import React from 'react';

interface BAIImageH2oIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `h2o.png` (see `image_metadata.json`). */
const BAIImageH2oIcon: React.FC<BAIImageH2oIconProps> = ({
  alt = 'h2o',
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

export default BAIImageH2oIcon;
