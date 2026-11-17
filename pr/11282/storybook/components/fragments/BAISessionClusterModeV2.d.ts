import { BAISessionClusterModeV2Fragment$key } from '../../__generated__/BAISessionClusterModeV2Fragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAISessionClusterModeV2Props {
    /** v2 `SessionV2MetadataInfo` fragment. */
    metadataFrgmt: BAISessionClusterModeV2Fragment$key | null;
    showSize?: boolean;
    mode?: 'text' | 'tag';
}
/**
 * v2 counterpart of `BAISessionClusterMode`. Consumes the
 * `SessionV2MetadataInfo` fragment directly instead of receiving the cluster
 * mode/size via props. The v2 `ClusterMode` enum (`SINGLE_NODE`/`MULTI_NODE`)
 * is matched by prefix, mirroring the v1 component.
 */
declare const BAISessionClusterModeV2: React.FC<BAISessionClusterModeV2Props>;
export default BAISessionClusterModeV2;
