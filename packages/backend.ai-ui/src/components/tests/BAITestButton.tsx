import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BAITestButton = () => {
  const { t } = useTranslation();

  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {t('comp:BAITestButton.Test')} {count}
    </button>
  );
};

export default BAITestButton;
