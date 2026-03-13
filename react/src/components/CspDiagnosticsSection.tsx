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
  onResults?: (results: DiagnosticResult[]) => void;
}

const CspDiagnosticsSection: React.FC<CspDiagnosticsSectionProps> = ({
  hidePassed = false,
  onResults,
}) => {
  'use memo';

  const results = useCspDiagnostics();

  useEffect(() => {
    onResults?.(results);
  }, [results, onResults]);

  return <DiagnosticResultList results={results} hidePassed={hidePassed} />;
};

export default CspDiagnosticsSection;
