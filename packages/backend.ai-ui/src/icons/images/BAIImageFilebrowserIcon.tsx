import { default as logo } from './filebrowser.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageFilebrowserIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `filebrowser.svg` (see `image_metadata.json`). */
const BAIImageFilebrowserIcon: React.FC<BAIImageFilebrowserIconProps> = ({
  'aria-label': ariaLabel = 'filebrowser',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageFilebrowserIcon;
