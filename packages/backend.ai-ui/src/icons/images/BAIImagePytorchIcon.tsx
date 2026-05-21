import { default as logo } from './pytorch.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImagePytorchIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `pytorch.svg` (see `image_metadata.json`). */
const BAIImagePytorchIcon: React.FC<BAIImagePytorchIconProps> = ({
  'aria-label': ariaLabel = 'pytorch',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImagePytorchIcon;
