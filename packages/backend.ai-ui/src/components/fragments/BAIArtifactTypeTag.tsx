import {
  ArtifactType,
  BAIArtifactTypeTagFragment$key,
} from '../../__generated__/BAIArtifactTypeTagFragment.graphql';
import { Tag } from 'antd';
import { Brain, Container, Package } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

const getTypeIcon = (type: ArtifactType, size: number = 16) => {
  const colorMap = {
    model: '#1677ff',
    package: '#52c41a',
    image: '#fa8c16',
  };

  switch (type) {
    case 'MODEL':
      return <Brain size={size} color={colorMap.model} />;
    case 'PACKAGE':
      return <Package size={size} color={colorMap.package} />;
    case 'IMAGE':
      return <Container size={size} color={colorMap.image} />;
    default:
      return null;
  }
};
export interface BAIArtifactTypeTagProps {
  artifactTypeFrgmt: BAIArtifactTypeTagFragment$key;
}

const BAIArtifactTypeTag = ({ artifactTypeFrgmt }: BAIArtifactTypeTagProps) => {
  const artifact = useFragment<BAIArtifactTypeTagFragment$key>(
    graphql`
      fragment BAIArtifactTypeTagFragment on Artifact {
        type
      }
    `,
    artifactTypeFrgmt,
  );
  return (
    <Tag style={{ display: 'inline-flex', alignItems: 'center' }}>
      {getTypeIcon(artifact.type)}&nbsp;{artifact.type}
    </Tag>
  );
};

export default BAIArtifactTypeTag;
