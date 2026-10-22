import {
  ArtifactType,
  BAIArtifactTypeTokenFragment$key,
} from '../../__generated__/BAIArtifactTypeTokenFragment.graphql';
import { Token } from '@lablup/ui-common/Token';
import { Brain, Container, Package } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

const TYPE_TOKEN_COLOR = {
  MODEL: 'blue',
  PACKAGE: 'green',
  IMAGE: 'orange',
} as const;

const getTypeIcon = (type: ArtifactType, size: number = 16) => {
  switch (type) {
    case 'MODEL':
      return <Brain size={size} />;
    case 'PACKAGE':
      return <Package size={size} />;
    case 'IMAGE':
      return <Container size={size} />;
    default:
      return null;
  }
};
export interface BAIArtifactTypeTokenProps {
  artifactTypeFrgmt: BAIArtifactTypeTokenFragment$key;
}

const BAIArtifactTypeToken = ({
  artifactTypeFrgmt,
}: BAIArtifactTypeTokenProps) => {
  const artifact = useFragment<BAIArtifactTypeTokenFragment$key>(
    graphql`
      fragment BAIArtifactTypeTokenFragment on Artifact {
        type
      }
    `,
    artifactTypeFrgmt,
  );
  return (
    <Token
      color={
        TYPE_TOKEN_COLOR[artifact.type as keyof typeof TYPE_TOKEN_COLOR] ??
        'default'
      }
      icon={getTypeIcon(artifact.type)}
      label={artifact.type}
    />
  );
};

export default BAIArtifactTypeToken;
