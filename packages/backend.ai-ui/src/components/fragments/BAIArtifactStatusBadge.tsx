import { BAIArtifactStatusBadgeFragment$key } from '../../__generated__/BAIArtifactStatusBadgeFragment.graphql';
import { Badge } from '@lablup/ui-common/Badge';
import { graphql, useFragment } from 'react-relay';

export interface BAIArtifactStatusBadgeProps {
  artifactRevisionFrgmt: BAIArtifactStatusBadgeFragment$key;
}

const BAIArtifactStatusBadge = ({
  artifactRevisionFrgmt,
}: BAIArtifactStatusBadgeProps) => {
  const revision = useFragment<BAIArtifactStatusBadgeFragment$key>(
    graphql`
      fragment BAIArtifactStatusBadgeFragment on ArtifactRevision {
        status
      }
    `,
    artifactRevisionFrgmt,
  );

  return <Badge variant="neutral" label={revision.status} />;
};

export default BAIArtifactStatusBadge;
