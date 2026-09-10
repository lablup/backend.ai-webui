import { ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * Flatten a `ReactNode` into the plain string Astryx wants for `label`.
 * Returns `''` when the node carries no text (icon-only content) — the caller
 * decides what to do with that, and MUST NOT pass an empty name to a control
 * whose only affordance is the icon (P8).
 */
export declare const nodeToAccessibleLabel: (node: ReactNode) => string;
/**
 * `nodeToAccessibleLabel` with a fallback chain — the shape every frontier
 * wrapper needs: prefer an explicit `aria-label`/`title` the call site already
 * wrote, then the rendered text, then a caller-supplied default.
 */
export declare const resolveAccessibleLabel: (...candidates: Array<ReactNode | undefined>) => string;
