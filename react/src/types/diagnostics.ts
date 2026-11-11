/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

export type DiagnosticSeverity = 'critical' | 'warning' | 'info' | 'passed';

export type DiagnosticCategory = 'config' | 'csp' | 'endpoint' | 'storage';

export interface DiagnosticResult {
  id: string;
  severity: DiagnosticSeverity;
  category: DiagnosticCategory;
  titleKey: string;
  descriptionKey: string;
  remediationKey?: string;
  interpolationValues?: Record<string, string>;
  /**
   * The System Settings key (`WEBUI_SETTING_DEFINITIONS`) the result is about:
   * the list fills `{{setting}}` / `{{group}}` with its labels and links the page.
   */
  settingKey?: string;
  /** Links System Settings without naming one setting. */
  linksSystemSettings?: boolean;
}
