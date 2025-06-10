import { Image, ImageProps } from 'antd';
import React, { useEffect } from 'react';

interface ModelCardThumbnailProps extends ImageProps {
  src: string;
  fallbackSrc?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

const ModelCardThumbnail: React.FC<ModelCardThumbnailProps> = ({
  src,
  fallbackSrc,
  alt,
  width,
  height,
  className,
  style,
}) => {
  const [imageSrc, setImageSrc] = React.useState('');
  useEffect(() => {
    setImageSrc(src);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };
  return (
    <Image
      preview={false}
      src={imageSrc}
      onError={handleError}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
};

export default ModelCardThumbnail;
