import { default as logo } from './mxnet.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageMxnetIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `mxnet.svg` (see `image_metadata.json`). */
const BAIImageMxnetIcon: React.FC<BAIImageMxnetIconProps> = ({
  'aria-label': ariaLabel = 'mxnet',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageMxnetIcon;
