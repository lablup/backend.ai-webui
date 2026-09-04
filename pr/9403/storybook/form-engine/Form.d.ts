import { default as useForm, FormStore } from './FormStore';
import { FormItemCol, FormLayout, FormSize, RequiredMark } from './context';
import { Callbacks, FieldData, FormInstance, ValidateMessages } from './interface';
import { Store } from './namePath';
import * as React from 'react';
export interface FormProps<Values = any> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children' | 'onChange' | 'onReset'> {
    form?: FormInstance<Values>;
    name?: string;
    initialValues?: Store;
    /** `false` drops unmounted fields' values; the default `true` keeps them. */
    preserve?: boolean;
    layout?: FormLayout;
    requiredMark?: RequiredMark;
    disabled?: boolean;
    size?: FormSize;
    labelCol?: FormItemCol;
    wrapperCol?: FormItemCol;
    colon?: boolean;
    labelAlign?: 'left' | 'right';
    labelWrap?: boolean;
    validateMessages?: ValidateMessages;
    validateTrigger?: string | string[] | false;
    scrollToFirstError?: boolean | Record<string, unknown>;
    clearOnDestroy?: boolean;
    onValuesChange?: Callbacks<Values>['onValuesChange'];
    onFieldsChange?: Callbacks<Values>['onFieldsChange'];
    onFinish?: Callbacks<Values>['onFinish'];
    onFinishFailed?: Callbacks<Values>['onFinishFailed'];
    /** `false` renders no wrapper element at all (context only). */
    component?: React.ComponentType<any> | string | false;
    children?: React.ReactNode;
}
/**
 * What `<Form ref>` hands back. `nativeElement` is OPTIONAL on purpose: call
 * sites declare `useRef<FormInstance>(null)`, and a required extra member
 * would make that ref type unassignable to the element's `ref` prop.
 */
export type FormRef<Values = any> = FormInstance<Values> & {
    nativeElement?: HTMLElement | null;
};
/**
 * The ref is declared as `Ref<FormInstance<Values>>`, not `Ref<FormRef<…>>`:
 * call sites write `useRef<FormInstance<MyValues>>(null)`, and inference
 * through the plain generic recovers `Values` from that, where an
 * intersection type does not. The runtime object still carries
 * `nativeElement`, which `FormRef` describes for anyone who wants it.
 */
declare const Form: <Values = any>(props: FormProps<Values> & {
    ref?: React.Ref<FormInstance<Values>>;
}) => React.ReactElement;
export interface FormProviderProps {
    validateMessages?: ValidateMessages;
    onFormChange?: (name: string | undefined, info: {
        changedFields: FieldData[];
        forms: Record<string, FormInstance>;
    }) => void;
    onFormFinish?: (name: string | undefined, info: {
        values: Store;
        forms: Record<string, FormInstance>;
    }) => void;
    children?: React.ReactNode;
}
/**
 * Cross-form listener. `onFormChange` is wired to `onFieldsChange`, NOT to
 * `onValuesChange`, so it observes programmatic mutations (`setFieldValue`,
 * `setFieldsValue`, `setFields`) as well as user edits — the documented
 * requirement at `SessionLauncherPage.tsx`.
 */
export declare const FormProvider: React.FC<FormProviderProps>;
export { useForm, FormStore };
export default Form;
