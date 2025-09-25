import { BAIArtifactStatusTagFragment$key } from '../../__generated__/BAIArtifactStatusTagFragment.graphql';
import BAITag from '../BAITag';
import { graphql, useFragment } from 'react-relay';

export interface BAIArtifactStatusTagProps {
  artifactRevisionFrgmt: BAIArtifactStatusTagFragment$key;
}

const BAIArtifactStatusTag = ({
  artifactRevisionFrgmt,
}: BAIArtifactStatusTagProps) => {
  const revision = useFragment<BAIArtifactStatusTagFragment$key>(
    graphql`
      fragment BAIArtifactStatusTagFragment on ArtifactRevision {
        status
      }
    `,
    artifactRevisionFrgmt,
  );

  return <BAITag>{revision.status}</BAITag>;
};

export default BAIArtifactStatusTag;
