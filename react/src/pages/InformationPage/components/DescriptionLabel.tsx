/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { newLineToBrElement } from '../../../helper';
import { BAIQuestionIconWithTooltip } from 'backend.ai-ui';
import React from 'react';

const DescriptionLabel: React.FC<{
  subtitle?: string | null;
}> = ({ subtitle }) => {
  if (!subtitle) return null;
  return <BAIQuestionIconWithTooltip title={newLineToBrElement(subtitle)} />;
};

export default DescriptionLabel;
