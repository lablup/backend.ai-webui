import { FieldData, FieldError, InternalHooks, InternalFormInstance, Meta, StoreValue, ScrollOptions } from './interface';
import { NamePath, Store } from './namePath';
/**
 * Wait for the next paint before validating dependency children, so a rule
 * built from `useWatch` sees the value the dependency just produced instead
 * of the previous render's.
 */
export declare function delayFrame(): Promise<void>;
export declare class FormStore {
    private forceRootUpdate;
    private subscribable;
    private store;
    private fieldEntities;
    private initialValues;
    private callbacks;
    private validateMessages;
    private preserve?;
    private lastValidatePromise;
    private watcherCenter;
    /** Paths of `preserve: false` fields alive at the previous unmount. */
    private prevWithoutPreserves;
    private scrollToFirstErrorConfig;
    private rootRef;
    constructor(forceRootUpdate: () => void);
    getForm: () => InternalFormInstance;
    getInternalHooks: (key: string) => InternalHooks | null;
    private useSubscribe;
    private setCallbacks;
    private setValidateMessages;
    private setPreserve;
    private setScrollToFirstError;
    private setRootRef;
    /**
     * `init` is true only on the very first render, so later `initialValues`
     * prop changes update what `resetFields()` will restore WITHOUT stomping
     * the values the user already typed.
     */
    private setInitialValues;
    private destroyForm;
    private getInitialValue;
    private registerWatch;
    private notifyWatch;
    private updateStore;
    private getFieldEntities;
    private getFieldsMap;
    private getFieldEntitiesForNamePathList;
    /**
     * `getFieldsValue()`         — only REGISTERED fields.
     * `getFieldsValue(true)`     — the raw store, including values with no
     *                              mounted field (3 call sites need this).
     * `getFieldsValue(['a','b'])`— those paths and everything beneath them.
     */
    getFieldsValue: (nameList?: NamePath[] | true | {
        strict?: boolean;
        filter?: (meta: Meta) => boolean;
    }, filterFunc?: (meta: Meta) => boolean) => Store;
    getFieldValue: (name: NamePath) => StoreValue;
    getFieldsError: (nameList?: NamePath[]) => FieldError[];
    getFieldError: (name: NamePath) => string[];
    getFieldWarning: (name: NamePath) => string[];
    isFieldsTouched: (...args: any[]) => boolean;
    isFieldTouched: (name: NamePath) => boolean;
    isFieldsValidating: (nameList?: NamePath[]) => boolean;
    isFieldValidating: (name: NamePath) => boolean;
    /**
     * Apply per-field `initialValue` props. Form-level `initialValues` wins;
     * two fields declaring `initialValue` for the same path is ambiguous and
     * neither is applied.
     */
    private resetWithFieldInitialValue;
    resetFields: (nameList?: NamePath[]) => void;
    setFields: (fields: FieldData[]) => void;
    private getFields;
    private initEntityValue;
    private isMergedPreserve;
    private registerField;
    private dispatch;
    private notifyObservers;
    /**
     * Re-validate and re-render the fields that declare `namePath` in their
     * `dependencies`, transitively. Only DIRTY dependents are re-validated —
     * that is why a pristine field does not flash an error the moment an
     * unrelated field changes.
     */
    private triggerDependenciesUpdate;
    private updateValue;
    setFieldsValue: (store: Store) => void;
    setFieldValue: (name: NamePath, value: StoreValue) => void;
    private getDependencyChildrenFields;
    private triggerOnFieldsChange;
    validateFields: (arg1?: any, arg2?: any) => Promise<Store>;
    submit: () => void;
    /**
     * Resolved through the control's generated `id`, which `FormItem` stamps
     * onto every child. Composing a ref onto arbitrary children would be the
     * only other way and buys nothing: `getFieldInstance` has zero call sites.
     */
    getFieldInstance: (name: NamePath) => HTMLElement | undefined;
    /**
     * Thin by design: it scrolls the NAMED field and nothing else. "First
     * error" is `scrollToFirstError`, which orders by document position —
     * registration order and DOM order disagree.
     */
    scrollToField: (name: NamePath, options?: ScrollOptions) => void;
    scrollToFirstError: (options?: ScrollOptions) => void;
    private scrollToErrorFields;
    focusField: (name: NamePath) => void;
    private getFieldDOMNode;
}
/**
 * Create (or adopt) a form instance.
 *
 * The instance lives in `useState`'s lazy initialiser rather than a ref: both
 * give "construct exactly once", but a ref would have to be read AND written
 * during render, which React's rules-of-refs lint rightly rejects. The
 * `forceUpdate` handed to the store is the escape hatch for the one case
 * field subscriptions cannot express — a `<Form>` whose children read values
 * without registering a field.
 */
export default function useForm<Values = any>(form?: InternalFormInstance): [InternalFormInstance];
