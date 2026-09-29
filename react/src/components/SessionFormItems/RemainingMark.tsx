/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex } from 'backend.ai-ui';
import { ChevronDown } from 'lucide-react';
import React from 'react';

const RemainingMark: React.FC = () => {
  const { token } = useTheme();
  return (
    <BAIFlex
      style={{
        position: 'absolute',
        top: -24,
        transform: 'translateX(-50%)',
        color: token('--color-success'),
        opacity: 0.5,
      }}
    >
      <ChevronDown size="1em" />
    </BAIFlex>
  );
};

export default RemainingMark;
