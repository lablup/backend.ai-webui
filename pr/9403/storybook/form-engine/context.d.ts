import { FieldData, FormInstance, InternalFormInstance, InternalHooks, Meta, ScrollOptions, ValidateMessages } from './interface';
import { InternalNamePath } from './namePath';
import * as React from 'react';
/** Guard for `getInternalHooks`; keeps the engine-private API out of reach. */
export declare const HOOK_MARK = "BAI_FORM_INTERNAL_HOOKS";
/**
 * Carries the live `FormInstance` down to every `Field`. Also carries
 * `prefixName`, which is what makes `Form.List` children address their fields
 * RELATIVELY while `dependencies` and `useWatch` stay ABSOLUTE — the
 * asymmetry called out as acceptance test 10.
 */
export declare const FieldContext: React.Context<InternalFormInstance>;
export interface ListContextValue {
    /** Map an absolute field path to `[stableKey, restPath]` for the row it belongs to. */
    getKey: (namePath: InternalNamePath) => [React.Key, InternalNamePath];
}
export declare const ListContext: React.Context<ListContextValue | null>;
export interface FormProviderContextValue {
    validateMessages?: ValidateMessages;
    triggerFormChange: (name: string | undefined, changedFields: FieldData[]) => void;
    triggerFormFinish: (name: string | undefined, values: any) => void;
    registerForm: (name: string | undefined, form: FormInstance) => void;
    unregisterForm: (name: string | undefined) => void;
}
export declare const FormProviderContext: React.Context<FormProviderContextValue>;
export type RequiredMark = boolean | 'optional' | ((label: React.ReactNode, info: {
    required: boolean;
}) => React.ReactNode);
export interface FormConfig {
    /**
     * Locale-aware message templates, `${label}`-based. `FormConfigProvider`
     * defaults them to BUI's own localized table (ticket 35); the engine's
     * built-in defaults use `${name}` and only apply when nothing is provided
     * at all (tests, Storybook, a `<Form>` with no provider above it).
     */
    validateMessages?: ValidateMessages;
    requiredMark?: RequiredMark;
    /**
     * The suffix `requiredMark="optional"` appends (5 call sites). antd read it
     * from `locale.Form.optional`; `FormConfigProvider` defaults it to BUI's own
     * `form.Optional` catalog entry, ported from the same antd strings.
     */
    optionalLabel?: React.ReactNode;
    /**
     * Turns scroll-to-first-error on for every form below. Off unless set —
     * antd's `<Form scrollToFirstError>` default, kept so a consumer without
     * this provider gets antd's behaviour (FR-3683).
     */
    scrollToFirstError?: boolean | ScrollOptions;
}
/** What antd sourced from `<ConfigProvider form={{...}}>`. */
export declare const FormConfigContext: React.Context<FormConfig>;
/**
 * What antd carries on its own `FormContext` — the per-form visual settings a
 * `Form.Item` inherits unless it states its own. Everything here is a real
 * `<Form>` prop with a call site in this repo (confirmed by a call-site
 * census during the FR-3482 Astryx migration); the ones with none
 * (`feedbackIcons`, `classNames`, `styles`, `variant`) are deliberately absent.
 */
export interface FormItemLayoutContextValue {
    form?: FormInstance;
    layout: FormLayout;
    requiredMark?: RequiredMark;
    disabled?: boolean;
    name?: string;
    size?: FormSize;
    colon?: boolean;
    labelAlign?: 'left' | 'right';
    labelCol?: FormItemCol;
    wrapperCol?: FormItemCol;
    labelWrap?: boolean;
}
export type FormLayout = 'vertical' | 'horizontal' | 'inline';
export type FormSize = 'small' | 'middle' | 'large';
/** antd `Col` props, reduced to the shapes this repo's call sites use. */
export interface FormItemCol {
    span?: number;
    offset?: number;
    flex?: string | number;
    className?: string;
    style?: React.CSSProperties;
}
export declare const FormItemLayoutContext: React.Context<FormItemLayoutContextValue>;
export interface FormItemStatusContextValue {
    status?: 'success' | 'warning' | 'error' | 'validating' | '';
    errors?: React.ReactNode[];
    warnings?: React.ReactNode[];
    hasFeedback?: boolean;
    isFormItemInput?: boolean;
}
/** Read by `Form.Item.useStatus()` and by BAIFormItem's bridge. */
export declare const FormItemInputContext: React.Context<FormItemStatusContextValue>;
export type SubItemMeta = Partial<Meta> & {
    name: InternalNamePath;
    destroy?: boolean;
};
/**
 * How a rendering `Form.Item` collects the errors of the `noStyle` items
 * nested inside it. 25 layout-only items in this repo depend on it; without
 * it their children's messages vanish (answers/08 §3).
 */
export declare const NoStyleItemContext: React.Context<((meta: SubItemMeta, uniqueKeys: React.Key[]) => void) | null>;
/**
 * A wrapper-less `noStyle` field registers its handle with the nearest item
 * that renders a wrapper, which publishes it as `data-bai-field-items` so
 * `FormStore.getFieldDOMNode` can still reach the field. Returns the
 * unregister function.
 */
export declare const SubFieldRegistryContext: React.Context<((handle: string) => () => void) | null>;
export type { InternalHooks };
