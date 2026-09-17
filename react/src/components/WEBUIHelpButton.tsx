/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useOpenHelp } from '../hooks/useHelpURL';
import { IconButton } from '@astryxdesign/core/IconButton';
import { CircleHelp } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// PILOT-DECISION: antd `Button type="text" icon href target="_blank"` →
// Astryx `IconButton variant="ghost"` + `window.open` (MAPPING §3.3).
// `IconButton` has no `href` (it renders a <button>), and MAPPING's `href`
// branch (`Link`) would drop the header's icon-button chrome. The anchor
// affordances (middle-click, "copy link address") are lost; the click
// behaviour and the new-tab target are identical.
// P1 grep: the only consumer (WebUIHeader) passes `data-testid` alone.
interface WEBUIHelpButtonProps {
  'data-testid'?: string;
}
const WEBUIHelpButton: React.FC<WEBUIHelpButtonProps> = ({ ...props }) => {
  'use memo';
  const { t } = useTranslation();
  const openHelp = useOpenHelp();

  return (
    <IconButton
      variant="ghost"
      label={t('webui.menu.Help')}
      icon={<CircleHelp size="1em" />}
      onClick={openHelp}
      {...props}
    />
  );
};

export default WEBUIHelpButton;
