/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useCustomThemeConfig } from '../../hooks/useCustomThemeConfig';
import usePrimaryColors from '../../hooks/usePrimaryColors';
import {
  getPathFromMenuKey,
  useWebUIMenuItems,
} from '../../hooks/useWebUIMenuItems';
import AboutBackendAIModal from '../AboutBackendAIModal';
import BAIMenu from '../BAIMenu';
import BAISider, { BAISiderProps } from '../BAISider';
import PrivacyPolicyModal from '../PrivacyPolicyModal';
import ThemeReverseProvider from '../ReverseThemeProvider';
import SiderToggleButton from '../SiderToggleButton';
import SignoutModal from '../SignoutModal';
import TermsOfServiceModal from '../TermsOfServiceModal';
import WebUILink from '../WebUILink';
import { useHover, useSessionStorageState, useToggle } from 'ahooks';
import {
  theme,
  Typography,
  ConfigProvider,
  Divider,
  Grid,
  Tooltip,
  Button,
  type MenuProps,
} from 'antd';
import { filterOutEmpty, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ArrowLeftIcon, ShieldUserIcon } from 'lucide-react';
import React, { useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface WebUISiderProps extends Pick<
  BAISiderProps,
  'collapsed' | 'collapsedWidth' | 'onBreakpoint' | 'onCollapse'
> {}

const WebUISider: React.FC<WebUISiderProps> = (props) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const themeConfig = useCustomThemeConfig();

  const config = useContext(ConfigProvider.ConfigContext);
  const currentSiderTheme =
    config.theme?.algorithm === theme.darkAlgorithm ? 'dark' : 'light';

  const webuiNavigate = useWebUINavigate();
  const location = useLocation();
  const baiClient = useSuspendedBackendaiClient();

  const [isOpenSignoutModal, { toggle: toggleSignoutModal }] = useToggle(false);
  const [isOpenTOSModal, { toggle: toggleTOSModal }] = useToggle(false);
  const [isOpenPrivacyPolicyModal, { toggle: togglePrivacyPolicyModal }] =
    useToggle(false);
  const [isOpenAboutBackendAIModal, { toggle: toggleAboutBackendAIModal }] =
    useToggle(false);

  const siderRef = useRef<HTMLDivElement>(null);
  const isSiderHover = useHover(siderRef);
  const gridBreakpoint = Grid.useBreakpoint();
  const primaryColors = usePrimaryColors();

  const {
    groupedGeneralMenu,
    groupedAdminMenu,
    isSelectedAdminCategoryMenu,
    isCurrentPathAdminCategory,
    isCurrentPageUnauthorized,
    firstAvailableAdminMenuItem,
    defaultMenuPath,
  } = useWebUIMenuItems({
    hideGroupName: props.collapsed,
  });

  const [goBackPath, setGoBackPath] = useSessionStorageState(
    'backendaiwebui.last_visited_general_path',
  );

  // Store the last visited general (non-admin) menu path so the admin header's
  // "go back" button can return the user to where they were. Use the role-
  // independent `isCurrentPathAdminCategory` instead of
  // `isSelectedAdminCategoryMenu`: the latter is role-filtered and would
  // misclassify an admin page as "general" for users whose admin menu
  // excludes that page (e.g. superadmin on `/project-admin-users`), which
  // would pollute `goBackPath` with an admin path and make a later go-back
  // navigate to the same page.
  useEffect(() => {
    if (!isCurrentPathAdminCategory) {
      setGoBackPath(location.pathname);
    }
    // `location` is from react-router useLocation() — pathname is reactive across navigations.
    // react-doctor-disable-next-line react-doctor/no-mutable-in-deps
  }, [setGoBackPath, location.pathname, isCurrentPathAdminCategory]);

  const adminHeader = (
    <BAIFlex align="center">
      <Tooltip
        title={t('webui.menu.GoBack')}
        placement={props.collapsed ? 'right' : 'top'}
        styles={{
          // adjust height to match menu item height
          container: {
            height: 40,
            display: 'flex',
            alignItems: 'center',
            fontSize: token.fontSizeLG,
          },
        }}
      >
        <Button
          type="text"
          shape="circle"
          icon={<ArrowLeftIcon />}
          onClick={() => {
            webuiNavigate(goBackPath || defaultMenuPath);
          }}
          aria-label={t('webui.menu.GoBack')}
          style={{
            color: token.colorTextSecondary,
            // set specific size like menu items
            height: 40,
            width: 42,
            marginLeft: token.margin,
            marginBottom: 4,
          }}
        />
      </Tooltip>
      {!props.collapsed && (
        <Typography
          style={{
            fontSize: token.fontSizeLG,
            fontWeight: token.fontWeightStrong,
            color: token.colorText,
          }}
        >
          {t('webui.menu.AdminSettings')}
        </Typography>
      )}
    </BAIFlex>
  );

  return (
    <BAISider
      className="webui-sider"
      ref={siderRef}
      logo={
        <img
          className="logo-wide"
          alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
          src={
            currentSiderTheme === 'dark'
              ? themeConfig?.logo?.srcDark ||
                '/manifest/backend.ai-webui-white.svg'
              : themeConfig?.logo?.src || '/manifest/backend.ai-webui-white.svg'
          }
          style={{
            width: themeConfig?.logo?.size?.width || 159,
            height: themeConfig?.logo?.size?.height || 24,
            cursor: 'pointer',
            display: 'block',
          }}
          onClick={() => webuiNavigate(defaultMenuPath)}
        />
      }
      theme={currentSiderTheme}
      logoCollapsed={
        <img
          className="logo-collapsed"
          alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
          src={
            currentSiderTheme === 'dark'
              ? themeConfig?.logo?.srcCollapsedDark ||
                '/manifest/backend.ai-brand-simple-black.svg'
              : themeConfig?.logo?.srcCollapsed ||
                '/manifest/backend.ai-brand-simple-white.svg'
          }
          style={{
            width: themeConfig?.logo?.sizeCollapsed?.width ?? 24,
            height: themeConfig?.logo?.sizeCollapsed?.height ?? 24,
            cursor: 'pointer',
            display: 'block',
          }}
          onClick={() => webuiNavigate(defaultMenuPath)}
        />
      }
      {...props}
    >
      <SiderToggleButton
        collapsed={props.collapsed}
        buttonTop={68}
        // buttonTop={18}
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
        {(!isSelectedAdminCategoryMenu || isCurrentPageUnauthorized) && (
          <BAIMenu
            collapsed={props.collapsed}
            selectedKeys={[
              location.pathname.split('/')[1] || 'start',
              // TODO: After 'SessionListPage' is completed and used as the main page, remove this code
              //       and change 'job' key to 'session'
              location.pathname.split('/')[1] === 'session' ? 'job' : '',
            ]}
            // @ts-ignore
            items={filterOutEmpty([
              firstAvailableAdminMenuItem && {
                // Go to first page of admin setting pages.
                label: (
                  <WebUILink
                    to={getPathFromMenuKey(firstAvailableAdminMenuItem.key)}
                  >
                    {t('webui.menu.AdminSettings')}
                  </WebUILink>
                ),
                icon: <ShieldUserIcon style={{ color: token.colorInfo }} />,
                key: 'admin-settings',
              },
              ...groupedGeneralMenu,
            ])}
          />
        )}
        {firstAvailableAdminMenuItem && isSelectedAdminCategoryMenu && (
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: primaryColors.admin,
              },
            }}
          >
            {adminHeader}
            <BAIMenu
              collapsed={props.collapsed}
              selectedKeys={[
                // TODO: After matching first path of 'storage-settings' and 'agent', remove this code
                location.pathname.split('/')[1] === 'storage-settings'
                  ? 'agent'
                  : location.pathname.split('/')[1],
              ]}
              items={groupedAdminMenu as MenuProps['items']}
            />
          </ConfigProvider>
        )}
      </BAIFlex>
      {props.collapsed ? null : (
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
                {`${globalThis.packageVersion}.${globalThis.buildNumber}`}
              </small>
            </address>
          </Typography.Text>
        </BAIFlex>
      )}
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

const WebUISiderWithCustomTheme: React.FC<WebUISiderProps> = (props) => {
  const themeConfig = useCustomThemeConfig();
  const config = useContext(ConfigProvider.ConfigContext);
  const isParentDark = config.theme?.algorithm === theme.darkAlgorithm;

  const shouldReverse =
    (isParentDark && themeConfig?.sider?.theme === 'light') ||
    (!isParentDark && themeConfig?.sider?.theme === 'dark');

  return shouldReverse ? (
    <ThemeReverseProvider>
      <WebUISider {...props} />
    </ThemeReverseProvider>
  ) : (
    <WebUISider {...props} />
  );
};

export default WebUISiderWithCustomTheme;
