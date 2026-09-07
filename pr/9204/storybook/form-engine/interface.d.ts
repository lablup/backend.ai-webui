import { InternalNamePath, NamePath, Store } from './namePath';
import type * as React from 'react';
export type { NamePath, InternalNamePath, Store, NamePathSegment, } from './namePath';
export type StoreValue = any;
/** The five `type` values this repository actually uses (answers/08 §1.4). */
export type RuleType = 'string' | 'number' | 'email' | 'url' | 'object';
export type ValidatorRule = {
    warningOnly?: boolean;
    message?: React.ReactNode;
    validator: (rule: RuleObject, value: StoreValue, callback: (error?: string) => void) => Promise<void | any> | void;
};
export interface BaseRule {
    warningOnly?: boolean;
    /**
     * `undefined` means "generate the default message"; an EMPTY STRING means
     * "this rule intentionally shows no text". 9 call sites depend on the
     * distinction (answers/08 §1.4), so the engine must not treat `''` as absent.
     */
    message?: React.ReactNode;
    required?: boolean;
    type?: RuleType;
    max?: number;
    min?: number;
    pattern?: RegExp;
    whitespace?: boolean;
    /** Per-rule trigger filter; the field-level `validateTrigger` is the default. */
    validateTrigger?: string | string[];
}
export interface RuleObject extends BaseRule {
    validator?: ValidatorRule['validator'];
}
export type RuleRender = (form: FormInstance) => RuleObject;
export type Rule = RuleObject | RuleRender;
export interface FieldError {
    name: InternalNamePath;
    errors: string[];
    warnings: string[];
}
export interface Meta {
    touched: boolean;
    validating: boolean;
    errors: string[];
    warnings: string[];
    name: InternalNamePath;
    validated: boolean;
}
export interface FieldData extends Partial<Omit<Meta, 'name'>> {
    name: NamePath;
    value?: StoreValue;
}
export interface ValidateErrorEntity<Values = any> {
    values: Values;
    errorFields: {
        name: InternalNamePath;
        errors: string[];
    }[];
    outOfDate: boolean;
}
export interface ValidateOptions {
    triggerName?: string;
    validateMessages?: ValidateMessages;
    /** Also validate every field NESTED under a requested path. */
    recursive?: boolean;
    /** Only validate fields the user has touched / that have been validated. */
    dirty?: boolean;
    /**
     * Overrides `<Form scrollToFirstError>` for this call. Pass `false` from
     * validation that no user asked for (a mount effect, a revalidation on
     * value change) so the page does not jump under them.
     */
    scrollToFirstError?: boolean | ScrollOptions;
}
/**
 * A template is normally a `${label}`-style string, but antd's locale bundles
 * also allow a thunk (some locales build the sentence at call time). `format`
 * invokes the thunk; only strings go through `${}` substitution.
 */
