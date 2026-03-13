/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useStorageProxyDiagnostics } from '../hooks/useStorageProxyDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';

interface StorageProxyDiagnosticsSectionProps {
  hidePassed?: boolean;
}

const StorageProxyDiagnosticsSection: React.FC<
  StorageProxyDiagnosticsSectionProps
> = ({ hidePassed = false }) => {
  'use memo';

  const results = useStorageProxyDiagnostics();

  return <DiagnosticResultList results={results} hidePassed={hidePassed} />;
};

export default StorageProxyDiagnosticsSection;
