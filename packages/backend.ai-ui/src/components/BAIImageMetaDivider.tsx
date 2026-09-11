import { theme } from '../theme-shim';
import { Divider } from '@astryxdesign/core/Divider';
import React from 'react';

/**
 * The separator between the parts of an image meta row (ADR 0004).
 *
 * Astryx's vertical `Divider` is `height: 100%`, which a centered flex row
 * collapses to 0; these are antd's metrics, shared by every image meta row.
 */
const BAIImageMetaDivider: React.FC = () => {
  'use memo';
  const { token } = theme.useToken();
  return (
    <Divider
      orientation="vertical"
      style={{
        alignSelf: 'center',
        height: '0.9em',
        marginInline: token.marginXXS,
      }}
    />
  );
};

export default BAIImageMetaDivider;
