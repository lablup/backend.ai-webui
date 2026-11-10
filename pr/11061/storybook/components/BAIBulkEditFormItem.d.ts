import { FormItemProps, RuleObject, RuleRender } from '../form-engine';
import { default as React, ReactElement } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * Rule type without the 'required' property.
 * Uses distributive conditional types to properly omit 'required' from union type.
 * - RuleObject: Object-based validation rules (removes 'required' property)
 * - RuleRender: Function-based validation rules (kept as-is since it has no 'required')
 */
type RuleWithoutRequired = Omit<RuleObject, 'required'> | RuleRender;
export interface BAIBulkEditFormItemProps extends Omit<FormItemProps, 'required' | 'rules'> {
    /**
     * Whether this field is optional (allows clearing).
     * When true, shows the "Clear" link in keep mode.
     */
    showClear?: boolean;
    /**
     * The label to display in the placeholder when in keep mode.
     * If not provided, defaults to i18n 'comp:BAIBulkEditFormItem.KeepAsIs'.
     */
    keepValueLabel?: string;
    /**
     * The label to display in the placeholder when in clear mode.
     * If not provided, defaults to i18n 'comp:BAIBulkEditFormItem.Clear'.
     */
    clearValueLabel?: string;
    /**
     * Children element to render (typically an input component like Select, Input, etc.)
     */
    children?: ReactElement;
    /**
     * Validation rules for the form item.
     * Note: 'required' property is excluded as bulk edit handles required state internally.
     */
    rules?: RuleWithoutRequired[];
}
/**
 * BAIBulkEditFormItem is a custom Form.Item component designed for bulk editing scenarios.
 *
 * ## Features
 * - **Keep as is**: Maintains current values without changes (default state, value = undefined)
 * - **Edit**: Allows user to modify the field value
 * - **Clear**: Shows placeholder with clearValueLabel (only available when showClear is true)
 * - **Undo changes**: Reverts to "Keep as is" state (appears when not in keep mode)
 *
 * ## Usage
 * ```tsx
 * <BAIBulkEditFormItem
 *   name="domain_name"
 *   label="Domain"
 *   showClear
 *   clearValueLabel="No domain"
 * >
 *   <BAISelect options={[...]} />
 * </BAIBulkEditFormItem>
 * ```
 */
declare const BAIBulkEditFormItem: React.FC<BAIBulkEditFormItemProps>;
export default BAIBulkEditFormItem;
