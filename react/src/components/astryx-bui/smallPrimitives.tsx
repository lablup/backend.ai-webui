/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 2 (cn-oss-removal / ticket 10) — the small `backend.ai-ui`
 primitives the pilot page graph uses, rebuilt on Astryx. Grouped in one file
 because each is a handful of lines; `packages/backend.ai-ui` is untouched.
*/
import { Badge } from '@astryxdesign/core/Badge';
import { Link } from '@astryxdesign/core/Link';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { CircleXIcon, CopyIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/* ---------------------------------------------------------------- BAITag */

/**
 * antd `Tag` -> Astryx `Badge`.
 *
 * PILOT-DECISION: `BAITag` was an antd `Tag` re-themed via `ConfigProvider`
 * into a **transparent, outlined pill with grey text** — i.e. the project had
 * already fought antd's default filled tag into a different shape. Astryx's
 * `Badge` is filled-by-variant and exposes no background/border control, so
 * that hard-won look is NOT reproducible. The colour names map
 * (`warning`/`error`/`success`/`default`), the transparent treatment does not.
 */
const TAG_COLOR_TO_VARIANT: Record<
  string,
  'neutral' | 'info' | 'success' | 'warning' | 'error'
> = {
  warning: 'warning',
  error: 'error',
  success: 'success',
  info: 'info',
  default: 'neutral',
};

export const BAITag: React.FC<{
  color?: string;
  children?: React.ReactNode;
}> = ({ color, children }) => {
  'use memo';
  return (
    <Badge
      variant={(color && TAG_COLOR_TO_VARIANT[color]) || 'neutral'}
      label={children}
    />
  );
};

/* --------------------------------------------------------------- BAIText */

/**
 * `BAIText` is antd `Typography.Text` plus BUI conveniences. This page uses
 * exactly one of them: `copyable`.
 *
 * PILOT-DECISION: Astryx `Text` has NO `copyable` affordance — antd shipped a
 * click-to-copy icon with a "Copied" tooltip and an aria live announcement.
 * Reproduced minimally with a lucide icon + `navigator.clipboard`; the
 * copied-state tooltip swap and the live-region announcement are lost.
 */
export const BAIText: React.FC<{
  copyable?: boolean;
  children?: React.ReactNode;
}> = ({ copyable, children }) => {
  'use memo';
  if (!copyable) return <Text>{children}</Text>;
  return (
    <HStack gap={1} align="center">
      <Text>{children}</Text>
      <CopyIcon
        size={14}
        role="button"
        tabIndex={0}
        aria-label="Copy"
        style={{ cursor: 'pointer', flexShrink: 0 }}
        onClick={() => {
          void navigator.clipboard?.writeText(String(children ?? ''));
        }}
      />
    </HStack>
  );
};

/* --------------------------------------------------------------- BAILink */

/**
 * PILOT-DECISION: Astryx `Link` is anchor-first — it expects `href`. This call
 * site is a pure `onClick` router navigation with no URL, which Astryx's Link
 * models as `href="#"` + `onClick`. Semantically weaker than antd's
 * `Typography.Link`, but it keeps keyboard activation and link styling.
 */
export const BAILink: React.FC<{
  onClick?: () => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ onClick, style, children }) => {
  'use memo';
  return (
    <Link
      href="#"
      style={style}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </Link>
  );
};

/* ----------------------------------------------------- BAISelectionLabel */

export const BAISelectionLabel: React.FC<{
  count: number;
  onClearSelection?: () => void;
}> = ({ count, onClearSelection }) => {
  'use memo';
  const { t } = useTranslation();
  if (count <= 0) return null;
  return (
    <HStack gap={1} align="center">
      <Text>{t('general.NSelected', { count })}</Text>
      {onClearSelection ? (
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
