import { default as logo } from './orbit.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageOrbitIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `orbit.svg` (see `image_metadata.json`). */
const BAIImageOrbitIcon: React.FC<BAIImageOrbitIconProps> = ({
  'aria-label': ariaLabel = 'orbit',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageOrbitIcon;
