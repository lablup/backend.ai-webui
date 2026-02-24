/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useStorageProxyDiagnostics } from '../hooks/useStorageProxyDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';

const StorageProxyDiagnosticsSection: React.FC = () => {
  'use memo';

  const results = useStorageProxyDiagnostics();

  return <DiagnosticResultList results={results} />;
};

export default StorageProxyDiagnosticsSection;
