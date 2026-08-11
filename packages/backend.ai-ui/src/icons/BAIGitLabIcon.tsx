// Own-SVG replacement for `GitlabOutlined` (to-astryx ticket 07).
// lucide-react 1.x removed brand icons, so the antd glyph geometry
// (@ant-design/icons-svg, MIT) is carried here as a plain asset.
import { default as logo } from './GitLab.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIGitLabIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIGitLabIcon: React.FC<BAIGitLabIconProps> = ({
  'aria-label': ariaLabel = 'GitLab',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIGitLabIcon;
