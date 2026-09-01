/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useThemeMode } from '../hooks/useThemeMode';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Moon, Sun } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// PILOT-DECISION: antd `Button type="text" icon` with no children → Astryx
// `IconButton variant="ghost"` (MAPPING §3.3, icon-only branch). P1 grep: the
// only consumer (WebUIHeader) passes `data-testid` alone, so the interface no
// longer `extends ButtonProps` — it declares exactly that surface.
// P8: an icon-only control needs a real accessible name; antd allowed none.
interface WebUIThemeToggleButtonProps {
  'data-testid'?: string;
}

const WebUIThemeToggleButton: React.FC<WebUIThemeToggleButtonProps> = ({
  ...props
}) => {
  const { t } = useTranslation();
  const { isDarkMode, setThemeMode } = useThemeMode();

  return (
    <IconButton
      variant="ghost"
      label={
        isDarkMode ? t('userSettings.LightMode') : t('userSettings.DarkMode')
      }
      icon={isDarkMode ? <Sun size="1em" /> : <Moon size="1em" />}
      onClick={() => {
        setThemeMode(isDarkMode ? 'light' : 'dark');
      }}
      {...props}
    />
  );
};

export default WebUIThemeToggleButton;
