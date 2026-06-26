import { default as logo } from './swift.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageSwiftIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `swift.svg` (see `image_metadata.json`). */
const BAIImageSwiftIcon: React.FC<BAIImageSwiftIconProps> = ({
  'aria-label': ariaLabel = 'swift',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageSwiftIcon;
