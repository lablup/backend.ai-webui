/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useEndpointDiagnostics } from '../hooks/useEndpointDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';

const EndpointDiagnosticsSection: React.FC = () => {
  'use memo';

  const { results, isLoading } = useEndpointDiagnostics();

  return <DiagnosticResultList results={results} loading={isLoading} />;
};

export default EndpointDiagnosticsSection;
