/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The presentational shell of a form item (to-astryx tickets 05 + 34, hardened
 in the ticket-34 parity pass).

 Ticket 05 split the form item into this hand-rendered shell and a state
 binding so that re-pointing the STATE source would not touch a pixel; ticket
 34 swapped the engine underneath it. This pass re-derives the shell from
 antd's own source of truth — `antd/es/form/style/index.js` (the token-driven
 stylesheet), `FormItemLabel.js`, `FormItemInput.js` and `FormItem/ItemHolder.js`
 — instead of from an approximation, so `layout` / `labelCol` / `wrapperCol` /
 `colon` / `labelAlign` / `labelWrap` / `size` / `hasFeedback` / `validateStatus`
 behave as antd behaves rather than as a 120px-label simplification.

 Structure mirrors antd's, element for element, so geometry falls out of the
 same box model:

   [data-bai-form-item]                       .ant-form-item
     [data-bai-form-item-row]                 .ant-row.ant-form-item-row
       [data-bai-form-item-label-col]         .ant-col.ant-form-item-label
         [data-bai-form-item-label] (label)   > label
       [data-bai-form-item-control]           .ant-col.ant-form-item-control
         [data-bai-form-item-control-input]     .ant-form-item-control-input
           …-control-input-content                .ant-form-item-control-input-content
           …-feedback-icon                        (antd delivers this via context)
         [data-bai-form-item-additional]        .ant-form-item-additional
           [data-bai-form-item-explain]           .ant-form-item-explain
           [data-bai-form-item-extra]             .ant-form-item-extra
     [data-bai-form-item-margin-offset]       .ant-form-item-margin-offset

 It has zero antd/BUI imports, reads no theme token through JS, and renders
 correctly with no provider mounted at all — every value resolves as
 `var(--bai-form-item-*, var(--astryx-token, antd-parity-literal))`.

 The ONE design-system import is Astryx's `Tooltip` (plus the `CircleHelp`
 glyph), which supersedes the ticket-05 PILOT-DECISION that rendered
 `Form.Item tooltip` INLINE next to the label. That decision was taken because
 the only tooltip available at the time was antd's, and this shell must not
 import antd; Astryx's `Tooltip` carries no such cost, and the inline render
 was a visible regression (33 call sites spilled a paragraph of help text into
 the label row — e.g. the session launcher's "Resource allocation" card).
 antd's own metrics are reproduced: a help glyph after the label,
 `margin-inline-start: marginXXS`, `colorTextDescription`, `cursor: help`.

 Layout uses plain flex `div`s rather than `BAIFlex` so the visual layer keeps
 no dependency that could drag a build step (or antd) back into its graph.
 */
import './FormItemVisual.css';
import getFeedbackIcon from './feedbackIcons';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { CircleHelp } from 'lucide-react';
import * as React from 'react';

/**
 * Every dimension/color resolves in three steps:
 *   1. `--bai-form-item-*`  — per-surface override hook,
 *   2. the Astryx theme token — the value the migrated app actually shows,
 *   3. a hard-coded antd-parity literal, so the component renders correctly
 *      with ZERO theme provider mounted.
 *
 * The antd token each one reproduces is named in the comment; the source is
 * `prepareComponentToken` + `genFormItemStyle` in antd's form stylesheet.
 */
const V = {
  // antd vertical forms pad 8px between label and control
  // (`verticalLabelPadding: '0 0 paddingXS'`).
  labelPaddingBottom: 'var(--bai-form-item-gap, var(--spacing-2, 8px))',
  // antd `itemMarginBottom: token.marginLG`.
  marginBottom: 'var(--bai-form-item-margin-bottom, var(--spacing-6, 24px))',
  // antd `labelColor: token.colorTextHeading`. Both resolve to the SAME value
  // for this repo's seeds — theme.json declares `colorText` and antd's
  // heading tier follows it (measured light #141414 / dark #ffffff).
  labelColor:
    'var(--bai-form-item-label-color, var(--color-text-primary, rgba(0,0,0,0.88)))',
  // antd `labelFontSize: token.fontSize`.
  labelFontSize:
    'var(--bai-form-item-label-font-size, var(--font-size-base, 14px))',
  lineHeight: 'var(--bai-form-item-label-line-height, 1.5714285714285714)',
  // antd `labelRequiredMarkColor: token.colorError`.
  requiredColor:
    'var(--bai-form-item-required-color, var(--color-error, #ff4d4f))',
  errorColor: 'var(--bai-form-item-error-color, var(--color-error, #ff4d4f))',
  warningColor:
    'var(--bai-form-item-warning-color, var(--color-warning, #faad14))',
  successColor:
    'var(--bai-form-item-success-color, var(--color-success, #52c41a))',
  validatingColor:
    'var(--bai-form-item-validating-color, var(--color-accent, #1677ff))',
  /**
   * antd paints `-explain` and `-extra` with `colorTextDescription`
   * (rgba(0,0,0,0.45) / rgba(255,255,255,0.45)). Astryx's text ramp stops at
   * `--color-text-secondary` (0.65) — a DIFFERENT antd role
   * (`colorTextSecondary`) — so pointing the shell at it rendered both blocks
   * a step too dark. The missing tier is declared once, as a light-dark pair,
   * in `FormItemVisual.css`; `theme-shim/selfTokens.ts#colorTextDescription`
   * is the same measurement for the JS side.
   */
  descriptionColor:
    'var(--bai-form-item-description-color, var(--bai-color-text-description, rgba(0,0,0,0.45)))',
  // antd `-explain, -extra { fontSize: token.fontSize }`.
  explainFontSize:
    'var(--bai-form-item-explain-font-size, var(--font-size-base, 14px))',
  // antd `-extra { minHeight: token.controlHeightSM }`.
  extraMinHeight: 'var(--bai-form-item-extra-min-height, 24px)',
  // antd `marginXXS` — the asterisk/tooltip/colon micro-gap.
  gapXXS: 'var(--bai-form-item-mark-gap, var(--spacing-1, 4px))',
};

export type FormItemLayout = 'vertical' | 'horizontal' | 'inline';
export type FormItemSize = 'small' | 'middle' | 'large';
export type FormItemStatus =
  'success' | 'warning' | 'error' | 'validating' | '';

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
  /**
   * The field handle (`getFieldHandle`), published as `data-bai-field-item`
   * so a field whose child forwards no props to the DOM is still reachable
   * by `FormStore.getFieldDOMNode`.
   */
  fieldHandle?: string;
  /** The owning form's token; on every item, named or not. */
  formId?: string;
  /** Handles of wrapper-less `noStyle` fields this item stands in for. */
  subFieldHandles?: string[];
  htmlFor?: string;
  className?: string;
  style?: React.CSSProperties;
  hidden?: boolean;
  children?: React.ReactNode;
}

