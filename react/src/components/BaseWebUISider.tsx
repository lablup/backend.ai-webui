import { useCustomThemeConfig } from '../helper/customThemeConfig';
import { useWebUINavigate } from '../hooks';
import AboutBackendAIModal from './AboutBackendAIModal';
import BAISider, { BAISiderProps } from './BAISider';
import { WebUIPluginType } from './MainLayout/MainLayout';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import ThemeReverseProvider from './ReverseThemeProvider';
import SiderToggleButton from './SiderToggleButton';
import SignoutModal from './SignoutModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import { useHover, useToggle } from 'ahooks';
import { theme, Typography, ConfigProvider, Divider, Grid } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useContext, useRef, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type MenuItem = {
  label: ReactNode;
  icon: React.ReactNode;
  group?: string;
  key: string;
};

interface BaseWebUISiderProps
  extends Pick<
    BAISiderProps,
    'collapsed' | 'collapsedWidth' | 'onBreakpoint' | 'onCollapse'
  > {
  webuiplugins?: WebUIPluginType;
  logo?: ReactNode;
  logoCollapsed?: ReactNode;
  children?: ReactNode;
  showFooter?: boolean;
  className?: string;
}

const BaseWebUISider: React.FC<BaseWebUISiderProps> = ({
  logo,
  logoCollapsed,
  children,
  showFooter = true,
  className = 'webui-sider',
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const themeConfig = useCustomThemeConfig();
  const webuiNavigate = useWebUINavigate();

  const config = useContext(ConfigProvider.ConfigContext);
  const currentSiderTheme =
    config.theme?.algorithm === theme.darkAlgorithm ? 'dark' : 'light';

  const [isOpenSignoutModal, { toggle: toggleSignoutModal }] = useToggle(false);
  const [isOpenTOSModal, { toggle: toggleTOSModal }] = useToggle(false);
  const [isOpenPrivacyPolicyModal, { toggle: togglePrivacyPolicyModal }] =
    useToggle(false);
  const [isOpenAboutBackendAIModal, { toggle: toggleAboutBackendAIModal }] =
    useToggle(false);

  const siderRef = useRef<HTMLDivElement>(null);
  const isSiderHover = useHover(siderRef);
  const gridBreakpoint = Grid.useBreakpoint();

  // Get backend client from children's context
  const [baiClient] = React.useState(() => {
    try {
      // @ts-ignore
      return window.backendaiclient;
    } catch {
      return null;
    }
  });

  const defaultLogo = (
    <img
      className="logo-wide"
      alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
      src={
        currentSiderTheme === 'dark' && themeConfig?.logo?.srcDark
          ? themeConfig?.logo?.srcDark || '/manifest/backend.ai-white-text.svg'
          : themeConfig?.logo?.src || '/manifest/backend.ai-white-text.svg'
      }
      style={{
        width: themeConfig?.logo?.size?.width || 159,
        height: themeConfig?.logo?.size?.height || 24,
        cursor: 'pointer',
      }}
      onClick={() => webuiNavigate(themeConfig?.logo?.href || '/start')}
    />
  );

  const defaultLogoCollapsed = (
    <img
      className="logo-collapsed"
      alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
      src={
        currentSiderTheme === 'dark' && themeConfig?.logo?.srcCollapsedDark
          ? themeConfig?.logo?.srcCollapsedDark ||
            '/manifest/backend.ai-brand-simple-bgdark.svg'
          : themeConfig?.logo?.srcCollapsed ||
            '/manifest/backend.ai-brand-simple.svg'
      }
      style={{
        width: themeConfig?.logo.sizeCollapsed?.width ?? 24,
        height: themeConfig?.logo.sizeCollapsed?.height ?? 24,
        cursor: 'pointer',
      }}
      onClick={() => webuiNavigate(themeConfig?.logo?.href || '/start')}
    />
  );

  return (
    <BAISider
      className={className}
      ref={siderRef}
      logo={logo || defaultLogo}
      theme={currentSiderTheme}
      logoCollapsed={logoCollapsed || defaultLogoCollapsed}
      {...props}
    >
      <SiderToggleButton
        collapsed={props.collapsed}
        buttonTop={68}
        onClick={(collapsed) => {
          props.onCollapse?.(collapsed, 'clickTrigger');
        }}
        hidden={!gridBreakpoint.sm || !isSiderHover}
      />
      <BAIFlex
        direction="column"
        align="stretch"
        justify="start"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: token.paddingLG,
          paddingBottom: token.paddingSM,
        }}
      >
        {children}
      </BAIFlex>
      {showFooter && !props.collapsed ? (
        <BAIFlex
          justify="center"
          className="sider-footer-wrap"
          direction="column"
          style={{
            width: '100%',
            padding: 30,
            paddingTop: 0,
            textAlign: 'center',
          }}
        >
          <Typography.Text
            type="secondary"
            style={{
              fontSize: '12px',
              wordBreak: 'normal',
            }}
          >
            <div className="terms-of-use">
              <Divider style={{ marginTop: 0, marginBottom: token.margin }} />
              <BAIFlex
                wrap="wrap"
                style={{ fontSize: token.sizeXS }}
                justify="center"
              >
                <Typography.Link
                  data-testid="button-terms-of-service"
                  type="secondary"
                  style={{ fontSize: 11 }}
                  onClick={() => {
                    toggleTOSModal();
                  }}
                >
                  {t('webui.menu.TermsOfService')}
                </Typography.Link>
                &nbsp;·&nbsp;
                <Typography.Link
                  data-testid="button-privacy-policy"
                  type="secondary"
                  style={{ fontSize: 11 }}
                  onClick={() => {
                    togglePrivacyPolicyModal();
                  }}
                >
                  {t('webui.menu.PrivacyPolicy')}
                </Typography.Link>
                &nbsp;·&nbsp;
                <Typography.Link
                  data-testid="button-about-backend-ai"
                  type="secondary"
                  style={{ fontSize: 11 }}
                  onClick={() => {
                    toggleAboutBackendAIModal();
                  }}
                >
                  {t('webui.menu.AboutBackendAI')}
                </Typography.Link>
                {!!baiClient?._config?.allowSignout && (
                  <>
                    &nbsp;·&nbsp;
                    <Typography.Link
                      data-testid="button-leave-service"
                      type="secondary"
                      style={{ fontSize: 11 }}
                      onClick={toggleSignoutModal}
                    >
                      {t('webui.menu.LeaveService')}
                    </Typography.Link>
                    <SignoutModal
                      open={isOpenSignoutModal}
                      onRequestClose={toggleSignoutModal}
                    />
                  </>
                )}
              </BAIFlex>
            </div>
            <address>
              <small className="sidebar-footer">
                {themeConfig?.branding?.companyName || 'Lablup Inc.'}
              </small>
              &nbsp;
              <small
                className="sidebar-footer"
                style={{ fontSize: token.sizeXS }}
              >
                {/* @ts-ignore */}
                {`${global.packageVersion}.${globalThis.buildNumber}`}
              </small>
            </address>
          </Typography.Text>
        </BAIFlex>
      ) : null}
      <TermsOfServiceModal
        open={isOpenTOSModal}
        onRequestClose={toggleTOSModal}
      />
      <PrivacyPolicyModal
        open={isOpenPrivacyPolicyModal}
        onRequestClose={togglePrivacyPolicyModal}
      />
      <AboutBackendAIModal
        open={isOpenAboutBackendAIModal}
        onRequestClose={toggleAboutBackendAIModal}
      />
    </BAISider>
  );
};

const BaseWebUISiderWithCustomTheme: React.FC<BaseWebUISiderProps> = (
  props,
) => {
  const themeConfig = useCustomThemeConfig();
  const config = useContext(ConfigProvider.ConfigContext);
  const isParentDark = config.theme?.algorithm === theme.darkAlgorithm;

  const shouldReverse =
    (isParentDark && themeConfig?.sider?.theme === 'light') ||
    (!isParentDark && themeConfig?.sider?.theme === 'dark');

  return shouldReverse ? (
    <ThemeReverseProvider>
      <BaseWebUISider {...props} />
    </ThemeReverseProvider>
  ) : (
    <BaseWebUISider {...props} />
  );
};

export default BaseWebUISiderWithCustomTheme;
export type { BaseWebUISiderProps };
