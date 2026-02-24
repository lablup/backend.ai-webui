/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebServerConfigDiagnostics } from '../hooks/useWebServerConfigDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';

const WebServerConfigDiagnosticsSection: React.FC = () => {
  'use memo';

  const results = useWebServerConfigDiagnostics();

  return <DiagnosticResultList results={results} />;
};

export default WebServerConfigDiagnosticsSection;
