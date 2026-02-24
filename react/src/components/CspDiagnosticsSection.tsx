/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCspDiagnostics } from '../hooks/useCspDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';

const CspDiagnosticsSection: React.FC = () => {
  'use memo';

  const results = useCspDiagnostics();

  return <DiagnosticResultList results={results} />;
};

export default CspDiagnosticsSection;
