import {
  ArtifactType,
  BAIArtifactTypeTagFragment$key,
} from '../../__generated__/BAIArtifactTypeTagFragment.graphql';
import { Badge } from '@astryxdesign/core/Badge';
import { Brain, Container, Package } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

/**
 * Artifact type -> Astryx `Badge` variant (to-astryx phase 3, ticket A).
 *
 * The hard-coded hexes this replaces were antd's own palette presets
 * (`#1677ff` = `blue-6`, `#52c41a` = `green-6`, `#fa8c16` = `orange-6`), which
 * is exactly the category-colour axis `Badge`'s non-semantic variants carry.
 * The badge now tints the whole chip (icon + label) instead of only the icon —
 * that IS `Badge`'s category treatment, and it is the defaults-first answer to
 * "an arbitrary colour is inexpressible" (P5) rather than a per-file map.
 */
const TYPE_BADGE_VARIANT = {
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
    <Badge
      variant={
        TYPE_BADGE_VARIANT[artifact.type as keyof typeof TYPE_BADGE_VARIANT] ??
        'neutral'
      }
      icon={getTypeIcon(artifact.type)}
      label={artifact.type}
    />
  );
};

export default BAIArtifactTypeTag;
