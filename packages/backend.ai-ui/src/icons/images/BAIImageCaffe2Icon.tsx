import { default as logo } from './caffe2.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageCaffe2IconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `caffe2.svg` (see `image_metadata.json`). */
const BAIImageCaffe2Icon: React.FC<BAIImageCaffe2IconProps> = ({
  'aria-label': ariaLabel = 'caffe2',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageCaffe2Icon;
