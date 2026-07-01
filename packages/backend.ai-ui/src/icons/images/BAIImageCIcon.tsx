import { default as logo } from './c.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageCIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `c.svg` (see `image_metadata.json`). */
const BAIImageCIcon: React.FC<BAIImageCIconProps> = ({
  'aria-label': ariaLabel = 'c',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageCIcon;
