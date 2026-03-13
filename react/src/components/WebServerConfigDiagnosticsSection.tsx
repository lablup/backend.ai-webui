/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebServerConfigDiagnostics } from '../hooks/useWebServerConfigDiagnostics';
import { DiagnosticResult } from '../types/diagnostics';
import DiagnosticResultList from './DiagnosticResultList';
import { useEffect } from 'react';

interface WebServerConfigDiagnosticsSectionProps {
  hidePassed?: boolean;
  fetchKey?: number;
  onHasIssues?: (hasIssues: boolean) => void;
  onResultsChange?: (results: DiagnosticResult[]) => void;
}

const WebServerConfigDiagnosticsSection: React.FC<
  WebServerConfigDiagnosticsSectionProps
> = ({ hidePassed = false, fetchKey, onHasIssues, onResultsChange }) => {
  'use memo';

  const results = useWebServerConfigDiagnostics(fetchKey);
  const hasIssues = results.some((r) => r.severity !== 'passed');

  useEffect(() => {
    onHasIssues?.(hasIssues);
  }, [hasIssues, onHasIssues]);

  useEffect(() => {
    onResultsChange?.(results);
  }, [results, onResultsChange]);

  return <DiagnosticResultList results={results} hidePassed={hidePassed} />;
};

export default WebServerConfigDiagnosticsSection;
