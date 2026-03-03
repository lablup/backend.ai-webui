/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import React, { useState } from 'react';

interface ImageWithFallbackProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'onError'
> {
  src: string;
  fallbackIcon: React.ReactNode;
  alt: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackIcon: fallback,
  alt,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return <>{fallback}</>;
  }

  return <img {...props} src={src} alt={alt} onError={handleError} />;
};

export default ImageWithFallback;
