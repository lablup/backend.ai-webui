/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAITag` on Astryx (to-astryx phase 3, ticket A).

 FRONTIER COMPONENT — the public surface stays antd `Tag`-shaped (`color`,
 `icon`, `closable`, `onClose`, `children`) so its consumers
 (`BAIDeploymentStatusTag`, `BAILoginHistoryTable`, `BAISessionNodesV2`) do not
 change. Internally it splits the way MAPPING §3.5 prescribes:

   `closable` / `onClose`  -> Astryx `Token` (`onRemove`, `label: string`)
   everything else         -> Astryx `Badge` (`variant`, `label: ReactNode`)

 `color` is routed through the repo-global lookup (`helper/astryxTagVariant`,
 ticket 13) — never a per-file colour map.

 PILOT-DECISION — the wrapper's entire reason for existing under antd was
 RE-THEMING antd's Tag: a `ConfigProvider` block that forced every background
 to `transparent`, pinned the text to `#999999` and the radius to 11px, plus
 `paddingInline: token.paddingSM`. That is the P5/P11 shape ("a wrapper that
 existed only to re-theme antd has nowhere to land"): Astryx `Badge`'s
 appearance is closed and theme-owned, and its semantic variants are
 deliberately solid. The transparent-outline look and the grey text are
 DROPPED; tags now render as Astryx badges. Reproducing them would mean a
 per-component CSS block that fights `astryx-base` on every variant, which the
 defaults-first policy rules out.

 PILOT-DECISION — `Token.label` is a required STRING while antd `Tag` took any
 node. Closable tags whose children are not a string render the node in
 `endContent` with an empty (screen-reader-hidden) label; no live call site
 does this today (all 8 `closable` sites are in the unit test).
*/
import {
  badgeVariantForTagColor,
  tokenColorForTagColor,
} from '../helper/astryxTagVariant';
import { Badge } from '@astryxdesign/core/Badge';
import { Token } from '@astryxdesign/core/Token';
import React from 'react';

export interface BAITagProps {
  /** antd `Tag` colour: status preset, palette preset, or a runtime string. */
  color?: string;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** antd v6 `variant` (`filled` | `outlined` | `solid`) — see PILOT-DECISION. */
  variant?: string;
  'data-testid'?: string;
}

const BAITag: React.FC<BAITagProps> = ({
  color,
  icon,
  closable,
  onClose,
  children,
  className,
  style,
  onClick,
  variant: _variant,
  ...restProps
}) => {
  if (closable) {
    const label =
      typeof children === 'string' || typeof children === 'number'
        ? String(children)
        : '';
    return (
      <Token
        {...restProps}
        className={className}
        color={tokenColorForTagColor(color)}
        icon={icon}
        label={label}
        isLabelHidden={label === ''}
        endContent={label === '' ? children : undefined}
        // Unconditional: antd rendered the X for `closable` whether or not an
        // `onClose` was supplied, and `Token` only renders it when `onRemove`
        // is present.
        onRemove={(e) => onClose?.(e as React.MouseEvent<HTMLElement>)}
        onClick={
          onClick
            ? (e) => onClick(e as React.MouseEvent<HTMLElement>)
            : undefined
        }
      />
    );
  }

  return (
    <Badge
      {...restProps}
      className={className}
      style={style}
      variant={badgeVariantForTagColor(color)}
      icon={icon}
      label={children}
      onClick={onClick}
    />
  );
};

export default BAITag;
