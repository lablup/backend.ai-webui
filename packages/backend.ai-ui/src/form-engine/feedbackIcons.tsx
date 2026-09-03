/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The four validation feedback glyphs `hasFeedback` paints (to-astryx ticket 34
 hardening).

 antd renders these from `@ant-design/icons` and delivers them to the CONTROL
 through `FormItemInputContext.feedbackIcon`, so the control draws them as its
 own suffix. The engine publishes its own context on purpose (ticket 34 removed
 the `antd/es/form/context` deep import), so an antd control nested in an engine
 item never receives the node — the shell draws it instead, positioned where
 antd's suffix lands (see `FormItemVisual.css`).

 The path data is COPIED from `@ant-design/icons-svg@4.5.0`
 (`es/asn/{CheckCircle,CloseCircle,ExclamationCircle}Filled.js`,
 `es/asn/LoadingOutlined.js`), MIT-licensed. Inlining it keeps the visual layer's
 zero-dependency property: no antd, no BUI, no icon package.

 `currentColor` everywhere — the status colour is set on the wrapping span by
 the shell, from the same custom-property chain as the error text, so a theme
 change moves glyph and message together.
 */
import * as React from 'react';

type Status = 'success' | 'warning' | 'error' | 'validating';

/** antd icons draw on a 1024 grid with a 64-unit bleed; `1em` sizes to font. */
const BASE = {
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  'aria-hidden': true,
  focusable: 'false',
} as const;

const PATHS: Record<
  Status,
  { viewBox: string; d: string; fillRule?: 'evenodd' }
> = {
  success: {
    viewBox: '64 64 896 896',
    d: 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z',
  },
  error: {
    viewBox: '64 64 896 896',
    fillRule: 'evenodd',
    d: 'M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm127.98 274.82h-.04l-.08.06L512 466.75 384.14 338.88c-.04-.05-.06-.06-.08-.06a.12.12 0 00-.07 0c-.03 0-.05.01-.09.05l-45.02 45.02a.2.2 0 00-.05.09.12.12 0 000 .07v.02a.27.27 0 00.06.06L466.75 512 338.88 639.86c-.05.04-.06.06-.06.08a.12.12 0 000 .07c0 .03.01.05.05.09l45.02 45.02a.2.2 0 00.09.05.12.12 0 00.07 0c.02 0 .04-.01.08-.05L512 557.25l127.86 127.87c.04.04.06.05.08.05a.12.12 0 00.07 0c.03 0 .05-.01.09-.05l45.02-45.02a.2.2 0 00.05-.09.12.12 0 000-.07v-.02a.27.27 0 00-.05-.06L557.25 512l127.87-127.86c.04-.04.05-.06.05-.08a.12.12 0 000-.07c0-.03-.01-.05-.05-.09l-45.02-45.02a.2.2 0 00-.09-.05.12.12 0 00-.07 0z',
  },
  warning: {
    viewBox: '64 64 896 896',
    d: 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z',
  },
  validating: {
    viewBox: '0 0 1024 1024',
    d: 'M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z',
  },
};

/**
 * The glyph for a validation status, or `null` for the neutral state (antd
 * draws nothing when `mergedValidateStatus` is empty).
 */
export const getFeedbackIcon = (
  status: string | undefined,
): React.ReactNode => {
  if (!status || !(status in PATHS)) return null;
  const spec = PATHS[status as Status];
  return (
    <svg
      {...BASE}
      viewBox={spec.viewBox}
      // antd spins the loading glyph; `-loading` in the stylesheet owns it.
      data-bai-form-item-feedback-glyph={status}
    >
      <path d={spec.d} fillRule={spec.fillRule} />
    </svg>
  );
};

export default getFeedbackIcon;
