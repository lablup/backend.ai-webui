import { useSuspendedBackendaiClient } from '../../hooks';
import BAIMenu from '../BAIMenu';
import BAISider, { BAISiderProps } from '../BAISider';
import Flex from '../Flex';
import {
  BarChartOutlined,
  BarsOutlined,
  BellOutlined,
  CaretRightOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  DashboardOutlined,
  ExportOutlined,
  FileDoneOutlined,
  HddOutlined,
  HolderOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  MenuOutlined,
  RocketOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  theme,
  Layout,
  Button,
  Typography,
  Avatar,
  Dropdown,
  MenuProps,
} from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const WebUISider: React.FC<
  Pick<BAISiderProps, 'collapsed' | 'collapsedWidth' | 'onBreakpoint'>
> = (props) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const baiClient = useSuspendedBackendaiClient();
  const generalMenu: MenuProps['items'] = [
    {
      label: t('webui.menu.Summary'),
      icon: <DashboardOutlined />,
      key: 'summary',
    },
    {
      label: t('webui.menu.Sessions'),
      icon: <BarsOutlined />,
      key: 'job',
    },
    {
      label: t('webui.menu.Serving'),
      icon: <RocketOutlined />,
      key: 'serving',
    },
    {
      label: t('webui.menu.Import&Run'),
      icon: <CaretRightOutlined />,
      key: 'import',
    },
    {
      label: t('webui.menu.Data&Storage'),
      icon: <CloudUploadOutlined />,
      key: 'data',
    },
    {
      label: t('webui.menu.AgentSummary'),
      icon: <HddOutlined />,
      key: 'agent-summary',
    },
    {
      label: t('webui.menu.Statistics'),
      icon: <BarChartOutlined />,
      key: 'statistics',
    },
    {
      label: t('webui.menu.FastTrack'),
      icon: <ExportOutlined />,
      key: 'fasttrack',
    },
  ];

  const adminDivider: MenuProps['items'] = [
    {
      label: <>{t('webui.menu.Administration')}</>,
      type: 'group',
    },
    { type: 'divider' },
  ];

  const adminMenu: MenuProps['items'] = [
    {
      label: t('webui.menu.Users'),
      icon: <UserOutlined />,
      key: 'credential',
    },
    {
      label: t('webui.menu.Environments'),
      icon: <FileDoneOutlined />,
      key: 'environment',
    },
  ];

  const superAdminMenu: MenuProps['items'] = [
    {
      label: t('webui.menu.Resources'),
      icon: <HddOutlined />,
      key: 'agent',
    },
    {
      label: t('webui.menu.Configurations'),
      icon: <ControlOutlined />,
      key: 'settings',
    },
    {
      label: t('webui.menu.Maintenance'),
      icon: <ToolOutlined />,
      key: 'maintenance',
    },
    {
      label: t('webui.menu.Information'),
      icon: <InfoCircleOutlined />,
      key: 'information',
    },
  ];

  return (
    <BAISider
      logo={
        <img
          alt="Backend.AI Logo"
          className="logo-wide"
          src={'/manifest/backend.ai-text.svg'}
          style={{ width: 218, height: 55 }}
        />
      }
      logoCollapsed={
        <img
          alt="Backend.AI Logo"
          className="logo-square"
          src={'/manifest/backend.ai-brand-simple.svg'}
          style={{ width: 55, height: 55 }}
        />
      }
      logoTitle="WebUI"
      logoTitleCollapsed="WebUI"
      bottomText={
        <>
          <div className="terms-of-use">
            <Flex
              wrap="wrap"
              style={{ fontSize: token.sizeXS }}
              justify="center"
            >
              <a
                style={{ color: token.colorTextSecondary }}
                onClick={() => {
                  document.dispatchEvent(new CustomEvent('show-TOS-agreement'));
                }}
              >
                {t('webui.menu.TermsOfService')}
              </a>
              &nbsp;·&nbsp;
              <a
                style={{ color: token.colorTextSecondary }}
                onClick={() => {
                  document.dispatchEvent(new CustomEvent('show-PP-agreement'));
                }}
              >
                {t('webui.menu.PrivacyPolicy')}
              </a>
              &nbsp;·&nbsp;
              <a
                style={{ color: token.colorTextSecondary }}
                onClick={() => {
                  document.dispatchEvent(
                    new CustomEvent('show-about-backendai'),
                  );
                }}
              >
                {t('webui.menu.AboutBackendAI')}
              </a>
            </Flex>
          </div>
          <address>
            <small className="sidebar-footer">Lablup Inc.</small>
            <small
              className="sidebar-footer"
              style={{ fontSize: token.sizeXS }}
            >
              {/* {window.ManagerHub?.version} */}
            </small>
          </address>
        </>
      }
    >
      {/* <Flex justify="center" align="center">
    <Button
      icon={<MenuOutlined />}
      type="text"
      onClick={() => {
        setSideCollapsed((v) => !v);
      }}
    />
  </Flex> */}
      <BAIMenu
        selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
        items={
          isSuperAdmin
            ? [...generalMenu, ...adminDivider, ...adminMenu, ...superAdminMenu]
            : isAdmin
            ? [...generalMenu, ...adminDivider, ...adminMenu]
            : [...generalMenu]
        }
        // {[
        /**
         * General menu
         */
        /**
         * Plugin menu
         */
        /**
         * Admin menu
         */
        /**
         * Superadmin menu
         */
        /**
         * Admin plugin menu
         */
        /**
         * Etc menu
         */
        // {
        //   label: '404',
        //   icon: <QuestionOutlined />,
        //   key: '404',
        // },
        // ]}
        onClick={({ key, keyPath }) => {
          // const menu = _.find(
          //   [...generalMenu, ...adminMenu, ...superAdminMenu],
          //   {
          //     key: key,
          //   },
          // );
          // if (menu) {
          //   // @ts-ignore
          //   setTitle(menu.label);
          // }
          navigate(keyPath.join('/'));
          document.dispatchEvent(
            new CustomEvent('move-to-from-react', {
              detail: '/' + keyPath.join('/'),
            }),
          );
        }}
      />
    </BAISider>
  );
};
export default WebUISider;
