/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useEndpointDiagnostics } from '../hooks/useEndpointDiagnostics';
import { DiagnosticResult } from '../types/diagnostics';
import DiagnosticResultList from './DiagnosticResultList';
import { useEffect } from 'react';

interface EndpointDiagnosticsSectionProps {
  hidePassed?: boolean;
  onHasIssues?: (hasIssues: boolean) => void;
  onResults?: (results: DiagnosticResult[]) => void;
}

const EndpointDiagnosticsSection: React.FC<EndpointDiagnosticsSectionProps> = ({
  hidePassed = false,
  onHasIssues,
  onResults,
}) => {
  'use memo';

  const { results, isLoading } = useEndpointDiagnostics();
  const hasIssues = results.some((r) => r.severity !== 'passed');

  useEffect(() => {
    if (!isLoading) {
      onHasIssues?.(hasIssues);
    }
  }, [hasIssues, isLoading, onHasIssues]);

  useEffect(() => {
    onResults?.(results);
  }, [results, onResults]);

  return (
    <DiagnosticResultList
      results={results}
      loading={isLoading}
      hidePassed={hidePassed}
    />
  );
};

export default EndpointDiagnosticsSection;
