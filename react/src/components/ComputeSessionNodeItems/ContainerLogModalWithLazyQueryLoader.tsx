import { ContainerLogModalWithLazyQueryLoaderQuery } from '../../__generated__/ContainerLogModalWithLazyQueryLoaderQuery.graphql';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import ContainerLogModal from './ContainerLogModal';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ContainerLogModalWithLazyQueryLoader: React.FC<{
  sessionId?: string;
  open: boolean;
  loading: boolean;
  onRequestClose?: () => void;
}> = ({ sessionId, open, loading, onRequestClose }) => {
  const currentProject = useCurrentProjectValue();
  const { compute_session_node } =
    useLazyLoadQuery<ContainerLogModalWithLazyQueryLoaderQuery>(
      graphql`
        query ContainerLogModalWithLazyQueryLoaderQuery(
          $sessionId: GlobalIDField!
          $project_id: UUID!
        ) {
          compute_session_node(id: $sessionId, project_id: $project_id) {
            ...ContainerLogModalFragment
          }
        }
      `,
      {
        sessionId,
        project_id: currentProject.id,
      },
      {
        fetchPolicy: sessionId ? 'network-only' : 'store-only',
      },
    );

  return (
    <BAIUnmountAfterClose>
      <ContainerLogModal
        sessionFrgmt={compute_session_node || null}
        open={open}
        loading={loading}
        onCancel={() => {
          onRequestClose && onRequestClose();
        }}
      />
    </BAIUnmountAfterClose>
  );
};

export default ContainerLogModalWithLazyQueryLoader;
