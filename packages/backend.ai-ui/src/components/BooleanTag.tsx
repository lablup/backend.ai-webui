/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BooleanTag` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

 antd `Tag` -> Astryx `Badge` (MAPPING §3.5: not closable, so the `Badge`
 branch). `color="green"` goes through the repo-global lookup
 (`helper/astryxTagVariant`), never a local colour map.
*/
import { badgeVariantForTagColor } from '../helper/astryxTagVariant';
import { Badge } from '@astryxdesign/core/Badge';
import React from 'react';

/**
 * Renders a colored tag representing a boolean value with customizable labels and fallback content.
 *
 * @param value - The boolean value to display; non-boolean values render the fallback.
 * @param trueLabel - Optional label shown when the value is true, defaults to `True`.
 * @param falseLabel - Optional label shown when the value is false, defaults to `False`.
 * @param fallback - Optional node rendered when the value is not a boolean, defaults to `-`.
 * @returns A green badge for true, a de-emphasised neutral badge for false, or the fallback node otherwise.
 */
const BooleanTag: React.FC<{
  value: boolean | null | undefined;
  trueLabel?: string;
  falseLabel?: string;
  fallback?: React.ReactNode;
}> = ({ value, fallback = '-', trueLabel = 'True', falseLabel = 'False' }) => {
  if (typeof value !== 'boolean') {
    return fallback;
  }
  return value ? (
    <Badge variant={badgeVariantForTagColor('green')} label={trueLabel} />
  ) : (
    // The 50% opacity is carried over verbatim: it is a pure de-emphasis, not
    // a colour override, so it survives Astryx's closed variant enum (P5).
    <Badge variant="neutral" label={falseLabel} style={{ opacity: 0.5 }} />
  );
};

export default BooleanTag;
