/*
 to-astryx W2-D: antd `Typography.Text` -> Astryx `Text`, antd `Tag` -> Astryx
 `Badge` (MAPPING §3.4 / §3.5).

   `type="secondary"`               -> `color="secondary"`
   `style={{fontSize: fontSizeSM}}` -> `size="sm"` (Astryx `--font-size-sm` is
                                       0.75rem = 12px, the same value antd's
                                       `fontSizeSM` resolved to — P9: the
                                       token's VALUE was checked, not its name)

 The theme-shim `useToken()` call goes with it, which is the idiomatic end
 state for the shim.
*/
import { BAISessionClusterModeV2Fragment$key } from '../../__generated__/BAISessionClusterModeV2Fragment.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import * as _ from 'lodash-es';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

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
const BAISessionClusterModeV2: React.FC<BAISessionClusterModeV2Props> = ({
  metadataFrgmt,
  showSize = true,
  mode = 'text',
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const metadata = useFragment(
    graphql`
      fragment BAISessionClusterModeV2Fragment on SessionV2MetadataInfo {
        clusterMode
        clusterSize
      }
    `,
    metadataFrgmt ?? null,
  );

  const clusterMode = metadata?.clusterMode;
  const clusterSize = metadata?.clusterSize;
  const canShowSize = showSize && !_.isNil(clusterSize);

  const modeTitle = _.startsWith(clusterMode?.toUpperCase() || '', 'SINGLE')
    ? t('comp:BAISessionClusterMode.SingleNodeShort')
    : _.startsWith(clusterMode?.toUpperCase() || '', 'MULTI')
      ? t('comp:BAISessionClusterMode.MultiNodeShort')
      : '-';

  return mode === 'text' ? (
    <Text>
      {modeTitle}
      {canShowSize && (
        <>
          &nbsp;
          <Text color="secondary">({clusterSize})</Text>
        </>
      )}
    </Text>
  ) : (
    <Badge
      variant="neutral"
      label={
        <>
          {modeTitle}
          {canShowSize && (
            <>
              &nbsp;
              <Text color="secondary" size="sm">
                ({clusterSize})
              </Text>
            </>
          )}
        </>
      }
    />
  );
};

export default BAISessionClusterModeV2;
