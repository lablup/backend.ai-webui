/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

export type DiagnosticSeverity = 'critical' | 'warning' | 'info' | 'passed';

export interface DiagnosticResult {
  id: string;
  severity: DiagnosticSeverity;
  titleKey: string;
  descriptionKey: string;
  remediationKey?: string;
  interpolationValues?: Record<string, string>;
}
