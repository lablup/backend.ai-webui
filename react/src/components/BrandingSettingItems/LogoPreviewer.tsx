import { App, Image, Space, Tooltip, Typography, Upload } from 'antd';
import { createStyles } from 'antd-style';
import { BAIButton, BAIFlex, BAIUncontrolledInput } from 'backend.ai-ui';
import { t } from 'i18next';
import _ from 'lodash';
import { ImagePlus } from 'lucide-react';
import { useUserCustomThemeConfig } from 'src/helper/customThemeConfig';

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

  const { styles } = useStyles();
  const { message } = App.useApp();

  const { themeConfig, getThemeValue, setUserCustomThemeConfig } =
    useUserCustomThemeConfig();
  const logoThemeKey = getLogoThemeKey(mode);
  const currentLogoPath = getThemeValue<string>(`logo.${logoThemeKey}`);

  return (
    <BAIFlex gap="sm" align="stretch" direction="column">
      <BAIFlex gap="sm">
        <Typography.Text type="secondary" style={{ wordBreak: 'keep-all' }}>
          {t('userSettings.logo.ImagePath')}:
        </Typography.Text>
        <Space.Compact>
          <BAIUncontrolledInput
            defaultValue={currentLogoPath}
            onCommit={(value) => {
              setUserCustomThemeConfig(`logo.${logoThemeKey}`, value);
            }}
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
                  setUserCustomThemeConfig(`logo.${logoThemeKey}`, base64);
                };
                reader.onerror = () => {
                  message.error(t('userSettings.logo.FailedToReadFile'));
                };
                reader.readAsDataURL(file);

                return false;
              }}
              onRemove={() => {
                setUserCustomThemeConfig(
                  `logo.${logoThemeKey}`,
                  themeConfig?.logo?.[logoThemeKey],
                );
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
