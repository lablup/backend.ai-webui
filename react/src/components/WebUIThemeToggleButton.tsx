import { useThemeMode } from '../hooks/useThemeMode';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import React from 'react';

interface WebUIThemeToggleButtonProps extends ButtonProps {}

const WebUIThemeToggleButton: React.FC<WebUIThemeToggleButtonProps> = ({
  ...props
}) => {
  const { isDarkMode, setIsDarkMode } = useThemeMode();

  return (
    <Button
      size="large"
      type="text"
      icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
      onClick={() => {
        setIsDarkMode(!isDarkMode);
      }}
      {...props}
    />
  );
};

export default WebUIThemeToggleButton;
