/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCspDiagnostics } from '../hooks/useCspDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';

interface CspDiagnosticsSectionProps {
  hidePassed?: boolean;
}

const CspDiagnosticsSection: React.FC<CspDiagnosticsSectionProps> = ({
  hidePassed = false,
}) => {
  'use memo';

  const results = useCspDiagnostics();

  return <DiagnosticResultList results={results} hidePassed={hidePassed} />;
};

export default CspDiagnosticsSection;
