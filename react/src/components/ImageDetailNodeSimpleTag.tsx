import { ImageDetailNodeSimpleTagFragment$key } from '../__generated__/ImageDetailNodeSimpleTagFragment.graphql';
import { preserveDotStartCase } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import CopyableCodeText from './CopyableCodeText';
import DoubleTag from './DoubleTag';
import ImageMetaIcon from './ImageMetaIcon';
import { Divider, Tag, Typography, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface ImageDetailNodeSimpleTagProps {
  imageFrgmt: ImageDetailNodeSimpleTagFragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

const ImageDetailNodeSimpleTag: React.FC<ImageDetailNodeSimpleTagProps> = ({
  imageFrgmt,
  withoutTag = false,
  copyable = true,
}) => {
  const [, { tagAlias }] = useBackendAIImageMetaData();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const image = useFragment(
    graphql`
      fragment ImageDetailNodeSimpleTagFragment on ImageDetail {
        baseImageName
        version
        architecture
        name
        tags {
          key
          value
        }
        labels {
          key
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

  const fullName = `${image.registry}/${image.namespace}:${image.tag}@${image.architecture}`;
  const legacyFullImageString = `${image.registry}/${image.name}:${image.tag}@${image.architecture}`;
  const isSupportBaseImageName = baiClient.supports('base-image-name');

  return isSupportBaseImageName ? (
    <>
      <ImageMetaIcon
        image={fullName}
        style={{
          marginRight: token.marginXS,
        }}
      />
      <Typography.Text>{tagAlias(image.baseImageName || '')}</Typography.Text>
      <Divider type="vertical" />
      <Typography.Text>{image.version}</Typography.Text>
      <Divider type="vertical" />
      <Typography.Text>{image.architecture}</Typography.Text>
      {withoutTag ? null : (
        <>
          <Divider type="vertical" />
          {_.map(image.tags, (tag, index) => {
            if (!tag) return null;
            const isCustomized = tag.key && _.includes(tag.key, 'customized_');
            const tagValue =
              (isCustomized
                ? _.find(image?.labels, {
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
              <DoubleTag
                key={`${tag.key}-${index}`}
                values={[
                  {
                    label: tagAlias(tag.key),
                    color: isCustomized ? 'cyan' : 'blue',
                  },
                  {
                    label: tagValue,
                    color: isCustomized ? 'cyan' : 'blue',
                  },
                ]}
              />
            ) : (
              <Tag
                key={`${tag.key}-${index}`}
                color={isCustomized ? 'cyan' : 'blue'}
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
    </>
  ) : (
    <BAIFlex direction="row" gap={'xs'}>
      <ImageMetaIcon image={legacyFullImageString || null} />
      <CopyableCodeText>{legacyFullImageString}</CopyableCodeText>
    </BAIFlex>
  );
};

export default ImageDetailNodeSimpleTag;
