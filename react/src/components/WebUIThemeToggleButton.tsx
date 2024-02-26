import { useThemeMode } from '../hooks/useThemeMode';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import React from 'react';

interface WebUIThemeToggleButtonProps extends ButtonProps {}

const WebUIThemeToggleButton: React.FC<WebUIThemeToggleButtonProps> = ({
  ...props
}) => {
  const { isDarkMode, themeMode, setThemeMode } = useThemeMode();

  return (
    <Button
      size="large"
      type="text"
      icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
      onClick={() => {
        setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
      }}
      {...props}
    />
  );
};

export default WebUIThemeToggleButton;
