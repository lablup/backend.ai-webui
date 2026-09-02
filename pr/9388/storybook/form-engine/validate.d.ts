import { RuleObject, StoreValue, ValidateMessages } from './interface';
import { InternalNamePath, toArray } from './namePath';
/**
 * Validate one field's value against its rules.
 *
 * ALWAYS REJECTS in the default (parallel) mode — with a `RuleError[]` that
 * may well be empty. This is upstream's contract and both `Field` and
 * `FormStore` are written against it: the caller partitions the array into
 * errors and warnings by each rule's `warningOnly`, and an empty array means
 * "valid". `validateFirst === true` instead resolves `[]` on success.
 */
export declare function validateRules(namePath: InternalNamePath, value: StoreValue, rules: RuleObject[], messages: ValidateMessages, validateFirst?: boolean | 'parallel', messageVariables?: Record<string, string>): Promise<{
    errors: any[];
    rule: RuleObject;
}[]>;
export { toArray };
