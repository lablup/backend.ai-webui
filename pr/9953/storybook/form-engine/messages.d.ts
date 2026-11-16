import { ValidateMessages } from './interface';
export declare const defaultValidateMessages: ValidateMessages;
/**
 * Shallow-per-section merge, matching async-validator's `deepMerge`: a
 * provided `types` object is spread over the default `types` object rather
 * than replacing it, so a locale that only translates `required` keeps the
 * English type templates instead of losing them.
 */
export declare function mergeValidateMessages(...sources: (ValidateMessages | undefined | null)[]): ValidateMessages;
