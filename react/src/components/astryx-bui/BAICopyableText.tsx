/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Click-to-copy text (imported from the pilot; to-astryx ticket 08).

 **Why it exists as a component:** it adds *behaviour* — click-to-copy against
 `navigator.clipboard` with a copied-state affordance. Astryx `Text` has no
 `copyable` counterpart, so this is not a styling wrapper.

 **Props extend Astryx's**, not antd's: `TextProps` minus the slots this
 component owns. There is no `copyable`-shaped antd ghost in the signature.

 TICKET-08 FOLLOW-UP (from the pilot's link-styling sweep): the copy glyph
 used to be a bare `<svg role="button" tabIndex={0}>` — interactive, but with
 no hover surface and no focus ring. It is a button, so it is now an Astryx
 `IconButton` (`variant="ghost" size="sm"`). The copied state swaps the icon
 in place and disables re-entry for the reset window instead of removing the
 control from the tab order. PILOT-DECISION: this grows the hit box from the
 bare 14px glyph to the `sm` control box — accepted; the a11y affordance is
 the point, and pixel equality with the old render is a non-goal.
*/
import { IconButton } from '@astryxdesign/core/IconButton';
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
  /**
   * Copy THIS string instead of the visible `children` — antd's
   * `copyable={{ text }}` shape (a truncated display whose copy target is the
   * full value). Defaults to `children`.
   */
  copyText?: string;
}

const BAICopyableText: React.FC<BAICopyableTextProps> = ({
  children,
  copyLabel = 'Copy',
  copyText,
  ...textProps
}) => {
  'use memo';
  const [copied, setCopied] = useState(false);
  return (
    <HStack gap={1} align="center">
      <Text {...textProps}>{children}</Text>
      <IconButton
        variant="ghost"
        size="sm"
        icon={copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
        label={copyLabel}
        tooltip={copyLabel}
        isDisabled={copied}
        onClick={() => {
          void navigator.clipboard?.writeText(copyText ?? children);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      />
    </HStack>
  );
};

export default BAICopyableText;
