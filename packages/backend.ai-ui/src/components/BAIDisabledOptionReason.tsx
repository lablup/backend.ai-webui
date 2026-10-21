/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './BAIDisabledOptionReason.css';
import BAIIconWithTooltip from './BAIIconWithTooltip';
import { CircleAlertIcon } from 'lucide-react';
import React from 'react';

/** An option's disabled state; `{ reason }` also says why. */
export type BAIOptionDisabled = boolean | { reason: string };

export const getOptionDisabledReason = (
  disabled: BAIOptionDisabled | null | undefined,
): string | undefined =>
  typeof disabled === 'object' && disabled ? disabled.reason : undefined;

export interface BAIDisabledOptionReasonProps {
  reason: string;
}

/**
 * The glyph at the end of a disabled option whose tooltip says why it cannot
 * be picked. The row keeps its height, so a list with many disabled options
 * does not grow, and the reason names the glyph for screen readers.
 *
 * Props and usage: `BAIDisabledOptionReason.doc.ts`.
 */
const BAIDisabledOptionReason: React.FC<BAIDisabledOptionReasonProps> = ({
  reason,
}) => {
  'use memo';
  return (
    <span className="bai-disabled-option-reason">
      <BAIIconWithTooltip
        content={reason}
        focusable={false}
        icon={<CircleAlertIcon size="1em" />}
      />
    </span>
  );
};

/**
 * Appends the reason glyph to `content` when `disabled` carries a reason, and
 * returns `content` untouched otherwise.
 */
export const withOptionDisabledReason = (
  content: React.ReactNode,
  disabled: BAIOptionDisabled | null | undefined,
): React.ReactNode => {
  const reason = getOptionDisabledReason(disabled);
  return reason ? (
    <span className="bai-disabled-option-reason__row">
      <span className="bai-disabled-option-reason__content">{content}</span>
      <BAIDisabledOptionReason reason={reason} />
    </span>
  ) : (
    content
  );
};

export default BAIDisabledOptionReason;
