import {
  App,
  Image,
  Input,
  InputRef,
  Space,
  theme,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import { createStyles } from 'antd-style';
import { BAIButton, BAIFlex } from 'backend.ai-ui';
import { t } from 'i18next';
import _ from 'lodash';
import { CornerDownLeftIcon, ImagePlus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useCustomThemeConfig } from 'src/helper/customThemeConfig';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const useStyles = createStyles(({ css }) => ({
  upload: css`
    .ant-upload-list-item-thumbnail {
      &:hover {
        cursor: default;
      }
    }
  `,
}));

interface LogoPreviewerProps {
  mode: 'light' | 'dark' | 'lightCollapsed' | 'darkCollapsed';
}

const LogoPreviewer: React.FC<LogoPreviewerProps> = ({ mode }) => {
  'use memo';

  const { token } = theme.useToken();
  const { styles } = useStyles();
  const { message } = App.useApp();

  const themeConfig = useCustomThemeConfig();
  const [showEnterIcon, setShowEnterIcon] = useState(false);
  const [userCustomThemeConfig, setUserCustomThemeConfig] =
    useBAISettingUserState('custom_theme_config');
  const logoThemeKey = getLogoThemeKey(mode);
  const currentLogoPath = userCustomThemeConfig?.logo?.[logoThemeKey];

  const handlePathChange = (path: string) => {
    setUserCustomThemeConfig((prev) => ({
      ...themeConfig!,
      ...prev,
      logo: {
        ...themeConfig!.logo,
        ...prev?.logo,
        [getLogoThemeKey(mode)]: path,
      },
    }));
  };

  const inputRef = useRef<InputRef>(null);

  return (
    <BAIFlex gap="sm" align="stretch" direction="column">
      <BAIFlex gap="sm">
        <Typography.Text type="secondary" style={{ wordBreak: 'keep-all' }}>
          {t('userSettings.logo.ImagePath')}:
        </Typography.Text>
        <Space.Compact>
          <Input
            key={currentLogoPath} // to reset internal state when path changes externally
            ref={inputRef}
            defaultValue={currentLogoPath}
            onFocus={() => {
              setShowEnterIcon(true);
            }}
            onBlur={() => {
              setShowEnterIcon(false);
              handlePathChange(inputRef.current?.input?.value || '');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                inputRef.current?.blur();
              }
            }}
            suffix={
              <CornerDownLeftIcon
                style={{
                  fontSize: '0.8em',
                  color: token.colorTextTertiary,
                  visibility: showEnterIcon ? 'visible' : 'hidden',
                }}
              />
            }
          />
          <Tooltip title={t('userSettings.logo.CreateURLWithImage')}>
            <Upload
              className={styles.upload}
              listType="picture"
              type="select"
              accept="image/*"
              maxCount={1}
              showUploadList={false}
              beforeUpload={(file) => {
                if (file.size > MAX_FILE_SIZE) {
                  message.error(t('userSettings.logo.UploadFileSizeExceed'));
                  return false;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                  const base64 = e.target?.result as string;
                  handlePathChange(base64);
                };
                reader.onerror = () => {
                  message.error(t('userSettings.logo.FailedToReadFile'));
                };
                reader.readAsDataURL(file);

                return false;
              }}
              onRemove={() => {
                handlePathChange(themeConfig?.logo?.[logoThemeKey] || '');
              }}
              onPreview={() => false}
            >
              <BAIButton icon={<ImagePlus />} />
            </Upload>
          </Tooltip>
        </Space.Compact>
      </BAIFlex>
      <BAIFlex
        style={{
          background:
            'repeating-conic-gradient(#e0e0e0 0% 25%, #f5f5f5 0% 50%) 50% / 20px 20px',
        }}
        align="center"
        justify="center"
      >
        <Image
          preview={false}
          height={100}
          style={{ width: 'auto', maxWidth: 250 }}
          src={currentLogoPath}
          // empty image placeholder 1x1 pixel gif
          fallback="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default LogoPreviewer;

export const getLogoThemeKey = (mode: LogoPreviewerProps['mode']) => {
  switch (mode) {
    case 'light':
      return 'src';
    case 'dark':
      return 'srcDark';
    case 'lightCollapsed':
      return 'srcCollapsed';
    case 'darkCollapsed':
      return 'srcCollapsedDark';
  }
};
