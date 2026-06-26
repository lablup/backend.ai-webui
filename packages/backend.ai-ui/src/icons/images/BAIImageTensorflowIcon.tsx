import { default as src } from './tensorflow.png';
import React from 'react';

interface BAIImageTensorflowIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `tensorflow.png` (see `image_metadata.json`). */
const BAIImageTensorflowIcon: React.FC<BAIImageTensorflowIconProps> = ({
  alt = 'tensorflow',
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

export default BAIImageTensorflowIcon;
