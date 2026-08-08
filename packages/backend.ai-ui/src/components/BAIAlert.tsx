/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIAlert` on Astryx (to-astryx phase 3, ticket A).

 FRONTIER COMPONENT — antd `Alert`'s prop names stay on the surface so the 18
 call sites in 15 files (plus `BAIListAlert`) do not change; internally it is
 an Astryx `Banner` (MAPPING §4, `Alert -> Banner`):

   `type`        -> `status`   (info | warning | error | success — all four ✅)
   `title`       -> `title`    (antd v6 name; `message` is antd's deprecated
                                alias and is accepted here for the 2 sites
                                that still pass it)
   `description` -> `description`
   `closable`    -> `isDismissable` (+ `onClose` -> `onDismiss`)
   `banner`      -> `container="section"`
   `action`      -> `endContent`  (the established Banner idiom on this branch)
   `showIcon`    -> DROPPED — Banner always shows the status icon
   `icon`        -> `icon` (Banner does allow the override)

 Banner keeps its DEFAULT Astryx style (standing decision on this branch): the
 `bai-alert*` re-theme is gone, and with it the whole of `BAIAlert.css`.

 PILOT-DECISION — `ghostInfoBg`. The prop repainted an `info` alert with the
 plain surface background + a neutral border instead of antd's blue tint (one
 live call site, `BAIProjectBulkEditModal`, passes `false` to opt OUT).
 Astryx `Banner` owns its header colour per `status` and exposes no knob, so
 the prop is now a NO-OP kept only for source compatibility. Reproducing it
 would be a per-component CSS block fighting `astryx-base` on the one status
 that already reads as the quietest of the four.

 PILOT-DECISION — `description={description || ' '}`. The old wrapper injected
 a blank description to force antd's two-line "NEO" layout. Banner lays out
 title/description natively, so the hack is dropped; a description-only call
 site (`<BAIAlert description={…} />`, no title) promotes its description into
 the required `title` slot rather than rendering an empty header.
*/
import { Banner } from '@astryxdesign/core/Banner';
import React from 'react';
import type { ReactNode } from 'react';

export interface BAIAlertProps {
  /** antd `Alert.type`. Defaults to `info`, as antd did. */
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: ReactNode;
  /** antd's deprecated alias for `title`. */
  message?: ReactNode;
  description?: ReactNode;
  /** antd rendered the status icon only on request; Banner always does. */
  showIcon?: boolean;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
  /** antd's full-width, square-cornered page banner. */
  banner?: boolean;
  action?: ReactNode;
  /** No-op since the Astryx conversion — see the PILOT-DECISION above. */
  ghostInfoBg?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  'data-testid'?: string;
}

const BAIAlert: React.FC<BAIAlertProps> = ({
  type = 'info',
  title,
  message,
  description,
  showIcon: _showIcon,
  icon,
  closable,
  onClose,
  banner,
  action,
  ghostInfoBg: _ghostInfoBg,
  children,
  ...restProps
}) => {
  const resolvedTitle = title ?? message;
  const hasTitle = resolvedTitle !== undefined && resolvedTitle !== null;

  return (
    <Banner
      {...restProps}
      status={type}
      title={hasTitle ? resolvedTitle : description}
      description={hasTitle ? description : undefined}
      icon={icon}
      isDismissable={closable}
      onDismiss={onClose}
      container={banner ? 'section' : 'card'}
      endContent={action}
    >
      {children}
    </Banner>
  );
};

export default BAIAlert;
