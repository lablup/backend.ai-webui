/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useThemeMode } from '../hooks/useThemeMode';
import { Button, type ButtonProps } from 'antd';
import { Moon, Sun } from 'lucide-react';
import React from 'react';

interface WebUIThemeToggleButtonProps extends ButtonProps {}

const WebUIThemeToggleButton: React.FC<WebUIThemeToggleButtonProps> = ({
  ...props
}) => {
  const { isDarkMode, setThemeMode } = useThemeMode();

  return (
    <Button
      type="text"
      icon={isDarkMode ? <Sun size="1em" /> : <Moon size="1em" />}
      onClick={() => {
        setThemeMode(isDarkMode ? 'light' : 'dark');
      }}
      {...props}
    />
  );
};

export default WebUIThemeToggleButton;
