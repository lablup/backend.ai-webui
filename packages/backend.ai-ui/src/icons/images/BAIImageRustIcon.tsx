import { default as logo } from './rust.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageRustIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `rust.svg` (see `image_metadata.json`). */
const BAIImageRustIcon: React.FC<BAIImageRustIconProps> = ({
  'aria-label': ariaLabel = 'rust',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageRustIcon;
