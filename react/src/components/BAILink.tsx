import { createStyles } from 'antd-style';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

const useStyles = createStyles(({ css, token }) => ({
  hover: css`
    text-decoration: none;
    color: inherit;

    &:hover {
      color: ${token.colorLinkHover};
      text-decoration: underline;
    }
  `,
}));

interface BAILinkProps extends LinkProps {
  type?: 'hover';
}
const BAILink: React.FC<BAILinkProps> = ({ type, ...linkProps }) => {
  const { styles } = useStyles();
  return (
    <Link
      className={type === 'hover' ? styles.hover : undefined}
      {...linkProps}
    />
  );
};

export default BAILink;
