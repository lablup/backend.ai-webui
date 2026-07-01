import { default as logo } from './vllm.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageVllmIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `vllm.svg` (see `image_metadata.json`). */
const BAIImageVllmIcon: React.FC<BAIImageVllmIconProps> = ({
  'aria-label': ariaLabel = 'vllm',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageVllmIcon;
