import { default as logo } from './r-lang.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageRLangIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `r-lang.svg` (see `image_metadata.json`). */
const BAIImageRLangIcon: React.FC<BAIImageRLangIconProps> = ({
  'aria-label': ariaLabel = 'r-lang',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageRLangIcon;
