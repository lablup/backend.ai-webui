import { BAISessionClusterModeFragment$key } from '../../__generated__/BAISessionClusterModeFragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAISessionClusterModeProps {
    /** v1 `ComputeSessionNode` fragment. Omit when passing values directly. */
    sessionFrgmt?: BAISessionClusterModeFragment$key | null;
    /**
     * Cluster mode value (e.g. from the v2 `SessionV2` API). Takes precedence
     * over `sessionFrgmt` when provided.
     */
    clusterMode?: string | null;
    /** Cluster size value. Takes precedence over `sessionFrgmt` when provided. */
    clusterSize?: number | null;
    showSize?: boolean;
    mode?: 'text' | 'tag';
}
declare const BAISessionClusterMode: React.FC<BAISessionClusterModeProps>;
export default BAISessionClusterMode;
