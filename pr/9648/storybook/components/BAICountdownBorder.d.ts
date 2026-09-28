import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAICountdownBorderProps {
    /** Content to wrap; the countdown border is drawn around it. */
    children?: React.ReactNode;
    /** Duration (ms) of one full clockwise fill cycle. */
    durationMs: number;
    /** Whether the fill animation runs (and the border is drawn). Defaults to `true`. */
    animated?: boolean;
    /** Class name applied to the wrapper element. */
    className?: string;
    /**
     * Changing this value restarts the fill animation from the beginning, right
     * on this render — instead of drifting on its own `animation-iteration-count:
     * infinite` schedule. Pass the same trigger that causes the real refresh
     * (e.g. a fetch-key bump) so the visual countdown never diverges from it.
     */
    resetKey?: React.Key;
    /**
     * When true, freezes the fill animation (`animation-play-state: paused`) and
     * hides the border entirely (`visibility: hidden`) instead of advancing. Use
     * it while the wrapped control's refresh is in flight, so no stale countdown
     * is visible before the real refresh happens.
     */
    paused?: boolean;
    /**
     * Style for the wrapper element. The border's own appearance is taken from
     * the same object via standard CSS properties:
     * - `stroke` — border color (default `var(--color-accent)`, so it follows the
     *   accent of whichever Astryx theme subtree the border is rendered in)
     * - `strokeWidth` — border thickness (default `1.5`)
     * - `borderRadius` — corner radius (default the `borderRadius` token)
     */
    style?: React.CSSProperties;
}
/**
 * Wraps its children with a rounded-rect border that fills clockwise (top-left →
 * top-right → bottom-right → bottom-left → back) over `durationMs`, resetting
 * each cycle — a countdown progress border. Used like antd's `BorderBeam`:
 *
 * ```tsx
 * <BAICountdownBorder durationMs={5000} style={{ stroke: 'var(--color-error)' }}>
 *   <SomeControl />
 * </BAICountdownBorder>
 * ```
 *
 * The wrapper measures its own box so the outline matches the content at any
 * size; the stroke is centered on the content's border line so it hugs the edge
 * and stays visible over opaque children. Respects `prefers-reduced-motion`.
 */
declare const BAICountdownBorder: React.FC<BAICountdownBorderProps>;
export default BAICountdownBorder;
