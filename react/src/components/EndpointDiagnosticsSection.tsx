/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useEndpointDiagnostics } from '../hooks/useEndpointDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';
import { useEffect } from 'react';

interface EndpointDiagnosticsSectionProps {
  hidePassed?: boolean;
  onHasIssues?: (hasIssues: boolean) => void;
}

const EndpointDiagnosticsSection: React.FC<EndpointDiagnosticsSectionProps> = ({
  hidePassed = false,
  onHasIssues,
}) => {
  'use memo';

  const { results, isLoading } = useEndpointDiagnostics();
  const hasIssues = results.some((r) => r.severity !== 'passed');

  useEffect(() => {
    if (!isLoading) {
      onHasIssues?.(hasIssues);
    }
  }, [hasIssues, isLoading, onHasIssues]);

  return (
    <DiagnosticResultList
      results={results}
      loading={isLoading}
      hidePassed={hidePassed}
    />
  );
};

export default EndpointDiagnosticsSection;
