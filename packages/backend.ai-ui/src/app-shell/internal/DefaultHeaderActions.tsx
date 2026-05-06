import { useThemeMode } from '../hooks/useThemeMode';
import { Button, Space, Tooltip } from 'antd';
import { CircleHelp, CircleUser, Moon, Sun } from 'lucide-react';

export interface DefaultHeaderActionsProps {
  /** Show the theme toggle button. Defaults to true. */
  showThemeToggle?: boolean;
  /** Show a help button. Defaults to true. Override `onHelpClick` to wire it up. */
  showHelpButton?: boolean;
  /** Show a user-menu button. Defaults to true. Override `onUserClick` to wire it up. */
  showUserButton?: boolean;
  /** Click handler for the help button. */
  onHelpClick?: () => void;
  /** Click handler for the user-menu button. */
  onUserClick?: () => void;
}

export function DefaultHeaderActions({
  showThemeToggle = true,
  showHelpButton = true,
  showUserButton = true,
  onHelpClick,
  onUserClick,
}: DefaultHeaderActionsProps) {
  const { isDarkMode, setThemeMode } = useThemeMode();
  const NextIcon = isDarkMode ? Sun : Moon;
  const next = isDarkMode ? 'light' : 'dark';
  const tooltipLabel = isDarkMode
    ? 'Switch to light mode'
    : 'Switch to dark mode';

  return (
    <Space size={4}>
      {showThemeToggle && (
        <Tooltip title={tooltipLabel} placement="bottom">
          <Button
            type="text"
            shape="circle"
            icon={<NextIcon size={18} aria-hidden="true" />}
            onClick={() => setThemeMode(next)}
            aria-label={tooltipLabel}
          />
        </Tooltip>
      )}
      {showHelpButton && (
        <Tooltip title="Help" placement="bottom">
          <Button
            type="text"
            shape="circle"
            icon={<CircleHelp size={18} aria-hidden="true" />}
            onClick={onHelpClick}
            aria-label="Help"
          />
        </Tooltip>
      )}
      {showUserButton && (
        <Tooltip title="User menu" placement="bottom">
          <Button
            type="text"
            shape="circle"
            icon={<CircleUser size={18} aria-hidden="true" />}
            onClick={onUserClick}
            aria-label="User menu"
          />
        </Tooltip>
      )}
    </Space>
  );
}
