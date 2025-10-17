import { BAIDeactivateArtifactsModalArtifactsFragment$key } from '../../__generated__/BAIDeactivateArtifactsModalArtifactsFragment.graphql';
import { BAIDeactivateArtifactsModalDeleteArtifactsMutation } from '../../__generated__/BAIDeactivateArtifactsModalDeleteArtifactsMutation.graphql';
import { toLocalId } from '../../helper';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { App, Modal, ModalProps, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

export type BAIDeactivateArtifactsModalArtifactsFragmentKey =
  BAIDeactivateArtifactsModalArtifactsFragment$key;

export interface BAIDeactivateArtifactsModalProps extends ModalProps {
  selectedArtifactsFragment: BAIDeactivateArtifactsModalArtifactsFragmentKey;
}

const BAIDeactivateArtifactsModal = ({
  selectedArtifactsFragment,
  onOk,
  onCancel,
  ...modalProps
}: BAIDeactivateArtifactsModalProps) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const selectedArtifacts =
    useFragment<BAIDeactivateArtifactsModalArtifactsFragment$key>(
      graphql`
        fragment BAIDeactivateArtifactsModalArtifactsFragment on Artifact
        @relay(plural: true) {
          id
          name
        }
      `,
      selectedArtifactsFragment,
    );

  const [deleteArtifacts, isInflightDeleteArtifacts] =
    useMutation<BAIDeactivateArtifactsModalDeleteArtifactsMutation>(graphql`
      mutation BAIDeactivateArtifactsModalDeleteArtifactsMutation(
        $input: DeleteArtifactsInput!
      ) {
        deleteArtifacts(input: $input) {
          artifacts {
            id
            availability
          }
        }
      }
    `);

  return (
    <BAIUnmountAfterClose>
      <Modal
        title={t('comp:BAIDeactivateArtifactsModal.DeactivateArtifacts')}
        centered
        okText={t('comp:BAIDeactivateArtifactsModal.Deactivate')}
        onOk={(e) => {
          deleteArtifacts({
            variables: {
              input: {
                artifactIds: selectedArtifacts.map((a) => toLocalId(a.id)),
              },
            },
            onCompleted: (_res, errors) => {
              if (errors && errors.length > 0) {
                errors.forEach((err) =>
                  message.error(
                    err.message ??
                      t(
                        'comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts',
                      ),
                  ),
                );
                return;
              }
              message.success(
                t('comp:BAIDeactivateArtifactsModal.SuccessfullyDeactivated'),
              );
              onOk?.(e);
            },
            onError: (err) => {
              message.error(
                err.message ??
                  t(
                    'comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts',
                  ),
              );
            },
          });
        }}
        onCancel={(e) => {
          onCancel?.(e);
        }}
        okButtonProps={{ danger: true, loading: isInflightDeleteArtifacts }}
        {...modalProps}
      >
        <Typography.Text>
          {selectedArtifacts.length === 1
            ? t(
                'comp:BAIDeactivateArtifactsModal.AreYouSureYouWantToDeactivateOne',
                {
                  name: selectedArtifacts[0].name,
                },
              )
            : t(
                'comp:BAIDeactivateArtifactsModal.AreYouSureYouWantToDeactivateSome',
                {
                  count: selectedArtifacts.length,
                },
              )}
        </Typography.Text>
      </Modal>
    </BAIUnmountAfterClose>
  );
};

export default BAIDeactivateArtifactsModal;
