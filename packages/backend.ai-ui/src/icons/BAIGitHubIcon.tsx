// Own-SVG replacement for `GithubOutlined` (to-astryx ticket 07).
// lucide-react 1.x removed brand icons, so the antd glyph geometry
// (@ant-design/icons-svg, MIT) is carried here as a plain asset.
import { default as logo } from './GitHub.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIGitHubIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIGitHubIcon: React.FC<BAIGitHubIconProps> = ({
  'aria-label': ariaLabel = 'GitHub',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIGitHubIcon;
