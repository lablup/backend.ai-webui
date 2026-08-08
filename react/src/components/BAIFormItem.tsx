/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIFormItem (to-astryx ticket 05, adapted from spike/astryx-form-split).

 HISTORY: ticket 34 briefly moved this file's two halves into
 `packages/backend.ai-ui/src/form-engine/` (`FormItemVisual.tsx` +
 `FormItem.tsx`) and re-bound them to the self-hosted engine, which made every
 `<Form.Item>` in the repo render this shell. That engine is parked as of
 2026-08-08 (see the banner in `form-engine/engine.ts`), so this file is
 restored verbatim to its ticket-05 form: the BAI visual shell over antd's
 `Form.Item noStyle`. It is used only where a call site names `<BAIFormItem>`
 explicitly (tickets 18–23); plain `<Form.Item>` is antd's again, visuals and
 all.

 Decouples form-item VISUALS from antd CSS while keeping antd's form STATE
 engine. It renders the label, required marker, tooltip slot, extra text and
 error/warning list ITSELF — no `theme.useToken()`, no antd token pipeline,
 no `.ant-form-*` class names — and delegates all field binding (value
 plumbing, `rules`, `dependencies`, `shouldUpdate`, `preserve`,
 `validateTrigger`, `Form.List` key rewriting) to `<Form.Item noStyle>`,
 i.e. to `@rc-component/form`'s `Field`.

 `noStyle` short-circuits antd's `ItemHolder`, so antd renders NO DOM of its
 own for the field wrapper — only a `StatusProvider` context node
 (antd/es/form/FormItem/index.js:155-166). The antd remnant becomes
 state-engine-only, and the visual layer survives the removal of antd's
 theme/CSS layer untouched (proven by the strip-all probe: ticket 05
 measurement, `react/theme-probe/form.html`).

 Known caveat: antd's `Form.Item` calls `useStyle()` UNCONDITIONALLY
 (antd/es/form/FormItem/index.js:83), so the antd form stylesheet is still
 injected while the antd Form engine is kept. It just no longer applies to
 anything BAIFormItem renders.

 PILOT-DECISION: the visual shell is hand-rendered, NOT Astryx `Field`.
 `Field.label` is a required *string* while this repo passes ReactNode labels
 (378 `Form.Item label` sites, many with embedded tooltips/`Trans`), Field's
 `status` carries a single message while layout items here aggregate error
 *lists* from nested noStyle children, and the frontier policy requires the
 public prop surface to stay antd-shaped until form pages migrate. Revisit
 Field when the form page-group tickets move the frontier.

 PILOT-DECISION: styles are inline + CSS custom properties, not
 `stylex.create()`. The component must render correctly in harnesses/apps
 without the StyleX compiler (e.g. the theme-probe Vite config) and with zero
 theme provider mounted; every value is `var(--bai-form-item-*, var(--astryx
 token, literal))`, so the ticket-02 theme re-skins it and the antd-parity
 literals are only last-resort fallbacks.
 */
