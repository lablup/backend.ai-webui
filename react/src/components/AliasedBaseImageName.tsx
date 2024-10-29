import { useBackendAIImageMetaData } from '../hooks';
import TextHighlighter from './TextHighlighter';
import { AliasedBaseImageNameFragment$key } from './__generated__/AliasedBaseImageNameFragment.graphql';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useFragment } from 'react-relay';

interface AliasedBaseImageNameProps {
  imageFrgmt?: AliasedBaseImageNameFragment$key | null;
  highlightKeyword?: string;
}

const AliasedBaseImageName: React.FC<AliasedBaseImageNameProps> = ({
  imageFrgmt,
  highlightKeyword,
}) => {
  const images = useFragment(
    graphql`
      fragment AliasedBaseImageNameFragment on ImageNode {
        base_image_name @since(version: "24.09.1.")
      }
    `,
    imageFrgmt,
  );

  const [, { tagAlias }] = useBackendAIImageMetaData();

  return (
    <TextHighlighter keyword={highlightKeyword}>
      {tagAlias(images?.base_image_name ?? '')}
    </TextHighlighter>
  );
};

export default AliasedBaseImageName;
