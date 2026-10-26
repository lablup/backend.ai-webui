import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** An option's disabled state; `{ reason }` also says why. */
export type BAIOptionDisabled = boolean | {
    reason: string;
};
export declare const getOptionDisabledReason: (disabled: BAIOptionDisabled | null | undefined) => string | undefined;
export interface BAIDisabledOptionReasonProps {
    reason: string;
}
/**
 * The glyph at the end of a disabled option whose tooltip says why it cannot
 * be picked. The row keeps its height, so a list with many disabled options
 * does not grow, and the reason names the glyph for screen readers.
 *
 * Props and usage: `BAIDisabledOptionReason.doc.ts`.
 */
declare const BAIDisabledOptionReason: React.FC<BAIDisabledOptionReasonProps>;
/**
 * Appends the reason glyph to `content` when `disabled` carries a reason, and
 * returns `content` untouched otherwise.
 */
export declare const withOptionDisabledReason: (content: React.ReactNode, disabled: BAIOptionDisabled | null | undefined) => React.ReactNode;
export default BAIDisabledOptionReason;
