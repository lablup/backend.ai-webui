import { default as src } from './caffe.png';
import React from 'react';

interface BAIImageCaffeIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `caffe.png` (see `image_metadata.json`). */
const BAIImageCaffeIcon: React.FC<BAIImageCaffeIconProps> = ({
  alt = 'caffe',
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

export default BAIImageCaffeIcon;
