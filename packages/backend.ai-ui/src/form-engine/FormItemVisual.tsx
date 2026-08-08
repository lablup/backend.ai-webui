/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The presentational shell of a form item (to-astryx tickets 05 + 34).

 Moved verbatim from `react/src/components/BAIFormItem.tsx` when the engine
 was self-hosted: ticket 05 deliberately isolated this half so that
 re-pointing the STATE source would not touch a single pixel. It has zero
 antd/BUI imports, reads no theme token at runtime, and renders correctly with
 no provider mounted at all — every value resolves as
 `var(--bai-form-item-*, var(--astryx-token, antd-parity-literal))`.

 Layout uses plain flex `div`s rather than `BAIFlex` so the visual layer keeps
 no dependency that could drag a build step (or antd) back into its graph.
 */
import './FormItemVisual.css';
import * as React from 'react';

/**
 * Every dimension/color resolves in three steps:
 *   1. `--bai-form-item-*`  — per-surface override hook,
 *   2. the Astryx theme token — the value the migrated app actually shows,
 *   3. a hard-coded antd-parity literal, so the component renders correctly
 *      with ZERO theme provider mounted.
 */
const V = {
  // antd vertical forms pad 8px between label and control
  // (`.ant-form-vertical .ant-form-item-label { padding-bottom: 8px }`).
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
  /** Renders the red asterisk. Independent of the `required` RULE. */
  required?: boolean;
  layout?: 'vertical' | 'horizontal';
  errors?: React.ReactNode[];
  warnings?: React.ReactNode[];
  fieldId?: string;
  className?: string;
  style?: React.CSSProperties;
  hidden?: boolean;
  children?: React.ReactNode;
}

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
  hidden,
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
          flex wrapper below + FormItemVisual.css, so Select / InputNumber /
          Input line up without antd CSS. */}
      <div
        data-bai-form-item-control-input=""
        style={{ display: 'flex', alignItems: 'center', minHeight: 32 }}
      >
        <div
          data-bai-form-item-control-input-content=""
          style={{ flex: 'auto', maxWidth: '100%' }}
        >
          {children}
        </div>
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
      style={{
        marginBottom: V.marginBottom,
        ...(hidden ? { display: 'none' } : null),
        ...style,
      }}
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
        // antd parity (`.ant-form-item-margin-offset`): the explain block
        // floats INTO the item's bottom margin instead of adding height — a
        // single error line causes no layout jump — while `marginBottom`
        // above stays 24px and therefore keeps collapsing with adjacent
        // siblings exactly as in the pristine state.
        <div
          aria-hidden
          style={{ marginBottom: `calc(${V.marginBottom} * -1)` }}
        />
      ) : null}
    </div>
  );
};

export default BAIFormItemVisual;
