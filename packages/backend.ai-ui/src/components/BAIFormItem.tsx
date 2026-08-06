/**
 * SPIKE (cn-oss-removal / ticket 08) — prototype, NOT wired into the app yet.
 *
 * `BAIFormItem` proves the "visual layer ours / state engine antd's" split.
 *
 * It renders the label, required marker, tooltip slot, extra text and
 * error/warning list ITSELF, using only CSS custom properties — no
 * `theme.useToken()`, no antd token pipeline, no `.ant-form-*` class names.
 * The field binding — value plumbing, `rules`, `dependencies`, `shouldUpdate`,
 * `preserve`, `validateTrigger`, `Form.List` key rewriting — is delegated to
 * `<Form.Item noStyle>`, i.e. to `@rc-component/form`'s `Field`.
 *
 * `noStyle` short-circuits antd's `ItemHolder`, so antd renders NO DOM of its
 * own for the field wrapper — only a `StatusProvider` context node
 * (antd/es/form/FormItem/index.js:155-166). The antd remnant becomes
 * state-engine-only, and the visual layer survives the removal of antd's theme
 * layer (ticket 06) untouched.
 *
 * Known caveat: antd's `Form.Item` calls `useStyle()` UNCONDITIONALLY
 * (antd/es/form/FormItem/index.js:83), so the antd form stylesheet is still
 * injected while antd Form is kept. It just no longer applies to anything.
 */
import BAIFlex from './BAIFlex';
import { Form } from 'antd';
import type { FormItemProps } from 'antd';
// Deep import: antd ships no `exports` map, so internal modules are reachable.
// This is the ONE unstable coupling in the prototype; it exists only while the
// antd engine is retained, and disappears with the engine reimplementation
// (we own the equivalent context at that point).
import { NoStyleItemContext } from 'antd/es/form/context';
import React from 'react';

/** Props BAIFormItem renders itself, i.e. must NOT reach the inner Form.Item. */
type VisualOnlyProps =
  | 'label'
  | 'tooltip'
  | 'extra'
  | 'help'
  | 'required'
  | 'noStyle'
  | 'colon'
  | 'labelAlign'
  | 'labelCol'
  | 'wrapperCol'
  | 'layout'
  | 'children';

