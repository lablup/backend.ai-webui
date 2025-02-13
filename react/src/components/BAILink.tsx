import { Typography } from 'antd';
import { createStyles } from 'antd-style';
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
}));

interface BAILinkProps extends Omit<LinkProps, 'to'> {
  type?: 'hover';
  to?: LinkProps['to'];
}
const BAILink: React.FC<BAILinkProps> = ({ type, to, ...linkProps }) => {
  const { styles } = useStyles();
  return to ? (
    <Link
      className={type === 'hover' ? styles.hover : undefined}
      to={to}
      {...linkProps}
    />
  ) : (
    <Typography.Link
      className={type === 'hover' ? styles.hover : undefined}
      onClick={linkProps.onClick}
      {...linkProps}
    />
  );
};

export default BAILink;
