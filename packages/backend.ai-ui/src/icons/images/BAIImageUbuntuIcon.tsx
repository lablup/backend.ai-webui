import { default as logo } from './ubuntu.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageUbuntuIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `ubuntu.svg` (see `image_metadata.json`). */
const BAIImageUbuntuIcon: React.FC<BAIImageUbuntuIconProps> = ({
  'aria-label': ariaLabel = 'ubuntu',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageUbuntuIcon;
