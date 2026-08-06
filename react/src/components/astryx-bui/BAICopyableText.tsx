/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PHASE 5 — one of the two `smallPrimitives` survivors of the
 "Astryx-direct unless it adds functionality" audit.

 **Why it survives:** it adds *behaviour* — click-to-copy against
 `navigator.clipboard` with a copied-state affordance. Astryx `Text` has no
 `copyable` counterpart, so this is not a styling wrapper.

 **Props extend Astryx's**, not antd's: `TextProps` minus the slots this
 component owns. There is no `copyable`-shaped antd ghost in the signature.
*/
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import type { TextProps } from '@astryxdesign/core/Text';
import { CheckIcon, CopyIcon } from 'lucide-react';
import React, { useState } from 'react';

export interface BAICopyableTextProps extends Omit<TextProps, 'children'> {
  /** The value copied to the clipboard. Rendered as the visible text. */
  children: string;
  /** Accessible name for the copy control. */
  copyLabel?: string;
}

const BAICopyableText: React.FC<BAICopyableTextProps> = ({
  children,
  copyLabel = 'Copy',
  ...textProps
}) => {
  'use memo';
  const [copied, setCopied] = useState(false);
  return (
    <HStack gap={1} align="center">
      <Text {...textProps}>{children}</Text>
      {copied ? (
        <CheckIcon size={14} style={{ flexShrink: 0 }} aria-hidden />
      ) : (
        <CopyIcon
          size={14}
          role="button"
          tabIndex={0}
          aria-label={copyLabel}
          style={{ cursor: 'pointer', flexShrink: 0 }}
          onClick={() => {
            void navigator.clipboard?.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        />
      )}
    </HStack>
  );
};

export default BAICopyableText;
