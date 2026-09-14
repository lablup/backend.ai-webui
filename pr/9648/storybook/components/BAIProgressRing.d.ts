import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * Shortest arc the determinate ring ever draws, in percent. An empty ring is
 * a bare track, which hides the rotation that says the work is still moving.
 */
export declare const BAI_PROGRESS_RING_MIN_VISIBLE_PERCENT = 8;
/**
 * Longest arc the determinate ring ever draws, in percent. The bound is
 * geometry, not taste: `stroke-linecap: round` grows the arc by
 * `strokeWidth / 2` at each end, so at the default stroke 86% leaves
 * `37.7 - 0.86 * 37.7 - 2` = 3.3 user units open — a gap, not a seam.
 */
export declare const BAI_PROGRESS_RING_MAX_VISIBLE_PERCENT = 86;
export interface BAIProgressRingProps extends Omit<React.SVGProps<SVGSVGElement>, 'children' | 'rotate'> {
    /**
     * Completion in percent, clamped to 0..100. Leave it out (or pass a
     * non-finite number) for the indeterminate ring — a short arc spinning at
     * the same 1s as the `.bai-icon-spin` glyph.
     *
     * The value reported to assistive technology is this one. The arc that gets
     * DRAWN is additionally pinned into
     * `BAI_PROGRESS_RING_MIN_VISIBLE_PERCENT..BAI_PROGRESS_RING_MAX_VISIBLE_PERCENT`,
     * so it never reaches empty or full and the slow rotation stays visible at
     * both ends; everything between the two bounds is drawn honestly.
     */
    percent?: number;
    /**
     * Rendered size of the square the ring is drawn in. The default follows the
     * font size, so the ring lines up with the text of whatever carries it.
     * @default '1em'
     */
    size?: string | number;
    /**
     * Stroke width of both circles, in user units of the 16-unit viewBox. The
     * radius follows it, so the stroke always stays inside the box.
     * @default 2
     */
    strokeWidth?: number;
    /**
     * Whether the determinate ring keeps turning slowly (~2.4s per turn) so it
     * still reads as "in progress" between two updates. The indeterminate ring
     * always spins — the spin is the only thing it has to say.
     * @default true
     */
    rotate?: boolean;
}
/**
 * A progress ring sized to be used as an icon — the `icon` slot of an Astryx
 * `Badge`, next to a label, inside a button. Both circles are stroked with
 * `currentColor`, so the ring takes the colour of whatever carries it.
 *
 * ```tsx
 * <Badge variant="warning" icon={<BAIProgressRing percent={99} />} label="TERMINATING" />
 * <Badge variant="warning" icon={<BAIProgressRing />} label="TERMINATING" />
 * ```
 *
 * With a `percent` it is a `progressbar` to assistive technology; without one
 * it is decorative (`aria-hidden`) unless an `aria-label` names it. The
 * reported value is the true one; the drawn arc never reaches empty or full,
 * so the ring keeps reading as "in progress" at 0% and at 100%.
 */
declare const BAIProgressRing: React.FC<BAIProgressRingProps>;
export default BAIProgressRing;
