import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import { preserveDotStartCase } from '../../helper';
import BAIDoubleTag from '../BAIDoubleTag';
import BAIFlex from '../BAIFlex';
import BAIImageMetaIcon from '../BAIImageMetaIcon';
import { useBAIImageMetaData } from '../provider/BAIMetaDataProvider';
import { Divider, Tag, Typography, theme } from 'antd';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIImageNodeSimpleTagV2Props {
  /** v2 `ImageV2` fragment. */
  imageFrgmt: BAIImageNodeSimpleTagV2Fragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

/**
 * v2 counterpart of the React app's `ImageNodeSimpleTag`. Renders the image
 * icon, base name, version and architecture in the same format as the v1
 * session list, resolving icons and tag aliases from the image metadata
 * provided via `BAIMetaDataProvider`.
 */
const BAIImageNodeSimpleTagV2: React.FC<BAIImageNodeSimpleTagV2Props> = ({
  imageFrgmt,
  withoutTag = false,
  copyable = true,
}) => {
  'use memo';
  const [, { tagAlias, getBaseImage, getBaseVersion }] = useBAIImageMetaData();
  const { token } = theme.useToken();
  const image = useFragment(
    graphql`
      fragment BAIImageNodeSimpleTagV2Fragment on ImageV2 {
        identity {
          canonicalName
          namespace
          architecture
        }
        metadata {
          tags {
            key
            value
          }
          labels {
            key
            value
          }
        }
      }
    `,
    imageFrgmt ?? null,
  );

  if (!image) return null;

  const fullName = image.identity?.canonicalName ?? '';
  const architecture = image.identity?.architecture ?? '';

  return (
    <BAIFlex direction="row" gap={'xs'} wrap="wrap">
      <BAIImageMetaIcon image={fullName} />
      <Typography.Text>{tagAlias(getBaseImage(fullName))}</Typography.Text>
      <Divider orientation="vertical" style={{ marginInline: 0 }} />
      <Typography.Text>{getBaseVersion(fullName)}</Typography.Text>
      <Divider orientation="vertical" style={{ marginInline: 0 }} />
      <Typography.Text>{architecture}</Typography.Text>
      {withoutTag ? null : (
        <>
          <Divider orientation="vertical" style={{ marginInline: 0 }} />
          {_.map(image.metadata?.tags, (tag, index) => {
            if (!tag) return null;
            const isCustomized = tag.key && _.includes(tag.key, 'customized_');
            const tagValue =
              (isCustomized
                ? _.find(image?.metadata?.labels, {
                    key: 'ai.backend.customized-image.name',
                  })?.value
                : tag?.value) || '';
            const aliasedTag = tag?.key
              ? tagAlias(tag.key + tagValue)
              : undefined;
            return tag?.key &&
              _.isEqual(
                aliasedTag,
                preserveDotStartCase(tag.key + tagValue),
              ) ? (
              <BAIDoubleTag
                key={`${tag.key}-${index}`}
                values={[
                  {
                    label: tagAlias(tag.key),
                    color: isCustomized ? 'cyan' : undefined,
                  },
                  {
                    label: tagValue,
                    color: isCustomized ? 'cyan' : undefined,
                  },
                ]}
              />
            ) : (
              <Tag
                key={`${tag.key}-${index}`}
                color={isCustomized ? 'cyan' : undefined}
              >
                {aliasedTag}
              </Tag>
            );
          })}
        </>
      )}
      {copyable && (
        <Typography.Text
          style={{ color: token.colorLink }}
          copyable={{
            text: fullName,
          }}
        />
      )}
    </BAIFlex>
  );
};

export default BAIImageNodeSimpleTagV2;
