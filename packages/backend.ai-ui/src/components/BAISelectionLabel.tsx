/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAISelectionLabel` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

 This is the BUI original of the component the pilot rebuilt as
 `react/src/components/astryx-bui/BAISelectionLabel.tsx` (ticket 08). It now
 renders the same way — `HStack` + `Text` + an `IconButton` clear control — and
 keeps its existing prop surface (`count`, `onClearSelection`) so its consumers
 do not change.

 PILOT-DECISION (inherited from ticket 08, restated because it lands here too):
 **the clear-selection ✕ becomes a real button.** It used to be a bare
 `<svg role="button" tabIndex={0}>` — interactive, but with no hover surface
 and no focus ring — wrapped in an antd `Tooltip` that supplied the name. As an
 Astryx `IconButton variant="ghost" size="sm"` it owns its own label, tooltip
 and focus ring. This grows the hit box from the bare 16px glyph to the `sm`
 control box; accepted, the a11y affordance is the point.

 The `color: token.colorTextSecondary` tint goes with the theme-shim
 `useToken()` call: `IconButton`'s ghost variant is already the muted treatment
 and Astryx exposes no `color` slot (P5).
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { CircleXIcon } from 'lucide-react';
import React from 'react';

export interface BAISelectionLabelProps {
  count: number;
  onClearSelection?: () => void;
}

const BAISelectionLabel: React.FC<BAISelectionLabelProps> = ({
  count,
  onClearSelection,
}) => {
  'use memo';

  const { t } = useBAIi18n();

  if (count <= 0) return null;

  return (
    <HStack gap={1} align="center">
      <Text>{t('general.NSelected', { count })}</Text>
      {onClearSelection && (
        <IconButton
          variant="ghost"
          size="sm"
          icon={<CircleXIcon />}
          label={t('general.DeselectAll')}
          tooltip={t('general.DeselectAll')}
          onClick={onClearSelection}
        />
      )}
    </HStack>
  );
};

export default BAISelectionLabel;
