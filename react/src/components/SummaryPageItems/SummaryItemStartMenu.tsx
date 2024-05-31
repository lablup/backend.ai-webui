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
type ImageSize = 'NONE' | 'SM' | 'MD' | 'LG';

export const SummaryItemStartMenu: React.FC<StartMenuProps> = ({
  deactivate,
  allowNeoSessionLauncher,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgSize, setImgSize] = useState<ImageSize>('LG');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const updateImageSize = () => {
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;
      if (containerHeight <= 180) {
        setImgSize('NONE');
      } else if (containerHeight <= 300) {
        setImgSize('SM');
      } else if (containerHeight <= 420) {
        setImgSize('MD');
      } else {
        if (containerWidth <= 272) {
          setImgSize('MD');
          return;
        }
        setImgSize('LG');
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
  }, []);

  return (
    <Flex
      ref={containerRef}
      direction="column"
      justify="around"
      style={{ height: '100%' }}
    >
      <img
        src="/resources/images/launcher-background.png"
        alt="launcher background"
        style={{
          width: imgSize === 'LG' ? 400 : imgSize === 'MD' ? 250 : 0,
          marginBottom: token.marginMD,
          display: imgSize === 'NONE' ? 'none' : 'block',
        }}
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
            marginTop: imgSize === 'NONE' ? 0 : token.marginMD,
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
