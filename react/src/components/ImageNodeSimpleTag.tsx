import { preserveDotStartCase } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import CopyableCodeText from './CopyableCodeText';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
import ImageMetaIcon from './ImageMetaIcon';
import { ImageNodeSimpleTagFragment$key } from './__generated__/ImageNodeSimpleTagFragment.graphql';
import { Divider, Tag, Typography, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useFragment } from 'react-relay';

interface ImageNodeSimpleTagProps {
  imageFrgmt: ImageNodeSimpleTagFragment$key | null;
  copyable?: boolean;
}

const ImageNodeSimpleTag: React.FC<ImageNodeSimpleTagProps> = ({
  imageFrgmt,
  copyable = true,
}) => {
  const [, { tagAlias }] = useBackendAIImageMetaData();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const image = useFragment(
    graphql`
      fragment ImageNodeSimpleTagFragment on ImageNode {
        base_image_name @since(version: "24.12.0")
        version @since(version: "24.12.0")
        architecture
        name
        tags @since(version: "24.12.0") {
          key
          value
        }
        labels {
          key @required(action: NONE)
          value
        }
        registry
        namespace @since(version: "24.12.0")
        tag
      }
    `,
    imageFrgmt,
  );

  if (!image) return null;

  const fullName = `${image.registry}/${image.namespace}:${image.tag}@${image.architecture}`;
  const legacyFullImageString = `${image.registry}/${image.name}:${image.tag}@${image.architecture}`;
  const isSupportBaseImageName =
    baiClient.isManagerVersionCompatibleWith('24.12.0');

  return isSupportBaseImageName ? (
    <>
      <ImageMetaIcon
        image={fullName}
        style={{
          marginRight: token.marginXS,
        }}
      />
      <Typography.Text>{tagAlias(image.base_image_name || '')}</Typography.Text>
      <Divider type="vertical" />
      <Typography.Text>{image.version}</Typography.Text>
      <Divider type="vertical" />
      <Typography.Text>{image.architecture}</Typography.Text>
      <Divider type="vertical" />
      {_.map(image.tags, (tag) => {
        const isCustomized = tag?.key && _.includes(tag.key, 'customized_');
        const tagValue =
          (isCustomized
            ? _.find(image?.labels, {
                key: 'ai.backend.customized-image.name',
              })?.value
            : tag?.value) || '';
        const aliasedTag = tag?.key ? tagAlias(tag.key + tagValue) : undefined;
        return tag?.key &&
          _.isEqual(aliasedTag, preserveDotStartCase(tag.key + tagValue)) ? (
          <DoubleTag
            key={tag.key}
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
          <Tag color={isCustomized ? 'cyan' : 'blue'}>{aliasedTag}</Tag>
        );
      })}
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
    <Flex direction="row" gap={'xs'}>
      <ImageMetaIcon image={legacyFullImageString || null} />
      <CopyableCodeText>{legacyFullImageString}</CopyableCodeText>
    </Flex>
  );
};

export default ImageNodeSimpleTag;
