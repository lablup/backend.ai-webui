import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import ContainerLogModal from './ContainerLogModal';
import { ContainerLogModalWithLazyQueryLoaderQuery } from './__generated__/ContainerLogModalWithLazyQueryLoaderQuery.graphql';
import graphql from 'babel-plugin-relay/macro';
import { useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';

const ContainerLogModalWithLazyQueryLoader: React.FC<{
  sessionId: string;
  afterClose?: () => void;
}> = ({ sessionId, afterClose }) => {
  const currentProject = useCurrentProjectValue();
  const [open, setOpen] = useState(true);
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
    );

  return (
    compute_session_node && (
      <ContainerLogModal
        maskTransitionName={open ? '' : undefined}
        transitionName={open ? '' : undefined}
        sessionFrgmt={compute_session_node}
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        afterClose={() => {
          afterClose?.();
        }}
      />
    )
  );
};

export default ContainerLogModalWithLazyQueryLoader;
