/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import React, { useState } from 'react';

export interface BAIImageWithFallbackProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'onError'
> {
  src: string;
  fallbackIcon: React.ReactNode;
  alt: string;
}

const BAIImageWithFallback: React.FC<BAIImageWithFallbackProps> = ({
  src,
  fallbackIcon,
  alt,
  ...props
}) => {
  'use memo';
  const [errorSrc, setErrorSrc] = useState<string | null>(null);
  const hasError = errorSrc === src;

  if (hasError) {
    return <>{fallbackIcon}</>;
  }

  return (
    <img {...props} src={src} alt={alt} onError={() => setErrorSrc(src)} />
  );
};

export default BAIImageWithFallback;
