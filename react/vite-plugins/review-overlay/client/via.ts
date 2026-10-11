/**
 * The three kinds of `via` step (FR-4103) and the words each one carries, so
 * no caller has to switch on the union's keys itself.
 */
import type { AnchorVia } from './types.js';

export type ViaKind = 'click' | 'fill' | 'select';

export const viaKind = (step: AnchorVia): ViaKind =>
  'fill' in step ? 'fill' : 'select' in step ? 'select' : 'click';

/** The testid of the step's control, whatever the kind. */
export const viaTid = (step: AnchorVia): string | undefined =>
  'fill' in step
    ? step.fill.tid
    : 'select' in step
      ? step.select.tid
      : step.click.tid;

/** The words that name the control: a button's text, a field's label. */
export const viaLabel = (step: AnchorVia): string | undefined =>
  'fill' in step
    ? step.fill.label
    : 'select' in step
      ? step.select.label
      : step.click.text;

/**
 * The base steps in the reader's words: a translated step of the same kind
 * lends its labels, option or value; the base keeps the testid it omits.
 */
export function mergeVia(
  base: readonly AnchorVia[] = [],
  said?: readonly AnchorVia[],
): AnchorVia[] {
  return base.map((step, i) => {
    const other = said?.[i];
    if (!other) return step;
    if ('fill' in step && 'fill' in other)
      return { fill: { ...step.fill, ...other.fill } };
    if ('select' in step && 'select' in other)
      return { select: { ...step.select, ...other.select } };
    if ('click' in step && 'click' in other)
      return { click: { ...step.click, ...other.click } };
    return step;
  });
}
