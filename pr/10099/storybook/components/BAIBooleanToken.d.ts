import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIBooleanTokenProps {
    /** Non-boolean values render `fallback`. */
    value: boolean | null | undefined;
    trueLabel?: string;
    falseLabel?: string;
    fallback?: React.ReactNode;
}
/**
 * An on/off setting as a Token (ADR 0007): green for true, the quiet default
 * outline for false, and `fallback` when the value is not a boolean.
 */
declare const BAIBooleanToken: React.FC<BAIBooleanTokenProps>;
export default BAIBooleanToken;
