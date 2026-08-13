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
import { BAISessionClusterModeFragment$key } from '../../__generated__/BAISessionClusterModeFragment.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import * as _ from 'lodash-es';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

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

const BAISessionClusterMode: React.FC<BAISessionClusterModeProps> = ({
  sessionFrgmt,
  clusterMode,
  clusterSize,
  showSize = true,
  mode = 'text',
}) => {
  const { t } = useBAIi18n();
  const session = useFragment(
    graphql`
      fragment BAISessionClusterModeFragment on ComputeSessionNode {
        cluster_mode
        cluster_size
      }
    `,
    sessionFrgmt ?? null,
  );

  const resolvedClusterMode = clusterMode ?? session?.cluster_mode;
  const resolvedClusterSize = clusterSize ?? session?.cluster_size;
  const canShowSize = showSize && !_.isNil(resolvedClusterSize);

  const modeTitle = _.startsWith(
    resolvedClusterMode?.toUpperCase() || '',
    'SINGLE',
  )
    ? t('comp:BAISessionClusterMode.SingleNodeShort')
    : _.startsWith(resolvedClusterMode?.toUpperCase() || '', 'MULTI')
      ? t('comp:BAISessionClusterMode.MultiNodeShort')
      : '-';
  return mode === 'text' ? (
    <Text>
      {modeTitle}
      {canShowSize && (
        <>
          &nbsp;
          <Text color="secondary">({resolvedClusterSize})</Text>
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
                ({resolvedClusterSize})
              </Text>
            </>
          )}
        </>
      }
    />
  );
};

export default BAISessionClusterMode;
