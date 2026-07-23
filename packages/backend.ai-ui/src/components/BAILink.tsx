import BAIText from './BAIText';
import { theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

const useStyles = createStyles(({ css, token }) => ({
  hover: css`
    text-decoration: none;
    color: ${token.colorLink};

    &:hover {
      color: ${token.colorLinkHover};
      text-decoration: underline;
    }
  `,
  disabled: css`
    color: ${token.colorTextDisabled};
    cursor: not-allowed;
    pointer-events: none;
  `,
}));

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
  const { styles } = useStyles();
  const { token } = theme.useToken();
  if (type !== 'disabled' && to) {
    return (
      <Link
        className={type ? styles?.[type] : undefined}
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
      className={type ? styles?.[type] : undefined}
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
