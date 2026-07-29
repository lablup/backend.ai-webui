/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../../hooks';
import { useIsProjectAgnosticPage } from '../../hooks/useIsProjectAgnosticPage';
import BAINotificationButton from '../BAINotificationButton';
import LoginSessionExtendButton from '../LoginSessionExtendButton';
import ReverseThemeProvider from '../ReverseThemeProvider';
import UserDropdownMenu from '../UserDropdownMenu';
import WEBUIHelpButton from '../WEBUIHelpButton';
import WebUIThemeToggleButton from '../WebUIThemeToggleButton';
import WebUIHeaderProjectSelect from './WebUIHeaderProjectSelect';
import { theme, Button, Grid, Divider } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
import { MenuIcon } from 'lucide-react';
import { Suspense } from 'react';

const useStyles = createStyles(({ css }) => ({
  webuiHeader: css`
    &,
    & .draggable {
      -webkit-app-region: drag;
    }
    & .non-draggable {
      -webkit-app-region: no-drag;
    }
  `,
}));

export interface WebUIHeaderProps extends BAIFlexProps {
  onClickMenuIcon?: () => void;
}

const WebUIHeader: React.FC<WebUIHeaderProps> = ({ onClickMenuIcon }) => {
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const gridBreakpoint = Grid.useBreakpoint();
  // FR-3414 (ADR-0001): the project-agnostic pages operate above project
  // scope, so the header's current-project selector (and the selector-bound
  // admin-exit confirm flow inside it) is not mounted there at all. Nothing
  // then reads or writes the current-project atom from the header on those
  // routes — leaving admin restores the previous selection untouched. The
  // header layout keeps `justify="between"`, so the left slot simply
  // collapses (no placeholder needed); the mobile menu button stays.
  const isProjectAgnosticPage = useIsProjectAgnosticPage();

  const { styles } = useStyles();

  return (
    <BAIFlex
      data-testid="webui-header"
      align="center"
      justify="between"
      direction="row"
      style={{
        height: token.Layout?.headerHeight || 60,
        backgroundColor: token.Layout?.headerBg,
        paddingRight: token.marginLG,
        paddingLeft: token.marginLG,
        color: token.colorBgBase,
      }}
      className={`${styles.webuiHeader} bai-webui-header`}
    >
      <BAIFlex data-testid="label-selector-project" direction="row" gap={'sm'}>
        {!gridBreakpoint.sm && (
          <ReverseThemeProvider>
            <Button
              icon={<MenuIcon />}
              type="text"
              onClick={() => {
                onClickMenuIcon?.();
              }}
              className="non-draggable"
              style={{
                marginLeft: token.marginSM * -1,
              }}
            />
          </ReverseThemeProvider>
        )}
        {!isProjectAgnosticPage && (
          <Suspense>
            <WebUIHeaderProjectSelect />
          </Suspense>
        )}
      </BAIFlex>
      <BAIFlex
        direction="row"
        className="non-draggable"
        gap="xxs"
        align="center"
      >
        {baiClient.supports('extend-login-session') &&
          baiClient._config.enableExtendLoginSession && (
            <Suspense>
              <LoginSessionExtendButton data-testid="button-extend-login-session" />
              {gridBreakpoint.md && (
                <Divider
                  orientation="vertical"
                  style={{ borderColor: 'transparent' }}
                />
              )}
            </Suspense>
          )}
        <BAINotificationButton data-testid="button-notification" />
        <ReverseThemeProvider>
          <WebUIThemeToggleButton data-testid="button-theme" />
          <WEBUIHelpButton data-testid="button-help" />
        </ReverseThemeProvider>
        <UserDropdownMenu
          data-testid="dropdown-user-menu"
          buttonRender={(btn) => (
            //  Add a `div` to resolve the Dropdown bug when the child is a `ConfigProvider`(ReverseThemeProvider).
            <div>
              <ReverseThemeProvider>{btn}</ReverseThemeProvider>
            </div>
          )}
          style={{
            marginLeft: token.marginXXS,
            marginRight: token.marginSM * -1,
            paddingLeft: token.paddingSM,
            paddingRight: token.paddingSM,
          }}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default WebUIHeader;
