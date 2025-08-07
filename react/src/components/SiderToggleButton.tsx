import { HEADER_Z_INDEX_IN_MAIN_LAYOUT } from './MainLayout/MainLayout';
import { Button, ConfigProvider, theme, Tooltip, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SiderToggleButtonProps {
  collapsed?: boolean;
  buttonTop?: number;
  onClick?: (collapsed: boolean) => void;
  hidden?: boolean;
  // style?: React.CSSProperties;
}
const SiderToggleButton: React.FC<SiderToggleButtonProps> = ({
  collapsed = false,
  buttonTop,
  onClick,
  hidden,
}) => {
  const { t } = useTranslation();

  const { token } = theme.useToken();
  return (
    <BAIFlex
      style={{
        position: 'absolute',
        right: 0,
        transform: 'translateX(12px)',
        paddingTop: buttonTop,
        zIndex: HEADER_Z_INDEX_IN_MAIN_LAYOUT + 1,
      }}
      direction="column"
      justify={buttonTop ? 'start' : 'center'}
    >
      <ConfigProvider
        theme={{
          components: {
            Button: {
              defaultBorderColor: token.colorBorderSecondary,
            },
          },
        }}
      >
        <Tooltip
          title={
            <>
              {collapsed ? t('button.Expand') : t('button.Collapse')}
              <Typography.Text
                code
                style={{
                  color: 'inherit',
                }}
              >
                {'['}
              </Typography.Text>
            </>
          }
          placement="right"
        >
          <Button
            shape="circle"
            // className={classNames(styles.toggleBtn, 'toggle-btn')}
            size="small"
            icon={
              collapsed ? (
                <ChevronRightIcon color={token.colorTextTertiary} />
              ) : (
                <ChevronLeftIcon color={token.colorTextTertiary} />
              )
            }
            onClick={() => {
              onClick && onClick(!collapsed);
            }}
            style={{
              boxShadow: 'none',
              visibility: 'hidden',
              opacity: 0,
              transition: 'opacity 0.2s ease, visibility 0.2s ease',
              ...(!hidden ? { visibility: 'visible', opacity: 1 } : {}),
            }}
          />
        </Tooltip>
      </ConfigProvider>
    </BAIFlex>
  );
};

export default SiderToggleButton;
