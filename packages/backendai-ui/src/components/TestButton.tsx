import { useTranslation } from 'react-i18next';

const TestButton = () => {
  const { t } = useTranslation();
  return <button type="button">{t('userSettings.Language')}</button>;
};

export default TestButton;
