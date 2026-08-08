import { theme } from '../theme-shim';
import './BAILink.css';
import BAIText from './BAIText';
import { Typography } from 'antd';
import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

const LINK_TYPE_CLASS = {
  hover: 'bai-link-hover',
  disabled: 'bai-link-disabled',
} as const;

export interface BAILinkProps extends Omit<LinkProps, 'to'> {
  type?: 'hover' | 'disabled' | undefined;
  icon?: React.ReactNode;
  to?: LinkProps['to'];
  ellipsis?: boolean | { tooltip?: string };
  children?: string | React.ReactNode;
}
const BAILink: React.FC<BAILinkProps> = ({
  type,
  icon,
  to,
  ellipsis,
  children,
  ...linkProps
}) => {
  const { token } = theme.useToken();
  if (type !== 'disabled' && to) {
    return (
      <Link
        className={type ? LINK_TYPE_CLASS[type] : undefined}
        to={to}
        {...linkProps}
        style={{ fontFamily: token.fontFamily, ...linkProps.style }}
      >
        {children}
        {icon}
      </Link>
    );
  }

  const link = (
    <Typography.Link
      className={type ? LINK_TYPE_CLASS[type] : undefined}
      onClick={linkProps.onClick}
      disabled={type === 'disabled'}
      {...linkProps}
    >
      {children}
      {icon}
    </Typography.Link>
  );

  if (ellipsis) {
    return (
      <BAIText ellipsis={ellipsis === true ? { tooltip: true } : ellipsis}>
        {link}
      </BAIText>
    );
  }

  return link;
};

export default BAILink;