/**
 * antd grid: `span`/`offset` are 24ths, emitted as flex-basis percentages.
 *
 * `role` matters because antd's own cascade does not treat the two columns
 * alike. `.ant-col-N` sets `flex: 0 0 N/24` AND `max-width: N/24`, but
 * `genHorizontalStyle`'s `${formItemCls}-horizontal ${formItemCls}-control
 * { flex: 1 1 0 }` is more specific and wins on the CONTROL — so a
 * `wrapperCol` span acts as a max-width, not a fixed basis. Measured:
 * `labelCol 6 + wrapperCol 20` (26 > 24 on purpose) renders 105 + 315 in antd,
 * NOT 105 + 350 wrapped onto two lines.
 */
const GRID_MAX = 24;
const colStyle = (
  col: FormItemCol | undefined,
  role: 'label' | 'control',
): React.CSSProperties => {
  if (!col) return {};
  const style: React.CSSProperties = { ...col.style };
  if (col.span !== undefined) {
    const pct = `${(col.span / GRID_MAX) * 100}%`;
    style.maxWidth = pct;
    if (role === 'label') style.flex = `0 0 ${pct}`;
  }
  if (col.flex !== undefined) {
    style.flex =
      typeof col.flex === 'number' ? `${col.flex} ${col.flex} auto` : col.flex;
  }
  if (col.offset !== undefined) {
    style.marginInlineStart = `${(col.offset / GRID_MAX) * 100}%`;
  }
  return style;
};

const sizeHeight = (size: FormItemSize | undefined): number | undefined => {
  // antd `genFormSize(token, controlHeightSM|controlHeightLG)`; the middle
  // size uses `labelHeight: token.controlHeight`.
  if (size === 'small') return 24;
  if (size === 'large') return 40;
  return undefined;
};

