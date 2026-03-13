/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebServerConfigDiagnostics } from '../hooks/useWebServerConfigDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';

interface WebServerConfigDiagnosticsSectionProps {
  hidePassed?: boolean;
}

const WebServerConfigDiagnosticsSection: React.FC<
  WebServerConfigDiagnosticsSectionProps
> = ({ hidePassed = false }) => {
  'use memo';

  const results = useWebServerConfigDiagnostics();

  return <DiagnosticResultList results={results} hidePassed={hidePassed} />;
};

export default WebServerConfigDiagnosticsSection;
