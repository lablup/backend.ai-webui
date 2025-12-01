import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import usePrimaryColors from '../../hooks/usePrimaryColors';
import BAIMenu from '../BAIMenu';
import BaseWebUISider, {
  BaseWebUISiderProps,
  MenuItem,
} from '../BaseWebUISider';
import WebUILink from '../WebUILink';
import { PluginPage, WebUIPluginType } from './MainLayout';
import {
  ApiOutlined,
  ArrowLeftOutlined,
  ControlOutlined,
  FileDoneOutlined,
  HddOutlined,
  InfoCircleOutlined,
  SolutionOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  theme,
  MenuProps,
  Typography,
  ConfigProvider,
  Button,
  Tooltip,
} from 'antd';
import { filterOutEmpty, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import {
  PackagePlus,
  ClipboardClock,
  ExternalLinkIcon,
  LinkIcon,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

/**
 * Check if the current pathname is an admin page
 */
export const isAdminPath = (pathname: string): boolean => {
  const adminPaths = [
    '/admin-settings',
    '/credential',
    '/environment',
    '/scheduler',
    '/resource-policy',
    '/reservoir',
    '/agent',
    '/settings',
    '/maintenance',
    '/information',
  ];

  return _.some(adminPaths, (path) => _.startsWith(pathname, path));
};

interface WebUIAdminSiderProps extends BaseWebUISiderProps {
  webuiplugins?: WebUIPluginType;
}

const WebUIAdminSider: React.FC<WebUIAdminSiderProps> = (props) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentUserRole = useCurrentUserRole();
  const location = useLocation();
  const baiClient = useSuspendedBackendaiClient();
  const primaryColors = usePrimaryColors();
  const webuiNavigate = useWebUINavigate();
  const blockList = baiClient?._config?.blockList ?? null;
  const inactiveList = baiClient?._config?.inactiveList ?? null;

  const adminMenu: MenuProps['items'] = filterOutEmpty([
    // TODO: Enable the menu item when the page is ready.
    // WARN: Currently only superadmins can access AdminDashboardPage.
    // To place the Admin Dashboard menu item at the top of adminMenu,
    // add it to adminMenu instead of superAdminMenu:
    // currentUserRole === 'superadmin' && {
    //   label: (
    //     <WebUILink to="/admin-dashboard">
    //       {t('webui.menu.AdminDashboard')}
    //     </WebUILink>

    //   ),
    //   icon: <DashboardOutlined style={{ color: token.colorInfo }} />,
    //   key: 'admin-dashboard',
    // },
    {
      label: <WebUILink to="/credential">{t('webui.menu.Users')}</WebUILink>,
      icon: <UserOutlined style={{ color: token.colorInfo }} />,
      key: 'credential',
    },
    {
      label: (
        <WebUILink to="/environment">{t('webui.menu.Environments')}</WebUILink>
      ),
      icon: <FileDoneOutlined style={{ color: token.colorInfo }} />,
      key: 'environment',
    },
    baiClient?.supports('pending-session-list') && {
      label: <WebUILink to="/scheduler">{t('webui.menu.Scheduler')}</WebUILink>,
      icon: <ClipboardClock style={{ color: token.colorInfo }} />,
      key: 'scheduler',
    },
    {
      label: (
        <WebUILink to="/resource-policy">
          {t('webui.menu.ResourcePolicy')}
        </WebUILink>
      ),
      icon: <SolutionOutlined style={{ color: token.colorInfo }} />,
      key: 'resource-policy',
    },
    baiClient?.supports('reservoir') &&
      baiClient?._config.enableReservoir && {
        label: (
          <WebUILink to="/reservoir">{t('webui.menu.Reservoir')}</WebUILink>
        ),
        icon: <PackagePlus style={{ color: token.colorInfo }} />,
        key: 'reservoir',
      },
  ]);

  const superAdminMenu: MenuProps['items'] = filterOutEmpty([
    {
      label: <WebUILink to="/agent">{t('webui.menu.Resources')}</WebUILink>,
      icon: <HddOutlined style={{ color: token.colorInfo }} />,
      key: 'agent',
    },
    {
      label: (
        <WebUILink to="/settings">{t('webui.menu.Configurations')}</WebUILink>
      ),
      icon: <ControlOutlined style={{ color: token.colorInfo }} />,
      key: 'settings',
    },
    {
      label: (
        <WebUILink to="/maintenance">{t('webui.menu.Maintenance')}</WebUILink>
      ),
      icon: <ToolOutlined style={{ color: token.colorInfo }} />,
      key: 'maintenance',
    },
    {
      label: (
        <WebUILink to="/information">{t('webui.menu.Information')}</WebUILink>
      ),
      icon: <InfoCircleOutlined style={{ color: token.colorInfo }} />,
      key: 'information',
    },
  ]);

  const pluginMap: Record<string, MenuProps['items']> = {
    'menuitem-admin': adminMenu,
    'menuitem-superadmin': superAdminMenu,
  };

  const pluginIconMap: {
    [key: string]: React.ReactNode;
  } = {
    link: <LinkIcon />,
    externalLink: <ExternalLinkIcon />,
  };

  // Add plugin pages according to the user role.
  // Iterates over own enumerable string keyed properties of an object and invokes iteratee for each property.
  _.forOwn(props.webuiplugins, (value, key) => {
    // Check if the `pluginMap` object has the current key using the `_.has` function.
    if (_.has(pluginMap, key)) {
      const menu = pluginMap[key as keyof typeof pluginMap] as MenuItem[];
      const pluginPages = props?.webuiplugins?.page;
      _.map(value, (name) => {
        // Find page item belonging to each of menuitem-admin, menuitem-superadmin in webuiplugins.page
        const page = _.find(pluginPages, { name: name }) as PluginPage;
        // if menuitem is empty, skip adding menu item
        if (page && page.menuitem) {
          const menuItem: MenuItem = {
            label: <WebUILink to={`/${page?.url}`}>{page?.menuitem}</WebUILink>,
            icon: pluginIconMap[page.icon || ''] || <ApiOutlined />,
            key: page?.url,
            group: page.group || 'none',
          };
          menu?.push(menuItem);
        }
      });
    }
  });

  _.forEach([adminMenu, superAdminMenu], (menu) => {
    // Remove menu items that are in blockList
    _.remove(menu, (item) => _.includes(blockList, item?.key));
    // Disable menu items that are in inactiveList
    _.forEach(menu, (item) => {
      if (_.includes(inactiveList, item?.key)) {
        _.extend(item, { disabled: true });
      }
    });
  });

  const menuItems =
    currentUserRole === 'superadmin'
      ? [...adminMenu, ...superAdminMenu]
      : currentUserRole === 'admin'
        ? [...adminMenu]
        : [];

  const adminHeader = (
    <BAIFlex align="center">
      <Tooltip
        title={t('webui.menu.BackToStart')}
        placement={props.collapsed ? 'right' : 'top'}
        styles={{
          // adjust height to match menu item height
          body: {
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
          icon={<ArrowLeftOutlined />}
          onClick={() => webuiNavigate('/start')}
          style={{
            color: token.colorTextSecondary,
            // set specific size like menu items
            height: 40,
            width: 42,
            marginLeft: token.margin,
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
          {t('webui.menu.Settings')}
        </Typography>
      )}
    </BAIFlex>
  );

  return (
    <BaseWebUISider {...props} className="webui-admin-sider">
      {adminHeader}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: primaryColors.admin,
          },
        }}
      >
        <BAIMenu
          collapsed={props.collapsed}
          selectedKeys={[_.get(_.split(location.pathname, '/'), 1, '')]}
          items={[
            {
              type: 'group',
              label: (
                <BAIFlex>
                  {!props.collapsed && (
                    <Typography.Text type="secondary" ellipsis>
                      {t('webui.menu.Administration')}
                    </Typography.Text>
                  )}
                </BAIFlex>
              ),
              children: menuItems,
            },
          ]}
        />
      </ConfigProvider>
    </BaseWebUISider>
  );
};

export default WebUIAdminSider;
