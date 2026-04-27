/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Skeleton } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';

const AutoScalingRulePresetTab: React.FC = () => {
  'use memo';
  // Placeholder for the Prometheus Query Preset admin CRUD tab (FR-2451).
  // Subsequent PRs in the stack will replace this with a real list, create modal,
  // edit modal with live preview, and delete flow.
  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <Skeleton active />
    </BAIFlex>
  );
};

export default AutoScalingRulePresetTab;
