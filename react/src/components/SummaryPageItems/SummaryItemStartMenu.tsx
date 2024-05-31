import { useWebUINavigate } from '../../hooks';
import Flex from '../Flex';
import { PoweroffOutlined } from '@ant-design/icons';
import { Button, Typography, theme } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StartMenuProps {
  deactivate?: boolean;
  allowNeoSessionLauncher?: boolean;
}

export const SummaryItemStartMenu: React.FC<StartMenuProps> = ({
  deactivate,
  allowNeoSessionLauncher,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgSize, setImgSize] = useState<number>(400);

  // useEffect(() => {
  //   const updateImageSize = () => {
  //     if (!containerRef.current) {
  //       return;
  //     }
  //     const containerHeight = containerRef.current.clientHeight;
  //     console.log(containerHeight);
  //   };
  // }, []);

  return (
    <Flex direction="column" justify="around" style={{ height: '100%' }}>
      <img
        src="/resources/images/launcher-background.png"
        alt="launcher background"
        style={{ width: 400, marginBottom: token.marginMD }}
      />
      <Flex direction="column" style={{ width: '100%' }}>
        <Button
          type="primary"
          disabled={deactivate}
          onClick={() =>
            allowNeoSessionLauncher
              ? webuiNavigate('/session/start')
              : webuiNavigate('/job')
          }
          size="large"
          style={{
            width: 'inherit',
            textTransform: 'uppercase',
            fontSize: token.fontSizeSM,
          }}
          icon={<PoweroffOutlined />}
        >
          {t('session.launcher.Start')}
        </Button>
        <Flex
          style={{
            width: 'inherit',
            marginTop: token.marginMD,
            alignItems: 'start',
            cursor: 'pointer',
          }}
        >
          <Flex
            direction="column"
            style={{
              flex: 1,
            }}
            onClick={() => webuiNavigate('/data')}
          >
            <img
              alt="upload_files"
              src="/resources/menu_icons/icon_upload_files.svg"
              style={{
                width: token.controlHeightSM,
                height: token.controlHeightSM,
                margin: token.marginSM,
                filter: 'invert(0.5)',
              }}
            />
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {t('summary.UploadFiles')}
            </Typography.Text>
          </Flex>
          <Flex
            direction="column"
            style={{
              flex: 1,
              borderRight: `1px solid ${token.colorBorder}`,
              borderLeft: `1px solid ${token.colorBorder}`,
            }}
            onClick={() => {
              webuiNavigate({
                pathname: '/credential',
                search: '?action=add',
              });
            }}
          >
            <img
              alt="upload_files"
              src="/resources/menu_icons/icon_create_a_key_pair.svg"
              style={{
                width: token.controlHeightSM,
                height: token.controlHeightSM,
                margin: token.marginSM,
                filter: 'invert(0.5)',
              }}
            />
            <Typography.Text
              type="secondary"
              style={{
                fontSize: token.fontSizeSM,
                textAlign: 'center',
              }}
            >
              {t('summary.CreateANewKeypair')}
            </Typography.Text>
          </Flex>
          <Flex
            direction="column"
            style={{ flex: 1 }}
            onClick={() => {
              webuiNavigate({
                pathname: '/credential',
                search: '?action=manage',
              });
            }}
          >
            <img
              alt="upload_files"
              src="/resources/menu_icons/icon_keypair_management.svg"
              style={{
                width: token.controlHeightSM,
                height: token.controlHeightSM,
                margin: token.marginSM,
                filter: 'invert(0.5)',
              }}
            />
            <Typography.Text
              type="secondary"
              style={{
                fontSize: token.fontSizeSM,
                textAlign: 'center',
              }}
            >
              {t('summary.MaintainKeypairs')}
            </Typography.Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default SummaryItemStartMenu;
