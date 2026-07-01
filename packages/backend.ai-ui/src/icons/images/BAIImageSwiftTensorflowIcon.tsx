import { default as src } from './swift-tensorflow.png';
import React from 'react';

interface BAIImageSwiftTensorflowIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `swift-tensorflow.png` (see `image_metadata.json`). */
const BAIImageSwiftTensorflowIcon: React.FC<
  BAIImageSwiftTensorflowIconProps
> = ({ alt = 'swift-tensorflow', style, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '1em', height: '1em', verticalAlign: 'middle', ...style }}
      {...props}
    />
  );
};

export default BAIImageSwiftTensorflowIcon;