export interface BAIFormItemProps extends Omit<FormItemProps, VisualOnlyProps> {
  /**
   * Same meaning as antd's: render no wrapper at all and bubble this field's
   * meta to the nearest rendering ancestor. 104 call sites rely on it as a pure
   * state wrapper, so it stays a straight passthrough.
   */
  noStyle?: boolean;
  label?: React.ReactNode;
  tooltip?: React.ReactNode;
  extra?: React.ReactNode;
  help?: React.ReactNode;
  /** Overrides the required marker antd derives from `rules`. */
  required?: boolean;
  /** `'vertical'` (default) stacks label over control; `'horizontal'` is a row. */
  layout?: 'vertical' | 'horizontal';
  children?: React.ReactNode | ((form: unknown) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Every dimension/color is a CSS custom property with a hard-coded fallback, so
 * the component renders correctly with ZERO theme provider mounted and can be
 * re-skinned by whatever token layer ticket 06 lands on.
 */
const V = {
  gap: 'var(--bai-form-item-gap, 4px)',
  marginBottom: 'var(--bai-form-item-margin-bottom, 24px)',
  labelColor: 'var(--bai-form-item-label-color, rgba(0,0,0,0.88))',
  labelFontSize: 'var(--bai-form-item-label-font-size, 14px)',
  labelLineHeight: 'var(--bai-form-item-label-line-height, 1.5714285714285714)',
  requiredColor: 'var(--bai-form-item-required-color, #ff4d4f)',
  errorColor: 'var(--bai-form-item-error-color, #ff4d4f)',
  warningColor: 'var(--bai-form-item-warning-color, #faad14)',
  extraColor: 'var(--bai-form-item-extra-color, rgba(0,0,0,0.45))',
  explainFontSize: 'var(--bai-form-item-explain-font-size, 14px)',
  labelWidth: 'var(--bai-form-item-label-width, 120px)',
};

export interface BAIFormItemVisualProps {
  label?: React.ReactNode;
  tooltip?: React.ReactNode;
  extra?: React.ReactNode;
  help?: React.ReactNode;
  required?: boolean;
  layout?: 'vertical' | 'horizontal';
  errors?: React.ReactNode[];
  warnings?: React.ReactNode[];
  fieldId?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * The pure presentational shell — zero antd imports beyond BAIFlex, zero token
 * reads. Isolated on purpose: the end-state reimplementation only re-points
 * BAIFormItem's state source; this half never changes again.
 */
export const BAIFormItemVisual: React.FC<BAIFormItemVisualProps> = ({
  label,
  tooltip,
  extra,
  help,
  required,
  layout = 'vertical',
  errors = [],
  warnings = [],
  fieldId,
  className,
  style,
  children,
}) => {
  'use memo';
  const hasHelp = help !== undefined && help !== null && help !== false;
  const hasError = errors.length > 0;
  const hasWarning = !hasError && warnings.length > 0;
  const horizontal = layout === 'horizontal';

  const labelNode =
    label === undefined || label === null ? null : (
      <label
        htmlFor={fieldId}
        data-bai-form-item-label=""
        style={{
          color: V.labelColor,
          fontSize: V.labelFontSize,
          lineHeight: V.labelLineHeight,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          ...(horizontal
            ? {
                width: V.labelWidth,
                flex: `0 0 ${V.labelWidth}`,
                justifyContent: 'flex-end',
                paddingInlineEnd: 8,
                minHeight: 32,
              }
            : null),
        }}
      >
        {required ? (
          <span
            aria-hidden
            data-bai-form-item-required=""
            style={{ color: V.requiredColor, fontFamily: 'SimSun, sans-serif' }}
          >
            *
          </span>
        ) : null}
        <span>{label}</span>
        {tooltip ? (
          <span data-bai-form-item-tooltip="" style={{ color: V.extraColor }}>
            {tooltip}
          </span>
        ) : null}
      </label>
    );

  const explainNode =
    hasHelp || hasError || hasWarning ? (
      <div
        id={fieldId ? `${fieldId}_help` : undefined}
        data-bai-form-item-explain=""
        role="alert"
        style={{
          fontSize: V.explainFontSize,
          lineHeight: V.labelLineHeight,
        }}
      >
        {hasHelp ? (
          <div data-bai-form-item-explain-help="">{help}</div>
        ) : (
          <>
            {errors.map((e, i) => (
              <div
                key={`e-${i}`}
                data-bai-form-item-explain-error=""
                style={{ color: V.errorColor }}
              >
                {e}
              </div>
            ))}
            {warnings.map((w, i) => (
              <div
                key={`w-${i}`}
                data-bai-form-item-explain-warning=""
                style={{ color: V.warningColor }}
              >
                {w}
              </div>
            ))}
          </>
        )}
      </div>
    ) : null;

  const control = (
    <div data-bai-form-item-control="" style={{ flex: 1, minWidth: 0 }}>
      {/* antd's form stylesheet stretches block controls to the full control
          width via `.ant-form-item-control-input-content`. Reproduce that here
          so Select / InputNumber / Input line up without antd CSS. */}
      <div
        data-bai-form-item-control-input=""
        style={{ display: 'flex', alignItems: 'center', minHeight: 32 }}
      >
        <div style={{ flex: 'auto', maxWidth: '100%' }}>{children}</div>
      </div>
      {explainNode}
      {extra ? (
        <div
          id={fieldId ? `${fieldId}_extra` : undefined}
          data-bai-form-item-extra=""
          style={{ color: V.extraColor, fontSize: V.explainFontSize }}
        >
          {extra}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={className}
      data-bai-form-item=""
      data-status={hasError ? 'error' : hasWarning ? 'warning' : undefined}
      style={{ marginBottom: V.marginBottom, ...style }}
    >
      {horizontal ? (
        <BAIFlex direction="row" align="start" gap={0}>
          {labelNode}
          {control}
        </BAIFlex>
      ) : (
        <BAIFlex direction="column" align="stretch" gap={4}>
          {labelNode}
          {control}
        </BAIFlex>
      )}
    </div>
  );
};

interface BridgeProps extends BAIFormItemVisualProps {
  /** injected by antd's Form.Item: value / onChange / id / aria-* / ref */
  id?: string;
  'aria-required'?: string;
}

/**
 * Sits INSIDE the noStyle Form.Item. antd clones this element with the control
 * props (`value`, `onChange`, `id`, `aria-required`, `aria-invalid`, `ref`) —
 * see antd/es/form/FormItem/index.js:231-273 — so the bridge is where we read
 * antd's own computed state and forward the binding to the real control.
 */
const BAIFormItemBridge = React.forwardRef<unknown, BridgeProps>(
  (props, ref) => {
    'use memo';
    const {
      children,
      label,
      tooltip,
      extra,
      help,
      required,
      layout,
      className,
      style,
      ...injected
    } = props;
    const { errors, warnings } = Form.Item.useStatus();

    // A layout-only BAIFormItem (no `name`) that wraps `<Form.Item noStyle>`
    // children must aggregate THEIR errors — that is what antd's `ItemHolder`
    // does through `NoStyleItemContext` (antd/es/form/FormItem/ItemHolder.js:110
    // and index.js:121-150). 104 call sites in this repo use that pattern, so it
    // is not optional.
    const [subMetas, setSubMetas] = React.useState<
      Record<
        string,
        { errors?: React.ReactNode[]; warnings?: React.ReactNode[] }
      >
    >({});
    const onSubItemMetaChange = (
      subMeta: {
        name: (string | number)[];
        destroy?: boolean;
        errors?: React.ReactNode[];
        warnings?: React.ReactNode[];
      },
      uniqueKeys: React.Key[],
    ) => {
      setSubMetas((prev) => {
        const key = [...subMeta.name.slice(0, -1), ...uniqueKeys].join(
          '__SPLIT__',
        );
        if (subMeta.destroy) {
          if (!(key in prev)) return prev;
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return { ...prev, [key]: subMeta };
      });
    };

    const mergedErrors = [
      ...errors,
      ...Object.values(subMetas).flatMap((m) => m.errors ?? []),
    ];
    const mergedWarnings = [
      ...warnings,
      ...Object.values(subMetas).flatMap((m) => m.warnings ?? []),
    ];

    // antd derives `isRequired` from `rules` (including function rules) and hands
    // it to us as `aria-required`. Reuse that instead of re-deriving it.
    const mergedRequired = required ?? injected['aria-required'] === 'true';

    const control = React.isValidElement(children)
      ? React.cloneElement(
          children as React.ReactElement<Record<string, unknown>>,
          {
            ...injected,
            ...(ref ? { ref } : null),
          },
        )
      : children;

    return (
      <BAIFormItemVisual
        label={label}
        tooltip={tooltip}
        extra={extra}
        help={help}
        required={mergedRequired}
        layout={layout}
        className={className}
        style={style}
        fieldId={injected.id}
        errors={mergedErrors}
        warnings={mergedWarnings}
      >
        <NoStyleItemContext.Provider value={onSubItemMetaChange}>
          {control}
        </NoStyleItemContext.Provider>
      </BAIFormItemVisual>
    );
  },
);
BAIFormItemBridge.displayName = 'BAIFormItemBridge';

const BAIFormItem: React.FC<BAIFormItemProps> = ({
  label,
  tooltip,
  extra,
  help,
  required,
  layout = 'vertical',
  className,
  style,
  children,
  noStyle,
  ...fieldProps
}) => {
  'use memo';

  // Pure passthrough: no visual, no aggregation, bubbling preserved.
  if (noStyle) {
    return (
      <Form.Item {...fieldProps} help={help} noStyle>
        {children as React.ReactNode}
      </Form.Item>
    );
  }

  const visual = {
    label,
    tooltip,
    extra,
    help,
    required,
    layout,
    className,
    style,
  };

  // Render-prop children (`shouldUpdate` / `dependencies` without `name`) must
  // stay a function so antd calls it with the form context.
  if (typeof children === 'function') {
    const render = children as (form: unknown) => React.ReactNode;
    return (
      <Form.Item {...fieldProps} help={false} noStyle>
        {
          ((form: unknown) => (
            <BAIFormItemBridge {...visual}>{render(form)}</BAIFormItemBridge>
          )) as unknown as React.ReactNode
        }
      </Form.Item>
    );
  }

  // `help={false}` is antd's own opt-out from `notifyParentMetaChange`
  // (antd/es/form/FormItem/index.js:106). We render help/errors ourselves, so
  // suppressing the bubble stops a nested BAIFormItem from ALSO reporting its
  // errors into an outer BAIFormItem's aggregate.
  return (
    <Form.Item {...fieldProps} help={false} noStyle>
      <BAIFormItemBridge {...visual}>{children}</BAIFormItemBridge>
    </Form.Item>
  );
};

export default BAIFormItem;
