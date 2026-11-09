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
 `es/asn/LoadingOutlined.js`), MIT-licensed, same vendoring precedent as
 `theme-shim/vendor/antdColors.ts`. Inlining it keeps the visual layer's
 zero-dependency property: no antd, no BUI, no icon package.

 `currentColor` everywhere — the status colour is set on the wrapping span by
 the shell, from the same custom-property chain as the error text, so a theme
 change moves glyph and message together.
 */
import * as React from 'react';
/**
 * The glyph for a validation status, or `null` for the neutral state (antd
 * draws nothing when `mergedValidateStatus` is empty).
 */
export declare const getFeedbackIcon: (status: string | undefined) => React.ReactNode;
export default getFeedbackIcon;
