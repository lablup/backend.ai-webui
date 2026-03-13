/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useEndpointDiagnostics } from '../hooks/useEndpointDiagnostics';
import DiagnosticResultList from './DiagnosticResultList';

interface EndpointDiagnosticsSectionProps {
  hidePassed?: boolean;
}

const EndpointDiagnosticsSection: React.FC<EndpointDiagnosticsSectionProps> = ({
  hidePassed = false,
}) => {
  'use memo';

  const { results, isLoading } = useEndpointDiagnostics();

  return (
    <DiagnosticResultList
      results={results}
      loading={isLoading}
      hidePassed={hidePassed}
    />
  );
};

export default EndpointDiagnosticsSection;
