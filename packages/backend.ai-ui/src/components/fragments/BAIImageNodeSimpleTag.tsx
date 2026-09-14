import { BAIImageNodeSimpleTagFragment$key } from '../../__generated__/BAIImageNodeSimpleTagFragment.graphql';
import { badgeVariantForTagColor } from '../../helper';
import { theme } from '../../theme-shim';
import BAIDoubleTag from '../BAIDoubleTag';
import BAIFlex from '../BAIFlex';
import BAIImageMetaIcon from '../BAIImageMetaIcon';
import BAIText from '../BAIText';
import { useBAIImageMetaData } from '../provider/BAIMetaDataProvider';
import { imageNodeTagFacts } from './BAIImageNodeSimpleTagV2';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { Text } from '@astryxdesign/core/Text';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIImageNodeSimpleTagProps {
  /** v1 `ImageNode` fragment. */
  imageFrgmt: BAIImageNodeSimpleTagFragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

/**
 * Astryx's vertical `Divider` is `height: 100%`, which a centered flex row
 * collapses to 0; these are antd's metrics.
 */
const MetaDivider: React.FC = () => {
  'use memo';
  const { token } = theme.useToken();
  return (
    <Divider
      orientation="vertical"
      style={{
        alignSelf: 'center',
        height: '0.9em',
        marginInline: token.marginXXS,
      }}
    />
  );
};

/**
 * One-line identity of a v1 `ImageNode`: the meta icon, the aliased base name,
 * the base version and the architecture, followed by the tag chips and a copy
 * control for the full reference (ADR 0004). `BAIImageNodeSimpleTagV2` draws
 * the same row from the v2 schema.
 */
const BAIImageNodeSimpleTag: React.FC<BAIImageNodeSimpleTagProps> = ({
  imageFrgmt,
  withoutTag = false,
  copyable = true,
}) => {
  'use memo';
  const [, { tagAlias }] = useBAIImageMetaData();
  const image = useFragment(
    graphql`
      fragment BAIImageNodeSimpleTagFragment on ImageNode {
        base_image_name
        version
        architecture
        tags {
          key
          value
        }
        labels {
          key @required(action: NONE)
          value
        }
        registry
        namespace
        tag
      }
    `,
    imageFrgmt,
  );

  if (!image) return null;

  // `architecture` is nullable and the copy control emits this string, so the
  // suffix is conditional.
  const base = `${image.registry}/${image.namespace}:${image.tag}`;
  const fullName = image.architecture ? `${base}@${image.architecture}` : base;
  const facts = imageNodeTagFacts(image.tags, image.labels, tagAlias);

  return (
    <BAIFlex direction="row" wrap="wrap" gap="xxs">
      <BAIImageMetaIcon image={fullName} />
      <Text>{tagAlias(image.base_image_name || '')}</Text>
      <MetaDivider />
      <Text>{image.version}</Text>
      <MetaDivider />
      <Text>{image.architecture}</Text>
      {!withoutTag && !_.isEmpty(facts) ? (
        <>
          <MetaDivider />
          <BAIFlex direction="row" align="center" gap="xxs" wrap="wrap">
            {_.map(facts, (fact, index) =>
              fact.isDouble ? (
                <BAIDoubleTag
                  key={`${fact.key}-${index}`}
                  values={[
                    {
                      label: fact.keyAlias ?? '',
                      color: fact.isCustomized ? 'cyan' : 'blue',
                    },
                    {
                      label: fact.value ?? '',
                      color: fact.isCustomized ? 'cyan' : 'blue',
                    },
                  ]}
                />
              ) : (
                <Badge
                  key={`${fact.key}-${index}`}
                  variant={badgeVariantForTagColor(
                    fact.isCustomized ? 'cyan' : 'blue',
                  )}
                  label={fact.aliasedTag}
                />
              ),
            )}
          </BAIFlex>
        </>
      ) : null}
      {copyable ? <BAIText copyable={{ text: fullName }} /> : null}
    </BAIFlex>
  );
};

export default BAIImageNodeSimpleTag;
