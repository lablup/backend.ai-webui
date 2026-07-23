/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { generate } from '@ant-design/colors';
import { theme } from 'antd';
import { useMemo } from 'react';

const usePrimaryColors = () => {
  const { token } = theme.useToken();
  const customColors = useMemo(() => {
    const primaryPalette = generate(token.colorPrimary);

    return {
      primary: token.colorPrimary,
      secondary: token.colorSuccess,
      admin: token.colorInfo,
      // Primary color palette like token.blue0 ~ token.blue10
      primary1: primaryPalette[0],
      primary2: primaryPalette[1],
      primary3: primaryPalette[2],
      primary4: primaryPalette[3],
      primary5: primaryPalette[4],
      primary6: primaryPalette[5], // This is the main primary color
      primary7: primaryPalette[6],
      primary8: primaryPalette[7],
      primary9: primaryPalette[8],
      primary10: primaryPalette[9],
    };
  }, [token]);
  return customColors;
};

export default usePrimaryColors;
