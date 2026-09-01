import { FieldProps } from './Field';
import { FormItemCol, FormItemStatusContextValue, FormLayout } from './context';
import { InternalFormInstance, StoreValue } from './interface';
import { InternalNamePath, NamePath } from './namePath';
import * as React from 'react';
declare function getFieldId(namePath: InternalNamePath, formName?: string): string | undefined;
export interface FormItemProps<Values = any> extends Omit<FieldProps, 'children' | 'name' | 'onMetaChange' | 'isList'> {
    name?: NamePath;
    label?: React.ReactNode;
    /**
     * A node, or antd's `{ title, icon, placement, ... }` object form (3 call
     * sites). `title` becomes the tooltip BODY and `icon` the trigger glyph,
     * rendered by the visual shell behind a hover/focus target — antd's real
     * behaviour. (The ticket-05 PILOT-DECISION to render it inline was reverted
     * once Astryx's own `Tooltip` made a real one free of an antd dependency.)
     * The remaining keys (`placement`, DOM props) are still dropped: they
     * describe antd's overlay, which Astryx replaces wholesale.
     */
    tooltip?: React.ReactNode | FormItemTooltipConfig;
    extra?: React.ReactNode;
    /** `false` also suppresses meta bubbling to an ancestor item. */
    help?: React.ReactNode;
    /** Overrides the asterisk derived from `rules`. */
    required?: boolean;
    /** Render no wrapper; bubble this field's meta to the nearest ancestor item. */
    noStyle?: boolean;
    hidden?: boolean;
    layout?: FormLayout;
    className?: string;
    style?: React.CSSProperties;
    hasFeedback?: boolean;
    validateStatus?: FormItemStatusContextValue['status'];
    colon?: boolean;
    labelAlign?: 'left' | 'right';
    labelCol?: FormItemCol;
    wrapperCol?: FormItemCol;
    labelWrap?: boolean;
    htmlFor?: string;
    id?: string;
    fieldKey?: React.Key | React.Key[];
    children?: React.ReactNode | ((form: InternalFormInstance) => React.ReactNode);
    __values?: Values;
}
export interface FormItemTooltipConfig {
    title?: React.ReactNode;
    icon?: React.ReactNode;
    placement?: string;
    [key: string]: unknown;
}
declare const FormItem: <Values>(props: FormItemProps<Values>) => React.JSX.Element;
/** Errors/warnings of the nearest enclosing `Form.Item`. */
export declare const useFormItemStatus: () => {
    status: "" | "success" | "warning" | "error" | "validating" | undefined;
    errors: React.ReactNode[];
    warnings: React.ReactNode[];
};
export { getFieldId };
export default FormItem;
export type { StoreValue };
