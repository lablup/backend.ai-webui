import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * Renders a colored tag representing a boolean value with customizable labels and fallback content.
 *
 * @param value - The boolean value to display; non-boolean values render the fallback.
 * @param trueLabel - Optional label shown when the value is true, defaults to `True`.
 * @param falseLabel - Optional label shown when the value is false, defaults to `False`.
 * @param fallback - Optional node rendered when the value is not a boolean, defaults to `-`.
 * @returns A green badge for true, a de-emphasised neutral badge for false, or the fallback node otherwise.
 */
declare const BooleanTag: React.FC<{
    value: boolean | null | undefined;
    trueLabel?: string;
    falseLabel?: string;
    fallback?: React.ReactNode;
}>;
export default BooleanTag;
