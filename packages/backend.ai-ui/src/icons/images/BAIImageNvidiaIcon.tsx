import { default as logo } from './nvidia.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageNvidiaIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `nvidia.svg` (see `image_metadata.json`). */
const BAIImageNvidiaIcon: React.FC<BAIImageNvidiaIconProps> = ({
  'aria-label': ariaLabel = 'nvidia',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageNvidiaIcon;
