/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useStorageProxyDiagnostics } from '../hooks/useStorageProxyDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';
import { useEffect } from 'react';

interface StorageProxyDiagnosticsSectionProps {
  hidePassed?: boolean;
  onHasIssues?: (hasIssues: boolean) => void;
}

const StorageProxyDiagnosticsSection: React.FC<
  StorageProxyDiagnosticsSectionProps
> = ({ hidePassed = false, onHasIssues }) => {
  'use memo';

  const results = useStorageProxyDiagnostics();
  const hasIssues = results.some((r) => r.severity !== 'passed');

  useEffect(() => {
    onHasIssues?.(hasIssues);
  }, [hasIssues, onHasIssues]);

  return <DiagnosticResultList results={results} hidePassed={hidePassed} />;
};

export default StorageProxyDiagnosticsSection;