export const BAIFormItemVisual: React.FC<BAIFormItemVisualProps> = ({
  label,
  labelTitle,
  tooltip,
  tooltipIcon,
  extra,
  help,
  required,
  requiredMarkType,
  layout = 'vertical',
  size,
  colon,
  labelAlign,
  labelCol,
  wrapperCol,
  labelWrap,
  errors = [],
  warnings = [],
  status,
  hasFeedback,
  fieldId,
  fieldHandle,
  formId,
  subFieldHandles,
  htmlFor,
  className,
  style,
  hidden,
  children,
}) => {
  'use memo';
  const hasHelp = help !== undefined && help !== null && help !== false;
  // antd: `hasError = !!(hasHelp || errors.length || warnings.length)` — the
  // trigger for the reserved-space/margin-offset pair, not just for errors.
  const hasExplain = hasHelp || errors.length > 0 || warnings.length > 0;
  const vertical = layout === 'vertical';
  const inline = layout === 'inline';

  /**
   * antd's `ItemHolder` reads the item's OWN computed `margin-bottom` when an
   * explain block appears, reserves that much space inside
   * `.ant-form-item-additional`, then cancels it again with a negative-margin
   * spacer. Net effect: one line of error costs zero layout. Reproduced
   * literally (including reading the computed value, so a call site that
   * overrides `style.marginBottom` still nets out).
   */
  const itemRef = React.useRef<HTMLDivElement>(null);
  const extraRef = React.useRef<HTMLDivElement>(null);
  const [marginBottom, setMarginBottom] = React.useState<number | null>(null);
  const [extraHeight, setExtraHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    if (hasExplain && itemRef.current) {
      setMarginBottom(
        Number.parseInt(getComputedStyle(itemRef.current).marginBottom, 10) ||
          0,
      );
    } else {
      // antd defers this to the leave-motion callback; with no motion the end
      // state is the same and arrives a frame earlier.
      setMarginBottom(null);
    }
  }, [hasExplain]);

  React.useLayoutEffect(() => {
    setExtraHeight(
      extra && extraRef.current ? extraRef.current.clientHeight : 0,
    );
  }, [extra]);

  const labelHeight = vertical
    ? (sizeHeight(size) ?? 'auto')
    : (sizeHeight(size) ?? 32);
  // antd: `haveColon = computedColon && !vertical`. The pseudo-element is
  // rendered in EVERY layout (vertical hides it with `visibility`), because
  // that is what antd does and it is what makes the label's measured width
  // match.
  const computedColon = colon !== false;

  const labelNode =
    label === undefined || label === null ? null : (
      <div
        data-bai-form-item-label-col=""
        data-align={labelAlign === 'left' ? 'left' : undefined}
        data-wrap={labelWrap ? '' : undefined}
        className={labelCol?.className}
        style={colStyle(labelCol, 'label')}
      >
        <label
          htmlFor={htmlFor ?? fieldId}
          data-bai-form-item-label=""
          data-bai-form-item-required={required ? '' : undefined}
          data-required-mark={requiredMarkType}
          data-no-colon={computedColon ? undefined : ''}
          title={labelTitle ?? (typeof label === 'string' ? label : undefined)}
          style={{
            color: V.labelColor,
            fontSize: V.labelFontSize,
            height: labelHeight,
          }}
        >
          {label}
          {tooltip ? (
            /* antd renders `tooltip` behind a hover/focus target, not in the
               label row. The trigger is a `<span tabIndex={0}>` so the hint is
               reachable by keyboard — antd's own `<span class="…-tooltip">`
               is not, which is a small accessibility win rather than a
               divergence in geometry. */
            <Tooltip content={tooltip}>
              <span
                data-bai-form-item-tooltip=""
                role="button"
                tabIndex={0}
                aria-label={
                  typeof label === 'string' ? `${label} — info` : 'info'
                }
                style={{ color: V.descriptionColor }}
                /* The label is a `<label htmlFor>`; clicking anywhere inside
                   it focuses the control, which would steal focus the moment
                   the hint is tapped. */
                onClick={(e) => e.preventDefault()}
              >
                {tooltipIcon ?? <CircleHelp size="1em" />}
              </span>
            </Tooltip>
          ) : null}
        </label>
      </div>
    );

  /**
   * antd's `ErrorList`: `help` REPLACES the error/warning list and inherits the
   * item's status, so `validateStatus="error" help="…"` paints the help red.
   */
  const explainRows: Array<{
    key: string;
    node: React.ReactNode;
    kind: 'error' | 'warning' | null;
  }> = hasHelp
    ? [
        {
          key: 'help',
          node: help,
          kind:
            status === 'error'
              ? 'error'
              : status === 'warning'
                ? 'warning'
                : null,
        },
      ]
    : [
        ...errors.map((e, i) => ({
          key: `e-${i}`,
          node: e,
          kind: 'error' as const,
        })),
        ...warnings.map((w, i) => ({
          key: `w-${i}`,
          node: w,
          kind: 'warning' as const,
        })),
      ];

  const explainNode = explainRows.length ? (
    <div
      id={fieldId ? `${fieldId}_help` : undefined}
      data-bai-form-item-explain=""
      style={{
        color: V.descriptionColor,
        fontSize: V.explainFontSize,
        lineHeight: V.lineHeight,
      }}
    >
      {explainRows.map((row) => (
        <div
          key={row.key}
          data-bai-form-item-explain-error={
            row.kind === 'error' ? '' : undefined
          }
          data-bai-form-item-explain-warning={
            row.kind === 'warning' ? '' : undefined
          }
          style={
            row.kind === 'error'
              ? { color: V.errorColor }
              : row.kind === 'warning'
                ? { color: V.warningColor }
                : undefined
          }
        >
          {row.node}
        </div>
      ))}
    </div>
  ) : null;

  const extraNode = extra ? (
    <div
      ref={extraRef}
      id={fieldId ? `${fieldId}_extra` : undefined}
      data-bai-form-item-extra=""
      style={{
        color: V.descriptionColor,
        fontSize: V.explainFontSize,
        lineHeight: V.lineHeight,
        minHeight: V.extraMinHeight,
      }}
    >
      {extra}
    </div>
  ) : null;

  const feedbackNode =
    hasFeedback && status ? (
      <span
        data-bai-form-item-feedback-icon={status}
        style={{
          color:
            status === 'error'
              ? V.errorColor
              : status === 'warning'
                ? V.warningColor
                : status === 'success'
                  ? V.successColor
                  : V.validatingColor,
          fontSize: V.labelFontSize,
        }}
      >
        {getFeedbackIcon(status)}
      </span>
    ) : null;

  const control = (
    <div
      data-bai-form-item-control=""
      data-span={wrapperCol?.span !== undefined ? '' : undefined}
      className={wrapperCol?.className}
      style={colStyle(wrapperCol, 'control')}
    >
      {/* antd's form stylesheet stretches block controls to the full control
          width via `.ant-select-in-form-item`; reproduced in
          FormItemVisual.css, so Select lines up without antd's CSS. */}
      <div
        data-bai-form-item-control-input=""
        style={{ minHeight: sizeHeight(size) ?? 32 }}
      >
        <div data-bai-form-item-control-input-content="">{children}</div>
        {feedbackNode}
      </div>
      {explainNode || extraNode ? (
        <div
          data-bai-form-item-additional=""
          style={
            marginBottom ? { minHeight: marginBottom + extraHeight } : undefined
          }
        >
          {explainNode}
          {extraNode}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      ref={itemRef}
      className={className}
      data-bai-form-item=""
      data-bai-field-item={fieldHandle}
      data-bai-form-id={formId}
      data-bai-field-items={
        subFieldHandles?.length ? `[${subFieldHandles.join(',')}]` : undefined
      }
      data-layout={layout}
      data-size={size}
      data-status={status || undefined}
      data-feedback={feedbackNode ? '' : undefined}
      data-hidden={hidden ? '' : undefined}
      style={{
        marginBottom: inline ? 0 : V.marginBottom,
        // Also inline, not only via the `data-hidden` rule: hiding a field is
        // a correctness property, not a cosmetic one, and it must hold even
        // for a consumer that forgets to import the package stylesheet.
        ...(hidden ? { display: 'none' } : null),
        ...style,
      }}
    >
      <div data-bai-form-item-row="">
        {labelNode}
        {control}
      </div>
      {marginBottom ? (
        // antd `.ant-form-item-margin-offset`: the reserved explain space
        // floats INTO the item's bottom margin instead of adding height, so a
        // single error line causes no layout jump — while `marginBottom` above
        // stays 24px and keeps collapsing with adjacent siblings exactly as in
        // the pristine state.
        <div
          aria-hidden
          data-bai-form-item-margin-offset=""
          style={{ marginBottom: -marginBottom }}
        />
      ) : null}
    </div>
  );
};

export default BAIFormItemVisual;
