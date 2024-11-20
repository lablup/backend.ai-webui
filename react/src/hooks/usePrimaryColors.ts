import { theme } from 'antd';
import { useMemo } from 'react';

const usePrimaryColors = () => {
  const { token } = theme.useToken();
  const customColors = useMemo(() => {
    return {
      primary: token.colorPrimary,
      secondary: token.colorSuccess,
      admin: token.colorInfo,
    };
  }, [token]);
  return customColors;
};

export default usePrimaryColors;
