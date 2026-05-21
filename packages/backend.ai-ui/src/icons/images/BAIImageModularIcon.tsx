import { default as logo } from './modular.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageModularIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `modular.svg` (see `image_metadata.json`). */
const BAIImageModularIcon: React.FC<BAIImageModularIconProps> = ({
  'aria-label': ariaLabel = 'modular',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageModularIcon;
