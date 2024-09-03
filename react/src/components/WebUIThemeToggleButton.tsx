import { useThemeMode } from '../hooks/useThemeMode';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import React from 'react';

interface WebUIThemeToggleButtonProps extends ButtonProps {
  iconColor?: string;
}

const WebUIThemeToggleButton: React.FC<WebUIThemeToggleButtonProps> = ({
  ...props
}) => {
  const { isDarkMode, setIsDarkMode } = useThemeMode();

  return (
    <Button
      size="large"
      type="text"
      icon={
        isDarkMode ? (
          <SunOutlined style={{ color: props.iconColor ?? 'inherit' }} />
        ) : (
          <MoonOutlined style={{ color: props.iconColor ?? 'inherit' }} />
        )
      }
      onClick={() => {
        // comment out darkMode
        // setIsDarkMode(!isDarkMode);
      }}
      {...props}
    />
  );
};

export default WebUIThemeToggleButton;
