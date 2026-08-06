/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * The array prepended to every field's antd `Form.Item` `name`/`dependencies`
 * path so the same JSX works for both callers: `[]` for
 * `DeploymentAddRevisionModal.tsx`'s flat form, `['modelDefinition',
 * 'models', 0, 'service']` for `AdminDeploymentPresetSettingPageContent.tsx`'s
 * nested one.
 */
export type ServiceFormNamePrefix = Array<string | number>;
