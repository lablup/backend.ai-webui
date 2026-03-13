/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useStorageProxyDiagnostics } from '../hooks/useStorageProxyDiagnostics';
import { DiagnosticResult } from '../types/diagnostics';
import DiagnosticResultList from './DiagnosticResultList';
import { useEffect } from 'react';

interface StorageProxyDiagnosticsSectionProps {
  hidePassed?: boolean;
  onHasIssues?: (hasIssues: boolean) => void;
  onResults?: (results: DiagnosticResult[]) => void;
}

const StorageProxyDiagnosticsSection: React.FC<
  StorageProxyDiagnosticsSectionProps
> = ({ hidePassed = false, onHasIssues, onResults }) => {
  'use memo';

  const results = useStorageProxyDiagnostics();
  const hasIssues = results.some((r) => r.severity !== 'passed');

  useEffect(() => {
    onHasIssues?.(hasIssues);
  }, [hasIssues, onHasIssues]);

  useEffect(() => {
    onResults?.(results);
  }, [results, onResults]);

  return <DiagnosticResultList results={results} hidePassed={hidePassed} />;
};

export default StorageProxyDiagnosticsSection;
