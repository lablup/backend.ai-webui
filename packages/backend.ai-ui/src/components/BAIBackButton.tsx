/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIBackButton` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

 antd `Button type="text" icon` -> Astryx `IconButton variant="ghost"`
 (MAPPING §3.3: `icon` present and no children is the IconButton branch).

 PILOT-DECISION — **the button gains a real accessible name (P8).** The antd
 original was an icon-only `<button>` with no `aria-label`, no `title` and no
 text: a screen reader announced nothing at all. Astryx requires `label`, so it
 now carries the translated "Back" and the same string as the hover tooltip.
 The public prop surface (`to`, `options`) is unchanged.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import { IconButton } from '@astryxdesign/core/IconButton';
import { ArrowLeft } from 'lucide-react';
import { NavigateOptions, To, useNavigate } from 'react-router-dom';

export interface BAIBackButtonProps {
  to: To;
  options?: NavigateOptions;
}

const BAIBackButton = ({ to, options }: BAIBackButtonProps) => {
  const navigate = useNavigate();
  const { t } = useBAIi18n();
  const label = t('general.button.Back');
  return (
    <IconButton
      variant="ghost"
      label={label}
      tooltip={label}
      icon={<ArrowLeft size={18} />}
      onClick={() => navigate(to, options)}
    />
  );
};

export default BAIBackButton;
