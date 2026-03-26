/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { EndpointStatusTagFragment$key } from '../__generated__/EndpointStatusTagFragment.graphql';
import { BAITag, SemanticColor, useSemanticColorMap } from 'backend.ai-ui';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

const endpointStatusSemanticMap: Record<string, SemanticColor> = {
  RUNNING: 'success',
  HEALTHY: 'success',
  PROVISIONING: 'info',
  UNHEALTHY: 'warning',
  DEGRADED: 'warning',
  FAILED_TO_START: 'error',
} as const;

interface EndpointStatusTagProps {
  endpointFrgmt: EndpointStatusTagFragment$key | null | undefined;
}
const EndpointStatusTag: React.FC<EndpointStatusTagProps> = ({
  endpointFrgmt,
}) => {
  const endpoint = useFragment(
    graphql`
      fragment EndpointStatusTagFragment on Endpoint {
        id
        status
      }
    `,
    endpointFrgmt,
  );
  const semanticColorMap = useSemanticColorMap();
  const status = endpoint?.status?.toUpperCase() ?? '';

  return (
    <BAITag
      color={semanticColorMap[endpointStatusSemanticMap[status] ?? 'default']}
    >
      {endpoint?.status}
    </BAITag>
  );
};

export default EndpointStatusTag;
