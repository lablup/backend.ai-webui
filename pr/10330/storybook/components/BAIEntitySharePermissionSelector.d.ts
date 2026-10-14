import { FieldProps } from '@lablup/ui-common/Field';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** One `PermissionBit` of the manager's permission mask. */
export type BAIEntitySharePermissionBit = 'CREATE' | 'READ' | 'UPDATE' | 'SOFT_DELETE' | 'HARD_DELETE';
export type BAIEntitySharePermissionPreset = 'FULL_ACCESS' | 'READ_WRITE' | 'READ_ONLY';
/** A preset, or `CUSTOM` when the bits match none of them. */
export type BAIEntitySharePermissionChoice = BAIEntitySharePermissionPreset | 'CUSTOM';
/** The five bits, in the order the Custom flyout lists them. */
export declare const ENTITY_SHARE_PERMISSION_BITS: ReadonlyArray<BAIEntitySharePermissionBit>;
/** The presets in menu order, each with the bits it sends. */
export declare const ENTITY_SHARE_PERMISSION_PRESETS: ReadonlyArray<{
    key: BAIEntitySharePermissionPreset;
    bits: ReadonlyArray<BAIEntitySharePermissionBit>;
}>;
/** Drops unknown values and duplicates and puts the bits in flyout order. */
export declare const normalizeEntitySharePermissionBits: (bits: ReadonlyArray<string> | null | undefined) => Array<BAIEntitySharePermissionBit>;
/** The preset whose bits equal `bits` as a set, else `CUSTOM`. */
export declare const toEntitySharePermissionChoice: (bits: ReadonlyArray<string> | null | undefined) => BAIEntitySharePermissionChoice;
/**
 * The selector's own labels, for a caller that shows a share's cap elsewhere
 * (a table cell, a summary line) with the same words the menu uses.
 */
export declare const useEntitySharePermissionLabels: () => {
    choiceLabel: (choice: BAIEntitySharePermissionChoice) => string;
    bitLabel: (bit: BAIEntitySharePermissionBit) => string;
    /** "Read only", or the bits of a custom set: "Create, Read, Update". */
    summary: (bits: ReadonlyArray<string> | null | undefined) => string;
};
export interface BAIEntitySharePermissionSelectorProps extends Omit<FieldProps, 'children' | 'inputID' | 'labelID' | 'descriptionID' | 'isGroupLabel' | 'onChange'> {
    /** The bits the share is capped at. Omit it to let the selector keep them. */
    value?: ReadonlyArray<BAIEntitySharePermissionBit>;
    /** Initial bits when `value` is not controlled. */
    defaultValue?: ReadonlyArray<BAIEntitySharePermissionBit>;
    /** The new bits in flyout order, and the preset they match or `CUSTOM`. */
    onChange?: (bits: Array<BAIEntitySharePermissionBit>, choice: BAIEntitySharePermissionChoice) => void;
    size?: 'sm' | 'md' | 'lg';
    /** `secondary` is the bordered form trigger; `ghost` matches toolbar buttons. */
    variant?: 'secondary' | 'ghost';
    placement?: 'above' | 'below' | 'start' | 'end';
    alignment?: 'start' | 'center' | 'end';
    /** Minimum width of the menu; it still grows for its content. */
    menuWidth?: number | string;
    onOpenChange?: (isOpen: boolean) => void;
}
declare const BAIEntitySharePermissionSelector: React.FC<BAIEntitySharePermissionSelectorProps>;
export default BAIEntitySharePermissionSelector;
