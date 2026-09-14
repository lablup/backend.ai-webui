import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * The percent range the determinate ring is allowed to DRAW. Both bounds fall
 * out of the geometry `strokeWidth` fixes — the radius, hence the
 * circumference, and the `strokeWidth` the two round caps add to the arc and
 * take out of the gap — so they hold at any stroke: 7.96%..86.74% at the
 * default 2, 0%..57.6% at 5. Only the drawn arc is bounded; `aria-valuenow`
 * always carries the true percent.
 */
export declare const getVisibleArcRange: (strokeWidth: number) => {
    min: number;
    max: number;
};
export interface BAIProgressRingProps extends Omit<React.SVGProps<SVGSVGElement>, 'children' | 'rotate'> {
    /**
     * Completion in percent, clamped to 0..100. Leave it out (or pass a
     * non-finite number) for the indeterminate ring — a short arc spinning at
     * the same 1s as the `.bai-icon-spin` glyph.
     *
     * The value reported to assistive technology is this one. The arc that gets
     * DRAWN is additionally pinned into `getVisibleArcRange(strokeWidth)`, so it
     * never reaches empty or full and the slow rotation stays visible at both
     * ends; everything between the two bounds is drawn honestly.
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
 * reported value is the true one; the drawn arc never reaches empty or full —
 * `getVisibleArcRange` derives both bounds from `strokeWidth` — so the ring
 * keeps reading as "in progress" at 0% and at 100%, at any stroke.
 */
declare const BAIProgressRing: React.FC<BAIProgressRingProps>;
export default BAIProgressRing;
