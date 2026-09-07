import { SizeValue } from '@astryxdesign/core/utils';
import { default as React, CSSProperties } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface AstryxFormTextInputProps {
    /** Injected by `Form.Item`. */
    value?: string;
    /** Injected by `Form.Item`. */
    onChange?: (value: string) => void;
    /** Accessible name. Visually hidden — the `Form.Item` renders the visible one. */
    label: string;
    type?: 'text' | 'password' | 'email';
    placeholder?: string;
    disabled?: boolean;
    hasAutoFocus?: boolean;
    hasClear?: boolean;
    status?: 'error' | 'warning' | '';
    width?: SizeValue;
    style?: CSSProperties;
    [key: `data-${string}`]: string | undefined;
}
export declare const AstryxFormTextInput: React.FC<AstryxFormTextInputProps>;
export interface AstryxFormTextAreaProps {
    value?: string;
    onChange?: (value: string) => void;
    label: string;
    /** antd `Input.TextArea rows`. */
    rows?: number;
    placeholder?: string;
    disabled?: boolean;
    width?: SizeValue;
    [key: `data-${string}`]: string | undefined;
}
export declare const AstryxFormTextArea: React.FC<AstryxFormTextAreaProps>;
/**
 * Mirrors the host adapter of the same name
 * (`react/src/components/astryxFormControls.tsx`) — see the file header for why
 * the two exist side by side. Kept to the surface BUI actually needs: no
 * `isLoading` / `onValueChange` until a BUI call site wants them.
 */
export interface AstryxFormSwitchProps {
    /** Injected by `Form.Item` (default `valuePropName`, i.e. `value`). */
    value?: boolean;
    /** Injected by `Form.Item valuePropName="checked"`. */
    checked?: boolean;
    onChange?: (value: boolean) => void;
    label: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
    [key: `data-${string}`]: string | undefined;
}
export declare const AstryxFormSwitch: React.FC<AstryxFormSwitchProps>;
/**
 * Mirrors the host adapter of the same name
 * (`react/src/components/astryxFormControls.tsx`), minus its `onValueChange`
 * escape hatch — no BUI call site needs one yet.
 */
export interface AstryxFormCheckboxProps {
    /** Injected by `Form.Item` (default `valuePropName`, i.e. `value`). */
    value?: boolean;
    /** Injected by `Form.Item valuePropName="checked"`. */
    checked?: boolean;
    onChange?: (value: boolean) => void;
    label: string;
    /** Opt out of the inline label when the `Form.Item` already renders one. */
    isLabelHidden?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md';
    [key: `data-${string}`]: string | undefined;
}
export declare const AstryxFormCheckbox: React.FC<AstryxFormCheckboxProps>;
export interface AstryxFormNumberInputProps {
    value?: number | null;
    onChange?: (value: number | null) => void;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    /**
     * antd `InputNumber suffix` — a unit string. MAPPING §3.17 calls Astryx's
     * `units` "genuinely better than antd's suffix slot", so a non-string suffix
     * is not accepted here.
     */
    units?: string;
    placeholder?: string;
    disabled?: boolean;
    width?: SizeValue;
    [key: `data-${string}`]: string | undefined;
}
export declare const AstryxFormNumberInput: React.FC<AstryxFormNumberInputProps>;
