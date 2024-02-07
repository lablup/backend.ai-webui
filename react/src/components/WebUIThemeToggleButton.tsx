import { useThemeMode } from '../hooks/useThemeMode';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, ButtonProps, theme } from 'antd';
import React, { useState } from 'react';

interface WebUIThemeToggleButtonProps extends ButtonProps {}

const WebUIThemeToggleButton: React.FC<WebUIThemeToggleButtonProps> = ({
  ...props
}) => {
  const { isDarkMode, themeMode, setThemeMode } = useThemeMode();
  const { token } = theme.useToken();

  return (
    <Button
      size="large"
      type="text"
      icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
      onClick={() => {
        const event: Event = new CustomEvent('theme-mode-changed', {
          detail: { token },
        });
        document.dispatchEvent(event);
        setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
      }}
      {...props}
    />
  );
};

export default WebUIThemeToggleButton;
