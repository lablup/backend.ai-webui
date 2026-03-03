/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useThemeMode } from '../hooks/useThemeMode';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';
import React from 'react';

interface WebUIThemeToggleButtonProps extends ButtonProps {}

const WebUIThemeToggleButton: React.FC<WebUIThemeToggleButtonProps> = ({
  ...props
}) => {
  const { isDarkMode, setIsDarkMode } = useThemeMode();

  return (
    <Button
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
