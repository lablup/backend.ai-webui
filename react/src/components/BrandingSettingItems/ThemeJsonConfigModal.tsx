import BAICodeEditor from '../BAICodeEditor';
import { ExportOutlined } from '@ant-design/icons';
import { Alert, App, theme } from 'antd';
import { useThemeMode } from 'antd-style';
import { BAIButton, BAIModal, BAIModalProps } from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { downloadBlob } from 'src/helper/csv-util';
import { useUserCustomThemeConfig } from 'src/helper/customThemeConfig';

interface ThemeJsonConfigModalProps extends BAIModalProps {}

const ThemeJsonConfigModal: React.FC<ThemeJsonConfigModalProps> = ({
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { isDarkMode } = useThemeMode();
  const { userCustomThemeConfig } = useUserCustomThemeConfig();

  return (
    <BAIModal
      title={t('theme.ThemeJsonConfiguration')}
      {...modalProps}
      width={800}
      footer={
        <>
          {/* TODO: https://lablup.atlassian.net/browse/FR-1866 */}
          {/* <BAIButton icon={<ImportOutlined />}>
            {t('theme.button.ImportFromJson')}
          </BAIButton> */}
          <BAIButton
            type="primary"
            icon={<ExportOutlined />}
            action={async () => {
              if (_.isEmpty(userCustomThemeConfig)) {
                message.error(t('userSettings.theme.NoChangesMade'));
                return;
              }
              const blob = new Blob(
                [JSON.stringify(userCustomThemeConfig, null, 2)],
                { type: 'application/json' },
              );
              downloadBlob(blob, `theme.json`);
            }}
          >
            {t('theme.button.ExportToJson')}
          </BAIButton>
        </>
      }
    >
      <Alert
        description={t('theme.ThemeJsonConfigurationDesc')}
        showIcon
        style={{ marginBottom: token.marginMD }}
      />
      <BAICodeEditor
        editable={false}
        value={JSON.stringify(userCustomThemeConfig, null, 2)}
        language={'json'}
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </BAIModal>
  );
};

export default ThemeJsonConfigModal;
