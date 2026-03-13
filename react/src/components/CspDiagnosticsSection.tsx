/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCspDiagnostics } from '../hooks/useCspDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';
import { useEffect } from 'react';

interface CspDiagnosticsSectionProps {
  hidePassed?: boolean;
  onHasIssues?: (hasIssues: boolean) => void;
}

const CspDiagnosticsSection: React.FC<CspDiagnosticsSectionProps> = ({
  hidePassed = false,
  onHasIssues,
}) => {
  'use memo';

  const results = useCspDiagnostics();
  const hasIssues = results.some((r) => r.severity !== 'passed');

  useEffect(() => {
    onHasIssues?.(hasIssues);
  }, [hasIssues, onHasIssues]);

  return <DiagnosticResultList results={results} hidePassed={hidePassed} />;
};

export default CspDiagnosticsSection;
