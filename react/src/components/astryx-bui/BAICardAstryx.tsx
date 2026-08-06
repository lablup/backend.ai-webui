/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 2 (cn-oss-removal / ticket 10) — local Astryx-backed `BAICard`.

 antd's `Card` is a container WITH a header contract (`title`, `extra`,
 `tabList`, `styles.header` / `styles.body`, `variant="borderless"`).
 Astryx's `Card` is a bare surface — background variant, padding, elevation,
 and nothing else. So the header is composed here from `HStack` + `Heading`.

 PILOT-DECISIONs recorded:
 - `styles={{ header, body }}` (the project's `.claude/rules/use-bai-card.md`
   convention is `body.paddingTop: 0`) has NO Astryx equivalent — the card owns
   one uniform `padding` step. The flush-to-header look is reproduced by
   composing the header inside the card's padding box instead, and the `styles`
   prop is accepted-and-ignored so call sites keep compiling.
 - `variant="borderless"` has no counterpart; Astryx cards are always bordered
   at `elevation="none"`. Mapped to `variant="transparent"` which drops the
   background but keeps the border.
 - `status` (success/error/warning border tint, used elsewhere in the app) is
   NOT implemented here — this page does not use it. A full BUI rebuild needs
   it via a theme override, since Astryx exposes no border-colour prop.
*/
import { Card } from '@astryxdesign/core/Card';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Heading } from '@astryxdesign/core/Text';
import React from 'react';

export interface BAICardAstryxProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  variant?: 'borderless' | 'outlined';
  /** Accepted and ignored — see the note above. */
  styles?: Record<string, React.CSSProperties>;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

const BAICardAstryx: React.FC<BAICardAstryxProps> = ({
  title,
  extra,
  variant,
  style,
  className,
  children,
}) => {
  'use memo';
  return (
    <Card
      variant={variant === 'borderless' ? 'transparent' : 'default'}
      padding={4}
      style={style}
      className={className}
    >
      <VStack gap={2} align="stretch">
        {title || extra ? (
          <HStack justify="between" align="center" wrap="wrap" gap={2}>
            {typeof title === 'string' ? (
              <Heading level={3}>{title}</Heading>
            ) : (
              title
            )}
            {extra}
          </HStack>
        ) : null}
        {children}
      </VStack>
    </Card>
  );
};

export default BAICardAstryx;
