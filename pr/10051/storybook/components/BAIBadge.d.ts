import { SemanticColor } from '../helper';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * Props interface for BAIBadge component.
 * antd `Badge`-shaped (frontier rule) with semantic color support.
 */
export interface BAIBadgeProps {
    /**
     * Semantic color of the badge dot.
     * Pass `undefined` when the status is unknown or indeterminate to render
     * an outline-only (border) dot instead of a filled dot.
     */
    color?: SemanticColor;
    /** When true, shows a processing (ripple) animation on the badge dot. */
    processing?: boolean;
    /** The visible label rendered beside the dot (antd `Badge.text`). */
    text?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    'data-testid'?: string;
}
/**
 * BAIBadge - Semantic color-coded status dot badge.
 *
 * Provides a consistent semantic color system (`success`, `info`, `warning`,
 * `error`, `default`). When `color` is omitted, renders a transparent dot with
 * a border to indicate an unknown or indeterminate status — see the
 * justification in `BAIBadge.css`.
 */
declare const BAIBadge: React.FC<BAIBadgeProps>;
export default BAIBadge;
