import { useSessionStorageState } from 'ahooks';
import { BAIAlert, BAIAlertProps } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

interface ThemePreviewModeAlertProps extends BAIAlertProps {}

const ThemePreviewModeAlert: React.FC<ThemePreviewModeAlertProps> = () => {
  const { t } = useTranslation();
  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  return isThemePreviewMode ? (
    <BAIAlert showIcon type="warning" title={t('theme.PreviewModeAlert')} />
  ) : null;
};

export default ThemePreviewModeAlert;
