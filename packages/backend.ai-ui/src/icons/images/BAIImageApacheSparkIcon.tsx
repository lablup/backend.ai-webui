import { default as logo } from './apache-spark.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface BAIImageApacheSparkIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

/** Bundled framework icon for `apache-spark.svg` (see `image_metadata.json`). */
const BAIImageApacheSparkIcon: React.FC<BAIImageApacheSparkIconProps> = ({
  'aria-label': ariaLabel = 'apache-spark',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIImageApacheSparkIcon;
