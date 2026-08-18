/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIButton` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

 FRONTIER COMPONENT. 81 call sites in 20 files, plus six components that
 declare `interface XProps extends BAIButtonProps` and spread the bag straight
 through (`SFTPServerButton[V2]`, `FileBrowserButton[V2]`,
 `SwitchToProjectButton`, `ImportArtifactRevisionToFolderButton`,
 `BAIArtifactRevision{Delete,Download}Button`, `FileItemControls`). Per the
 frontier rule the public prop surface stays antd `Button`-SHAPED so none of
 them change; only the internals move to Astryx, and `ButtonProps` is replaced
 by a locally-declared interface so this module — the #5 taint hub at 576
 files — drops out of the antd import graph (P15).

 Split (MAPPING §3.3):

   `icon` and no children     -> `IconButton` (icon-only row action)
   everything else            -> `Button`

   `type="primary"`           -> `variant="primary"`
   `type="text" | "link"`     -> `variant="ghost"`
   `type="default"` / absent  -> `variant="secondary"`
   `danger`                   -> `variant="destructive"` (wins over `type`)
   `size: small|middle|large` -> `sm|md|lg`
   `loading`                  -> `isLoading`
   `disabled`                 -> `isDisabled`
   `block`                    -> `width="100%"`
   `title`                    -> `tooltip`
   `children`                 -> `children` + a flattened `label`

 PILOT-DECISION — **`action` becomes `clickAction`, and the hand-rolled
 transition is deleted.** SKILL.md calls this out explicitly: "`clickAction` is
 a native match for `BAIButton.action`". The old body was `useTransition` + an
 `isRunningRef` re-entrancy guard + `loading={isPending || props.loading}`;
 Astryx's `clickAction` shows the spinner while the returned promise is
 pending, sets `aria-busy`, and dedupes re-clicks itself. 18 `action` call
 sites keep working with strictly better a11y (antd announced nothing).

 PILOT-DECISION — **`type="link"` renders a ghost Button, not `Link`.**
 MAPPING §3.3 routes `type="link"` to Astryx `Link`, which is anchor-first. The
 three `type="link"` sites here (`SwitchToProjectButton`, `RoleDetail*`) are
 pure-`onClick` router/mutation actions with no `href` — no `BAIButton` call
 site in the repo passes `href` at all — so `Link` would mean a
 destination-less `<a>`, exactly what D3 rejected for `BAILink`. `ghost` keeps
 button semantics and the low-emphasis look. Amended by FR-3524: the element
 choice stands, but the paint comes from the theme's `variant:link` custom
 variant (`backendAiTheme.ts`), which also drops the hover box and the control
 box. Icon-only `type="link"` stays on `ghost` + `.bai-action-accent`, whose
 square hit target the inline footprint would collapse.

 PILOT-DECISION — **`type="dashed"` (5 sites) becomes `variant="secondary"`.**
 MAPPING §3.3: "no equivalent -> `variant="secondary"`, record the decision".
 The dashed border was antd's "add another one of these" affordance; Astryx's
 closed variant enum cannot express a border style (P5), and the five sites all
 sit next to a `+` icon that carries the same meaning.

 PILOT-DECISION — **icon-only buttons fall back to a generic accessible name,
 and the real copy is queued.** 46 of the 168 call sites are icon-only and only
 7 of those carry an `aria-label` or `title`, so ~39 icon-only buttons have NO
 accessible name under antd — a screen reader announces "button". Astryx makes
 `label` required, and SKILL.md is explicit that "a wrapper can only supply a
 placeholder". So the resolution order is `children` text -> `aria-label` ->
 `title` -> `general.button.Action`. The placeholder is deliberately visible in
 an accessibility audit rather than silently empty; naming each of those ~39
 controls is per-surface copywriting (P8) and is queued for REMAINDER.md, not
 guessed here.

 PILOT-DECISION — **antd's `ghost`, `shape`, `htmlType` and `iconPosition` are
 not in the surface.** No call site in the repo passes any of them to
 `BAIButton` (measured across 168 sites in 72 files), and each is either a
 closed-enum loss (P5, `ghost` / `shape="circle"`) or expressible another way
 (`htmlType` -> Astryx's `type`, which IS the HTML button type). Declaring
 props nothing passes would invite call sites that then break.
*/
import { nodeToAccessibleLabel } from '../helper/astryxLabel';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import React from 'react';
import type { ReactNode } from 'react';

/** antd `Button` `type`, kept verbatim for the call sites. */
export type BAIButtonType = 'primary' | 'default' | 'text' | 'link' | 'dashed';
/** antd `SizeType`, kept verbatim for the call sites. */
export type BAIButtonSize = 'small' | 'middle' | 'large';

export interface BAIButtonProps extends Omit<
  React.HTMLAttributes<HTMLButtonElement>,
  'title' | 'color' | 'children'
> {
  /**
   * antd rendered this as the native `title` tooltip; Astryx has a real
   * `tooltip` prop, which is where it now goes.
   */
  title?: string;
  /** antd emphasis axis. See the PILOT-DECISIONs above for the mapping. */
  type?: BAIButtonType;
  size?: BAIButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  /** antd full-width button. */
  block?: boolean;
  /**
   * antd v6's emphasis axis (`filled | outlined | solid | dashed | text |
   * link`). One live call site (`VFolderSelect`) uses `variant="text"`; it is
   * folded into the same variant resolution as `type`.
   */
  variant?: 'filled' | 'outlined' | 'solid' | 'dashed' | 'text' | 'link';
  /**
   * antd v6's colour axis (`default | primary | danger | blue | purple | …`),
   * which pairs with `variant`. Two values are load-bearing: `danger` resolves
   * to `variant="destructive"` (identical to the `danger` boolean), and
   * `default` opts a `type`/`variant="link"` button out of the accent tint.
   * Every other value is accepted and ignored — Astryx `Button` has a closed
   * 4-value `variant` enum with no colour slot (P5), so there is no hue to map
   * them onto.
   */
  color?: string;
  /**
   * Async click handler. Renders a spinner while the returned promise is
   * pending and ignores re-clicks until it settles.
   */
  action?: () => Promise<void>;
  children?: ReactNode;
  /** `data-testid` and friends — Astryx spreads them onto the root element. */
  [key: `data-${string}`]: string | undefined;
}

const SIZE_MAP: Record<BAIButtonSize, 'sm' | 'md' | 'lg'> = {
  small: 'sm',
  middle: 'md',
  large: 'lg',
};

const BAIButton: React.FC<BAIButtonProps> = ({
  action,
  type,
  size,
  icon,
  loading,
  disabled,
  danger,
  block,
  color: antdColor,
  variant: antdVariant,
  children,
  onClick,
  title,
  style,
  className,
  ...restProps
}) => {
  const emphasis = type ?? antdVariant;
  const isDanger = danger || antdColor === 'danger';
  const isIconOnly = !!icon && (children === undefined || children === null);

  // FR-3524: a link action must read as one. `color="default"` opts out.
  const isLinkTinted =
    !isDanger && emphasis === 'link' && antdColor !== 'default';
  // Icon-only keeps `ghost` + the class: the theme variant strips padding and
  // the control height, which would shrink a square hit target to its glyph.
  const useLinkVariant = isLinkTinted && !isIconOnly;

  const variant = isDanger
    ? 'destructive'
    : emphasis === 'primary' || emphasis === 'solid'
      ? 'primary'
      : useLinkVariant
        ? 'link'
        : emphasis === 'text' || emphasis === 'link'
          ? 'ghost'
          : 'secondary';

  const resolvedClassName =
    [
      className,
      isLinkTinted && !useLinkVariant ? 'bai-action-accent' : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const { t } = useBAIi18n();
  // antd allowed an icon-only button with NO accessible name at all; Astryx
  // requires one (P8). Prefer whatever name the call site already wrote
  // (`aria-label`, then `title`, which antd rendered as the native tooltip),
  // then the button's own text, and only then the generic placeholder.
  const label =
    nodeToAccessibleLabel(children) ||
    (restProps['aria-label'] ?? '') ||
    (typeof title === 'string' ? title : '') ||
    (isIconOnly ? t('general.button.Action') : '');

  const shared = {
    ...restProps,
    className: resolvedClassName,
    variant,
    size: size ? SIZE_MAP[size] : undefined,
    isLoading: loading,
    isDisabled: disabled,
    tooltip: typeof title === 'string' ? title : undefined,
    onClick,
    clickAction: action,
    style,
  } as const;

  // Icon-only row action -> the dedicated component (MAPPING §3.3).
  if (isIconOnly) {
    return <IconButton {...shared} icon={icon} label={label} />;
  }

  return (
    <Button
      {...shared}
      icon={icon}
      label={label}
      width={block ? '100%' : undefined}
    >
      {children}
    </Button>
  );
};

export default BAIButton;
