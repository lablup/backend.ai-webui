import { default as logo } from './rebel.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageRebelIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `rebel.svg` (see `image_metadata.json`). */
const BAIImageRebelIcon: React.FC<BAIImageRebelIconProps> = ({
  'aria-label': ariaLabel = 'rebel',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageRebelIcon;
