/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ContainerLogModalWithLazyQueryLoaderQuery } from '../../__generated__/ContainerLogModalWithLazyQueryLoaderQuery.graphql';
import ContainerLogModal from './ContainerLogModal';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ContainerLogModalWithLazyQueryLoader: React.FC<{
  sessionId?: string;
  open: boolean;
  loading: boolean;
  onRequestClose?: () => void;
}> = ({ sessionId, open, loading, onRequestClose }) => {
  const { compute_session_node } =
    useLazyLoadQuery<ContainerLogModalWithLazyQueryLoaderQuery>(
      graphql`
        query ContainerLogModalWithLazyQueryLoaderQuery(
          $sessionId: GlobalIDField!
        ) {
          compute_session_node(id: $sessionId) {
            ...ContainerLogModalFragment
          }
        }
      `,
      {
        sessionId,
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
