import * as React from 'react';
export type FormItemLayout = 'vertical' | 'horizontal' | 'inline';
export type FormItemSize = 'small' | 'middle' | 'large';
export type FormItemStatus = 'success' | 'warning' | 'error' | 'validating' | '';
/** antd's `Col` props, reduced to the shapes this repo's call sites use. */
export interface FormItemCol {
    span?: number;
    offset?: number;
    flex?: string | number;
    className?: string;
    style?: React.CSSProperties;
}
export interface BAIFormItemVisualProps {
    label?: React.ReactNode;
    /**
     * `<label title>`. Separate from `label` because antd takes it from the
     * ORIGINAL prop, before `requiredMark` wraps it — a function mark turns the
     * label into an element and the title would silently disappear.
     */
    labelTitle?: string;
    /**
     * The tooltip BODY. Rendered behind a help glyph that follows the label —
     * never inline, exactly as antd's `Form.Item tooltip` behaves.
     */
    tooltip?: React.ReactNode;
    /** antd's `tooltip.icon` — the trigger glyph. Defaults to a question mark. */
    tooltipIcon?: React.ReactNode;
    extra?: React.ReactNode;
    help?: React.ReactNode;
    /** Renders the required marker. Independent of the `required` RULE. */
    required?: boolean;
    /**
     * How the marker is drawn. antd hides the asterisk entirely for `'optional'`
     * and for a FUNCTION `requiredMark` (the label itself carries the hint) —
     * mirrored here as a data attribute so the CSS decides, exactly as antd's
     * `-required-mark-optional` / `-required-mark-hidden` classes do.
     */
    requiredMarkType?: 'optional' | 'hidden';
    layout?: FormItemLayout;
    size?: FormItemSize;
    colon?: boolean;
    labelAlign?: 'left' | 'right';
    labelCol?: FormItemCol;
    wrapperCol?: FormItemCol;
    labelWrap?: boolean;
    errors?: React.ReactNode[];
    warnings?: React.ReactNode[];
    /** Merged validation status; drives colours, the feedback icon and controls. */
    status?: FormItemStatus;
    hasFeedback?: boolean;
    fieldId?: string;
    htmlFor?: string;
    className?: string;
    style?: React.CSSProperties;
    hidden?: boolean;
    children?: React.ReactNode;
}
export declare const BAIFormItemVisual: React.FC<BAIFormItemVisualProps>;
export default BAIFormItemVisual;
