/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PHASE 5 — the second `smallPrimitives` survivor.

 **Why it survives:** it is a stateful affordance, not a style — it renders
 nothing below a count of 1, pluralises through i18n, and owns the
 clear-selection control. Astryx has no bulk-selection summary component.

 **Props are Astryx-idiomatic**: `isDisabled`, `onClearSelection`, and a
 `size` drawn from Astryx's scale — no antd prop shapes anywhere.
*/
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
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
        <Tooltip content={t('general.DeselectAll')}>
          <CircleXIcon
            size={16}
            tabIndex={0}
            role="button"
            aria-label={t('general.DeselectAll')}
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={onClearSelection}
          />
        </Tooltip>
      ) : null}
    </HStack>
  );
};

export default BAISelectionLabel;
