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
  onHasIssues?: (hasIssues: boolean) => void;
  onResults?: (results: DiagnosticResult[]) => void;
}

const WebServerConfigDiagnosticsSection: React.FC<
  WebServerConfigDiagnosticsSectionProps
> = ({ hidePassed = false, onHasIssues, onResults }) => {
  'use memo';

  const results = useWebServerConfigDiagnostics();
  const hasIssues = results.some((r) => r.severity !== 'passed');

  useEffect(() => {
    onHasIssues?.(hasIssues);
  }, [hasIssues, onHasIssues]);

  useEffect(() => {
    onResults?.(results);
  }, [results, onResults]);

  return <DiagnosticResultList results={results} hidePassed={hidePassed} />;
};

export default WebServerConfigDiagnosticsSection;
