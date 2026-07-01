import { default as logo } from './anaconda.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageAnacondaIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `anaconda.svg` (see `image_metadata.json`). */
const BAIImageAnacondaIcon: React.FC<BAIImageAnacondaIconProps> = ({
  'aria-label': ariaLabel = 'anaconda',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageAnacondaIcon;
