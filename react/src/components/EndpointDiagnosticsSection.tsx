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
  fetchKey?: string;
  onHasIssues?: (hasIssues: boolean) => void;
  onResultsChange?: (results: DiagnosticResult[]) => void;
}

const EndpointDiagnosticsSection: React.FC<EndpointDiagnosticsSectionProps> = ({
  hidePassed = false,
  fetchKey,
  onHasIssues,
  onResultsChange,
}) => {
  'use memo';

  const { results, isLoading } = useEndpointDiagnostics(fetchKey);
  const hasIssues = results.some((r) => r.severity !== 'passed');

  useEffect(() => {
    if (!isLoading) {
      onHasIssues?.(hasIssues);
    }
  }, [hasIssues, isLoading, onHasIssues]);

  useEffect(() => {
    onResultsChange?.(results);
  }, [results, onResultsChange]);

  return (
    <DiagnosticResultList
      results={results}
      loading={isLoading}
      hidePassed={hidePassed}
    />
  );
};

export default EndpointDiagnosticsSection;
