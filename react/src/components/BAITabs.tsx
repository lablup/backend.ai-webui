import { Tabs, type TabsProps } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';
import React from 'react';

const useStyles = createStyles(({ token, css }) => ({
  baiTabs: css`
    .ant-tabs-nav::before {
      border-color: ${token.colorPrimary};
    }
    .ant-tabs-tab:not(.ant-tabs-tab-active) {
      border-bottom-color: ${token.colorPrimary};
    }
    .ant-tabs-tab.ant-tabs-tab-active {
      border-color: ${token.colorPrimary};
    }
  `,
}));

interface BAITabsProps extends TabsProps {}
const BAITabs: React.FC<BAITabsProps> = ({ className, ...props }) => {
  const { styles } = useStyles();
  return (
    <Tabs
      className={classNames(styles.baiTabs, className)}
      type="card"
      {...props}
    />
  );
};

export default BAITabs;
