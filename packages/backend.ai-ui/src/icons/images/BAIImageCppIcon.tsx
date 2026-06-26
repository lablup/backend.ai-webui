import { default as logo } from './cpp.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageCppIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `cpp.svg` (see `image_metadata.json`). */
const BAIImageCppIcon: React.FC<BAIImageCppIconProps> = ({
  'aria-label': ariaLabel = 'cpp',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageCppIcon;
