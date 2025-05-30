import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { isUndefined } from 'lodash';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

const useStyles = createStyles(({ css, token }) => ({
  hover: css`
    text-decoration: none;
    /* color: ${token.colorLink}; */

    &:hover {
      /* color: ${token.colorLinkHover}; */
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
}
const BAILink: React.FC<BAILinkProps> = ({ type, to, ...linkProps }) => {
  const { styles } = useStyles();
  return type !== 'disabled' && to ? (
    <Link
      className={isUndefined(type) ? undefined : styles?.[type] || undefined}
      to={to}
      {...linkProps}
    />
  ) : (
    <Typography.Link
      className={isUndefined(type) ? undefined : styles?.[type] || undefined}
      onClick={linkProps.onClick}
      disabled={type === 'disabled'}
      {...linkProps}
    />
  );
};

export default BAILink;
