/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Bulk-selection summary label (imported from the pilot; to-astryx ticket 08).

 **Why it exists as a component:** it is a stateful affordance, not a style —
 it renders nothing below a count of 1, pluralises through i18n, and owns the
 clear-selection control. Astryx has no bulk-selection summary component.

 **Props are Astryx-idiomatic**: `isDisabled`, `onClearSelection`, and a
 `size` drawn from Astryx's scale — no antd prop shapes anywhere.

 TICKET-08 FOLLOW-UP (from the pilot's link-styling sweep): the clear-selection
 ✕ used to be a bare `<svg role="button" tabIndex={0}>` — interactive, but with
 no hover surface and no focus ring. It is a button, so it is now an Astryx
 `IconButton` (`variant="ghost" size="sm"`, built-in tooltip). PILOT-DECISION:
 this grows the control's hit box from the bare 16px glyph to the `sm` control
 box — accepted; the a11y affordance is the point, and pixel equality with the
 old render is a non-goal.
*/
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { CircleXIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface BAISelectionLabelProps {
  count: number;
  onClearSelection?: () => void;
  isDisabled?: boolean;
  size?: 'sm' | 'md';
}

const BAISelectionLabel: React.FC<BAISelectionLabelProps> = ({
  count,
  onClearSelection,
  isDisabled,
  size = 'md',
}) => {
  'use memo';
  const { t } = useTranslation();
  if (count <= 0) return null;
  return (
    <HStack gap={1} align="center">
      <Text type={size === 'sm' ? 'supporting' : 'body'}>
        {t('general.NSelected', { count })}
      </Text>
      {onClearSelection && !isDisabled ? (
        <IconButton
          variant="ghost"
          size="sm"
          icon={<CircleXIcon />}
          label={t('general.DeselectAll')}
          tooltip={t('general.DeselectAll')}
          onClick={onClearSelection}
        />
      ) : null}
    </HStack>
  );
};

export default BAISelectionLabel;
