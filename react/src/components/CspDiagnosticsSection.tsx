/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCspDiagnostics } from '../hooks/useCspDiagnostics';
import { DiagnosticResult } from '../types/diagnostics';
import DiagnosticResultList from './DiagnosticResultList';
import { useEffect } from 'react';

interface CspDiagnosticsSectionProps {
  hidePassed?: boolean;
  fetchKey?: string;
  onHasIssues?: (hasIssues: boolean) => void;
  onResultsChange?: (results: DiagnosticResult[]) => void;
}

const CspDiagnosticsSection: React.FC<CspDiagnosticsSectionProps> = ({
  hidePassed = false,
  fetchKey,
  onHasIssues,
  onResultsChange,
}) => {
  'use memo';

  const results = useCspDiagnostics(fetchKey);
  const hasIssues = results.some((r) => r.severity !== 'passed');

  useEffect(() => {
    onHasIssues?.(hasIssues);
  }, [hasIssues, onHasIssues]);

  useEffect(() => {
    onResultsChange?.(results);
  }, [results, onResultsChange]);

  return <DiagnosticResultList results={results} hidePassed={hidePassed} />;
};

export default CspDiagnosticsSection;