import './BAIFormItem.css';
import { Form } from 'antd';
import type { FormItemProps } from 'antd';
// Deep import: antd ships no `exports` map, so internal modules are reachable.
// This is the ONE unstable coupling (answers ticket 08): it exists only while
// the antd engine is retained, and disappears with the engine
// reimplementation (we own the equivalent context at that point). antd is
// pinned at 6.5.0 — re-verify this import path on any antd bump.
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
   * meta to the nearest rendering ancestor. 104 call sites rely on it as a
   * pure state wrapper, so it stays a straight passthrough.
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
 * Every dimension/color resolves in three steps:
 *   1. `--bai-form-item-*`  — per-surface override hook (nothing defines these
 *      yet; they exist so a page or theme can re-skin form items wholesale),
 *   2. the Astryx theme token (declared by `@astryxdesign/theme-*` /
 *      ticket 02's brand theme — the value the migrated app actually shows),
 *   3. a hard-coded antd-parity literal, so the component renders correctly
 *      with ZERO theme provider mounted (P19: every token name in step 2 was
 *      checked against the declared Astryx variables via theme-shim/mapping).
 */
const V = {
  // antd vertical forms pad 8px between label and control
  // (`.ant-form-vertical .ant-form-item-label { padding-bottom: 8px }`),
  // measured against the baseline column in the ticket-05 probe.
  gap: 'var(--bai-form-item-gap, var(--spacing-2, 8px))',
  marginBottom: 'var(--bai-form-item-margin-bottom, var(--spacing-6, 24px))',
  // antd's `.ant-form-item-explain` reserves controlHeightSM so a single
  // error line replaces (not adds to) the item margin — no layout jump.
  explainMinHeight: 'var(--bai-form-item-explain-min-height, 24px)',
  labelColor:
    'var(--bai-form-item-label-color, var(--color-text-primary, rgba(0,0,0,0.88)))',
  labelFontSize:
    'var(--bai-form-item-label-font-size, var(--font-size-base, 14px))',
  labelLineHeight: 'var(--bai-form-item-label-line-height, 1.5714285714285714)',
  requiredColor:
    'var(--bai-form-item-required-color, var(--color-error, #ff4d4f))',
  errorColor: 'var(--bai-form-item-error-color, var(--color-error, #ff4d4f))',
  warningColor:
    'var(--bai-form-item-warning-color, var(--color-warning, #faad14))',
  extraColor:
    'var(--bai-form-item-extra-color, var(--color-text-secondary, rgba(0,0,0,0.45)))',
  explainFontSize:
    'var(--bai-form-item-explain-font-size, var(--font-size-base, 14px))',
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
 * The pure presentational shell — zero antd/BUI imports, zero token reads.
 * Isolated on purpose: the end-state engine reimplementation only re-points
 * BAIFormItem's state source; this half never changes again. Layout uses
 * plain flex divs (not BAIFlex) so the visual layer has no dependency that
 * could drag antd or a build step back into its graph.
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
          minHeight: V.explainMinHeight,
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
          width via `.ant-form-item-control-input-content`. Reproduced by the
          flex wrapper below + BAIFormItem.css, so Select / InputNumber /
          Input line up without antd CSS. */}
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
          style={{
            color: V.extraColor,
            fontSize: V.explainFontSize,
            // antd parity: extra occupies the same controlHeightSM-tall row
            // as explain (`.ant-form-item-additional` reserves 24px per block)
            minHeight: V.explainMinHeight,
          }}
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
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {labelNode}
          {control}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: V.gap,
          }}
        >
          {labelNode}
          {control}
        </div>
      )}
      {explainNode ? (
        // antd parity (`.ant-form-item-margin-offset`, measured against
        // antd 6.5 in the ticket-05 probe): the explain block floats INTO
        // the item's bottom margin instead of adding height — a single
        // error line causes no layout jump — while `marginBottom` above
        // stays 24px and therefore keeps collapsing with adjacent siblings
        // (e.g. a following Divider) exactly as in the pristine state.
        <div
          aria-hidden
          style={{ marginBottom: `calc(${V.marginBottom} * -1)` }}
        />
      ) : null}
    </div>
  );
};

interface BridgeProps extends BAIFormItemVisualProps {
  /** injected by antd's Form.Item: value / onChange / id / aria-* / ref */
  id?: string;
  'aria-required'?: string;
}

/**
 * Sits INSIDE the noStyle Form.Item. antd clones this element with the
 * control props (`value`, `onChange`, `id`, `aria-required`, `aria-invalid`,
 * `ref`) — see antd/es/form/FormItem/index.js:231-273 — so the bridge is
 * where we read antd's own computed state and forward the binding to the
 * real control.
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
    // and index.js:121-150). 25 layout items across the repo (104 noStyle
    // sites) use that pattern, so it is not optional: without it their error
    // messages silently disappear.
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

    // antd derives `isRequired` from `rules` (including function rules) and
    // hands it to us as `aria-required`. Reuse that instead of re-deriving it
    // — re-derivation gets function-rule call sites wrong.
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
