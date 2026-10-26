import { FieldEntity, InternalFormInstance, InternalValidateOptions, Meta, NotifyInfo, Rule, RuleError, StoreValue } from './interface';
import { InternalNamePath, NamePath, Store } from './namePath';
import * as React from 'react';
export interface FieldProps {
    name?: NamePath;
    children?: React.ReactNode | ((control: Record<string, any>, meta: Meta, form: InternalFormInstance) => React.ReactNode);
    rules?: Rule[];
    dependencies?: NamePath[];
    shouldUpdate?: boolean | ((prev: Store, next: Store, info: {
        source?: string;
    }) => boolean);
    initialValue?: any;
    preserve?: boolean;
    trigger?: string;
    validateTrigger?: string | string[] | false;
    validateFirst?: boolean | 'parallel';
    valuePropName?: string;
    getValueProps?: (value: StoreValue) => Record<string, unknown>;
    getValueFromEvent?: (...args: any[]) => StoreValue;
    messageVariables?: Record<string, string>;
    isListField?: boolean;
    isList?: boolean;
    onReset?: () => void;
    onMetaChange?: (meta: Meta & {
        destroy?: boolean;
    }) => void;
}
interface InternalFieldProps extends Omit<FieldProps, 'name'> {
    name?: InternalNamePath;
    fieldContext: InternalFormInstance;
}
declare class Field extends React.PureComponent<InternalFieldProps, {
    resetCount: number;
}> implements FieldEntity {
    static contextType: React.Context<InternalFormInstance>;
    state: {
        resetCount: number;
    };
    private cancelRegisterFunc;
    private mounted;
    /**
     * Kept off React state on purpose: these must be readable synchronously
     * during the same tick they change, before React has re-rendered.
     */
    private touched;
    /** Touched OR validated. Only `dependencies` re-validation consults it. */
    private dirty;
    private validatePromise;
    private errors;
    private warnings;
    private metaCache;
    constructor(props: InternalFieldProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private cancelRegister;
    getNamePath: () => InternalNamePath;
    private getRules;
    private reRender;
    /** Remount the child subtree (used on reset so uncontrolled inputs clear). */
    private refresh;
    private triggerMetaEvent;
    onStoreChange: (prevStore: Store, namePathList: InternalNamePath[] | null, info: NotifyInfo) => void;
    validateRules: (options?: InternalValidateOptions) => Promise<RuleError[]>;
    isFieldValidating: () => boolean;
    isFieldTouched: () => boolean;
    isFieldDirty: () => boolean;
    getErrors: () => string[];
    getWarnings: () => string[];
    isListField: () => boolean | undefined;
    isList: () => boolean | undefined;
    isPreserve: () => boolean | undefined;
    getMeta: () => Meta;
    private getValue;
    private getOnlyChild;
    getControlled: (childProps?: Record<string, any>) => Record<string, any>;
    render(): React.JSX.Element;
}
/**
 * Normalises `name` and resolves the list/field contexts before handing off
 * to the class. The `key` trick matters: a NON-list field is keyed by its
 * path, so renaming it remounts a clean field instead of carrying the old
 * one's touched/error state onto a different name.
 */
declare const WrapperField: React.FC<FieldProps & {
    fieldContext?: InternalFormInstance;
}>;
export default WrapperField;
export { Field as InternalField };