export type ValidateMessage = string | (() => string);
type RangeMessages = {
    min?: ValidateMessage;
    max?: ValidateMessage;
    range?: ValidateMessage;
    len?: ValidateMessage;
};
export interface ValidateMessages {
    default?: ValidateMessage;
    required?: ValidateMessage;
    whitespace?: ValidateMessage;
    types?: Partial<Record<RuleType, ValidateMessage>>;
    string?: RangeMessages;
    number?: RangeMessages;
    array?: RangeMessages;
    pattern?: {
        mismatch?: ValidateMessage;
    };
    [key: string]: any;
}
export interface FormInstance<Values = any> {
    getFieldValue: (name: NamePath) => StoreValue;
    getFieldsValue: ((nameList?: NamePath[]) => Values) & ((nameList: true, filterFunc?: (meta: Meta) => boolean) => Values) & ((config: {
        strict?: boolean;
        filter?: (meta: Meta) => boolean;
    }) => Values);
    getFieldError: (name: NamePath) => string[];
    getFieldWarning: (name: NamePath) => string[];
    getFieldsError: (nameList?: NamePath[]) => FieldError[];
    isFieldsTouched: ((nameList?: NamePath[], allFieldsTouched?: boolean) => boolean) & ((allFieldsTouched?: boolean) => boolean);
    isFieldTouched: (name: NamePath) => boolean;
    isFieldValidating: (name: NamePath) => boolean;
    isFieldsValidating: (nameList?: NamePath[]) => boolean;
    resetFields: (fields?: NamePath[]) => void;
    setFields: (fields: FieldData[]) => void;
    setFieldValue: (name: NamePath, value: StoreValue) => void;
    setFieldsValue: (values: RecursivePartial<Values>) => void;
    validateFields: ValidateFields<Values>;
    submit: () => void;
    /** Thin implementation — see `FormStore.scrollToField` for the caveat. */
    scrollToField: (name: NamePath, options?: ScrollOptions) => void;
    /**
     * Scrolls the first currently-invalid field into view in DOM order and
     * focuses it. `validateFields()` calls this for you on a failed whole-form
     * validation; call it directly only for errors you set by hand through
     * `setFields`.
     */
    scrollToFirstError: (options?: ScrollOptions) => void;
    focusField: (name: NamePath) => void;
    getFieldInstance: (name: NamePath) => any;
}
export interface ScrollOptions extends ScrollIntoViewOptions {
    focus?: boolean;
}
export type RecursivePartial<T> = T extends object ? {
    [K in keyof T]?: RecursivePartial<T[K]>;
} : T;
type ValidateFields<Values = any> = ((nameList?: NamePath[], options?: ValidateOptions) => Promise<Values>) & ((options?: ValidateOptions) => Promise<Values>);
/** Engine-internal view of a mounted `Field`. */
export interface FieldEntity {
    onStoreChange: (store: Store, namePathList: InternalNamePath[] | null, info: NotifyInfo) => void;
    isFieldTouched: () => boolean;
    isFieldDirty: () => boolean;
    isFieldValidating: () => boolean;
    isListField: () => boolean | undefined;
    isList: () => boolean | undefined;
    isPreserve: () => boolean | undefined;
    validateRules: (options?: InternalValidateOptions) => Promise<RuleError[]>;
    getMeta: () => Meta;
    getNamePath: () => InternalNamePath;
    getErrors: () => string[];
    getWarnings: () => string[];
    props: {
        name?: NamePath;
        rules?: Rule[];
        dependencies?: NamePath[];
        initialValue?: any;
    };
}
export interface InternalValidateOptions extends ValidateOptions {
    validateOnly?: boolean;
    /** Wait a frame so `useWatch`-derived rules see the latest value. */
    delayFrame?: boolean;
}
export interface RuleError {
    errors: string[];
    rule: RuleObject;
}
/** `Omit` that distributes over a union instead of collapsing it. */
export type DistributiveOmit<T, K extends PropertyKey> = T extends any ? Omit<T, K> : never;
export type NotifyInfo = {
    type: 'valueUpdate';
    source: 'internal' | 'external';
    store: Store;
} | {
    type: 'validateFinish';
    store: Store;
} | {
    type: 'reset';
    store: Store;
} | {
    type: 'remove';
    store: Store;
} | {
    type: 'setField';
    data: FieldData;
    store: Store;
} | {
    type: 'dependenciesUpdate';
    relatedFields: InternalNamePath[];
    store: Store;
};
export interface Callbacks<Values = any> {
    onValuesChange?: (changedValues: any, values: Values) => void;
    onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void;
    onFinish?: (values: Values) => void;
    onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;
}
export interface InternalHooks {
    dispatch: (action: ReducerAction) => void;
    initEntityValue: (entity: FieldEntity) => void;
    registerField: (entity: FieldEntity) => (isListField?: boolean, preserve?: boolean, subNamePath?: InternalNamePath) => void;
    useSubscribe: (subscribable: boolean) => void;
    setInitialValues: (values: Store | undefined, init: boolean) => void;
    destroyForm: (clearOnDestroy?: boolean) => void;
    setCallbacks: (callbacks: Callbacks) => void;
    setValidateMessages: (validateMessages: ValidateMessages) => void;
    getFields: () => FieldData[];
    setPreserve: (preserve?: boolean) => void;
    getInitialValue: (namePath: InternalNamePath) => StoreValue;
    registerWatch: (callback: WatchCallBack) => () => void;
    setScrollToFirstError: (config: boolean | ScrollOptions | undefined) => void;
    /** The `<Form>` element, so a DOM lookup never leaves this form. */
    setRootRef: (ref: React.RefObject<HTMLElement | null>) => void;
}
export type WatchCallBack = (values: Store, allValues: Store) => void;
export type ReducerAction = {
    type: 'updateValue';
    namePath: InternalNamePath;
    value: StoreValue;
} | {
    type: 'validateField';
    namePath: InternalNamePath;
    triggerName: string;
};
export interface InternalFormInstance extends FormInstance {
    prefixName?: InternalNamePath;
    validateTrigger?: string | string[] | false;
    getInternalHooks: (secret: string) => InternalHooks | null;
    _init?: boolean;
}
