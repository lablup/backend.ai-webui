import { BAISessionClusterModeFragment$key } from '../../__generated__/BAISessionClusterModeFragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
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
