import { useBAIi18n } from '../hooks/useBAIi18n';
import { useState } from 'react';

const BAITestButton = () => {
  const { t } = useBAIi18n();

  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {t('comp:BAITestButton.Test')} {count}
    </button>
  );
};

export default BAITestButton;
