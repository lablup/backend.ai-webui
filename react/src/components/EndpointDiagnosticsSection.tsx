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
  onResults?: (results: DiagnosticResult[]) => void;
}

const EndpointDiagnosticsSection: React.FC<EndpointDiagnosticsSectionProps> = ({
  hidePassed = false,
  onResults,
}) => {
  'use memo';

  const { results, isLoading } = useEndpointDiagnostics();

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
