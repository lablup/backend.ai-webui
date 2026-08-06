/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 2 (cn-oss-removal / ticket 10) — local Astryx-backed `BAIButton`.

 The cleanest 1:1 in the whole migration: BUI's `action` prop (run an async fn,
 auto-manage the loading state) is EXACTLY Astryx's native `clickAction`. BUI
 hand-rolls that with a `useState` + try/finally; Astryx ships it.

 Prop mapping:
   type="primary"  -> variant="primary"
   danger          -> variant="destructive"
   (default)       -> variant="secondary"
   loading         -> isLoading
   disabled        -> isDisabled
   action          -> clickAction
   children        -> label (string) or children + derived label

 PILOT-DECISION: Astryx `Button.label` is a REQUIRED string used as the
 accessible name. Icon-only buttons (`<BAIButton icon={<X/>} />`, common in this
 page's toolbar) previously had NO accessible name at all — antd allowed it.
 Here they must gain one, so the wrapper derives it from `title`/`aria-label`
 and falls back to a generic string. That is an a11y IMPROVEMENT that Astryx
 forces, but it means every icon-only call site needs a real label written by a
 human; the fallback is a placeholder, not an answer.
*/
import { Button } from '@astryxdesign/core/Button';
import React from 'react';

export interface BAIButtonAstryxProps {
  type?: 'primary' | 'default' | 'text' | 'link';
  danger?: boolean;
  size?: 'small' | 'middle' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  /** Async action; loading state is managed by Astryx natively. */
  action?: () => Promise<void>;
  children?: React.ReactNode;
  title?: string;
  'aria-label'?: string;
  'data-testid'?: string;
  style?: React.CSSProperties;
  className?: string;
}

const SIZE_MAP = {
  small: 'sm',
  middle: 'md',
  large: 'lg',
} as const;

function deriveLabel(props: BAIButtonAstryxProps): string {
  if (typeof props.children === 'string') return props.children;
  if (props['aria-label']) return props['aria-label'];
  if (props.title) return props.title;
  // See the PILOT-DECISION note above.
  return 'Action';
}

const BAIButtonAstryx: React.FC<BAIButtonAstryxProps> = (props) => {
  'use memo';
  const {
    type,
    danger,
    size = 'middle',
    icon,
    loading,
    disabled,
    onClick,
    action,
    children,
    title,
    style,
    className,
  } = props;

  const variant = danger
    ? ('destructive' as const)
    : type === 'primary'
      ? ('primary' as const)
      : type === 'text' || type === 'link'
        ? ('ghost' as const)
        : ('secondary' as const);

  const label = deriveLabel(props);
  const isIconOnly = !!icon && children == null;

  return (
    <Button
      label={label}
      variant={variant}
      size={SIZE_MAP[size]}
      icon={icon}
      isIconOnly={isIconOnly}
      isLoading={loading}
      isDisabled={disabled}
      tooltip={title}
      onClick={onClick}
      clickAction={action ? () => action() : undefined}
      style={style}
      className={className}
      {...({ 'data-testid': props['data-testid'] } as object)}
    >
      {/* When children is a non-string node, Astryx renders it in place of
          `label` while `label` still supplies the accessible name. */}
      {typeof children === 'string' ? undefined : children}
    </Button>
  );
};

export default BAIButtonAstryx;
