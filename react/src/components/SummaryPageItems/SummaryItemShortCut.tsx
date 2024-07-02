import { useWebUINavigate } from '../../hooks';
import Flex from '../Flex';
import {
  FileOutlined,
  InboxOutlined,
  SettingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Typography, theme } from 'antd';
import { useTheme } from 'antd-style';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface itemProps {
  id: string;
  title: string;
  content: string;
  icon?: JSX.Element;
  onClick?: () => void;
}

const SummaryItemShortCut: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const customTheme = useTheme();
  const webuiNavigate = useWebUINavigate();
  const [items] = useState<itemProps[]>([
    {
      id: 'systemSetting',
      title: t('summary.ChangeSystemSetting'),
      content: t('summary.ChangeSystemSettingDescription'),
      icon: (
        <SettingOutlined
          style={{
            fontSize: token.fontSizeHeading3,
            color: token.colorTextDescription,
          }}
        />
      ),
      onClick: () => {
        webuiNavigate('/settings');
      },
    },
    {
      id: 'userSetting',
      title: t('summary.ChangeUserSetting'),
      content: t('summary.ChangeUserSettingDescription'),
      icon: (
        <SettingOutlined
          style={{
            fontSize: token.fontSizeHeading3,
            color: token.colorTextDescription,
          }}
        />
      ),
      onClick: () => {
        webuiNavigate('/usersettings');
      },
    },
    {
      id: 'checkResources',
      title: t('summary.CheckResources'),
      content: t('summary.CheckResourcesDescription'),
      icon: (
        <InboxOutlined
          style={{
            fontSize: token.fontSizeHeading3,
            color: token.colorTextDescription,
          }}
        />
      ),
      onClick: () => {
        webuiNavigate('/agent');
      },
    },
    {
      id: 'manageEnvironment',
      title: t('summary.ManageEnvironment'),
      content: t('summary.ManageEnvironmentDescription'),
      icon: (
        <FileOutlined
          style={{
            fontSize: token.fontSizeHeading3,
            color: token.colorTextDescription,
          }}
        />
      ),
      onClick: () => {
        webuiNavigate('/environment');
      },
    },
    {
      id: 'maintenance',
      title: t('summary.Maintenance'),
      content: t('summary.MaintenanceDescription'),
      icon: (
        <ToolOutlined
          style={{
            fontSize: token.fontSizeHeading3,
            color: token.colorTextDescription,
          }}
        />
      ),
      onClick: () => {
        webuiNavigate('/maintenance');
      },
    },
  ]);
  const [chunkSize, setChunkSize] = useState<number>(2);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const updateImageSize = () => {
      const containerWidth = container.clientWidth;

      if (containerWidth <= customTheme.containerWidthMD) {
        setChunkSize(1);
      } else if (containerWidth <= customTheme.containerWidthLG) {
        setChunkSize(2);
      } else {
        setChunkSize(3);
      }
    };
    const resizeObserver = new ResizeObserver(() => {
      updateImageSize();
    });
    resizeObserver.observe(container);
    updateImageSize();

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex ref={containerRef} direction="column" gap={'xl'}>
      {_.chunk(items, chunkSize).map((row, index) => (
        <Flex
          key={index}
          gap={'sm'}
          justify="between"
          style={{ width: '100%' }}
        >
          {_.map(row, (item, index) => (
            <Flex
              key={index}
              gap={'sm'}
              style={{
                flex: 1,
                cursor: 'pointer',
              }}
              onClick={item.onClick}
            >
              {item.icon}
              <Flex direction="column" align="start" style={{ flex: 1 }}>
                <Typography.Text style={{ fontSize: token.fontSize }}>
                  {item.title}
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: token.fontSizeSM,
                    color: token.colorTextSecondary,
                  }}
                >
                  {item.content}
                </Typography.Text>
              </Flex>
            </Flex>
          ))}
          {_.times(chunkSize - row.length, (emptyIndex) => (
            <Flex key={emptyIndex} style={{ flex: 1 }}>
              {/* Empty box for maintaining layout consistency */}
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  );
};

export default SummaryItemShortCut;
