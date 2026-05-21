import { default as logo } from './sglang.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageSglangIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `sglang.svg` (see `image_metadata.json`). */
const BAIImageSglangIcon: React.FC<BAIImageSglangIconProps> = ({
  'aria-label': ariaLabel = 'sglang',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageSglangIcon;
