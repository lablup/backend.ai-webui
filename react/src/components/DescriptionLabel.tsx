/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIQuestionIconWithTooltipAstryx from './astryx-bui/BAIQuestionIconWithTooltipAstryx';
import React from 'react';

// PILOT-DECISION: antd's `Descriptions.Item label` took the whole
// title+subtitle block as a `ReactNode` (Information.tsx wrapped it in a
// `BAIFlex` column of two `Typography.Text`s). Astryx `MetadataListItem.label`
// is a required `string` (P2), so the title now goes there directly at the
// call site and this component narrows to just the subtitle — rendered as a
// help-tooltip icon on `MetadataListItem`'s `icon` slot (before the label,
// the nearest available position; antd rendered it below the title).
const DescriptionLabel: React.FC<{
  subtitle?: string | null;
}> = ({ subtitle }) => {
  if (!subtitle) return null;
  return <BAIQuestionIconWithTooltipAstryx title={subtitle} />;
};

export default DescriptionLabel;
