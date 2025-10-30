import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

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
  to?: LinkProps['to'];
  ellipsis?: boolean | { tooltip?: string };
  children?: string | React.ReactNode;
}
const BAILink: React.FC<BAILinkProps> = ({
  type,
  to,
  ellipsis,
  children,
  ...linkProps
}) => {
  const { styles } = useStyles();
  return type !== 'disabled' && to ? (
    <Link className={type ? styles?.[type] : undefined} to={to} {...linkProps}>
      {children}
    </Link>
  ) : (
    <Typography.Link
      className={type ? styles?.[type] : undefined}
      onClick={linkProps.onClick}
      disabled={type === 'disabled'}
      ellipsis={!!ellipsis}
      {...linkProps}
    >
      {typeof ellipsis === 'object' && ellipsis.tooltip ? (
        <Typography.Text
          className={type ? styles?.[type] : undefined}
          ellipsis={ellipsis}
        >
          {children}
        </Typography.Text>
      ) : (
        children
      )}
    </Typography.Link>
  );
};

export default BAILink;
