import { useTranslation } from 'react-i18next';

const BAITestButton = () => {
  const { t } = useTranslation();
  return <button type="button">{t('test.button')}</button>;
};

export default BAITestButton;
