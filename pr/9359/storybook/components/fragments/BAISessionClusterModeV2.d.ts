import { BAISessionClusterModeV2Fragment$key } from '../../__generated__/BAISessionClusterModeV2Fragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
