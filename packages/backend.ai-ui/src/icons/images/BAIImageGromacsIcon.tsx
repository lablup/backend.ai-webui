import { default as logo } from './gromacs.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageGromacsIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `gromacs.svg` (see `image_metadata.json`). */
const BAIImageGromacsIcon: React.FC<BAIImageGromacsIconProps> = ({
  'aria-label': ariaLabel = 'gromacs',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageGromacsIcon;
