import { BAIActivateArtifactsModalArtifactsFragment$key } from '../../__generated__/BAIActivateArtifactsModalArtifactsFragment.graphql';
import { BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation } from '../../__generated__/BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation.graphql';
import { toLocalId } from '../../helper';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { App, Modal, ModalProps, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

export type BAIActivateArtifactsModalArtifactsFragmentKey =
  BAIActivateArtifactsModalArtifactsFragment$key;

export interface BAIActivateArtifactsModalProps extends ModalProps {
  selectedArtifactsFragment: BAIActivateArtifactsModalArtifactsFragmentKey;
}

const BAIActivateArtifactsModal = ({
  selectedArtifactsFragment,
  onOk,
  onCancel,
  ...props
}: BAIActivateArtifactsModalProps) => {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const selectedArtifacts =
    useFragment<BAIActivateArtifactsModalArtifactsFragment$key>(
      graphql`
        fragment BAIActivateArtifactsModalArtifactsFragment on Artifact
        @relay(plural: true) {
          id
          name
        }
      `,
      selectedArtifactsFragment,
    );

  const [restoreArtifacts, isInflightRestoreArtifacts] =
    useMutation<BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation>(
      graphql`
        mutation BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation(
          $input: RestoreArtifactsInput!
        ) {
          restoreArtifacts(input: $input) {
            artifacts {
              id
              availability
            }
          }
        }
      `,
    );

  return (
    <BAIUnmountAfterClose>
      <Modal
        title={t('comp:BAIActivateArtifactsModal.ActivateArtifacts')}
        centered
        {...props}
        onOk={(e) => {
          restoreArtifacts({
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
                        'comp:BAIActivateArtifactsModal.FailedToActivateArtifacts',
                      ),
                  ),
                );
                return;
              }
              message.success(
                t('comp:BAIActivateArtifactsModal.SuccessfullyActivated'),
              );
              onOk?.(e);
            },
            onError: (err) => {
              message.error(
                err.message ??
                  t('comp:BAIActivateArtifactsModal.FailedToActivateArtifacts'),
              );
            },
          });
        }}
        onCancel={(e) => {
          onCancel?.(e);
        }}
        okText={t('comp:BAIActivateArtifactsModal.Activate')}
        okButtonProps={{ loading: isInflightRestoreArtifacts }}
      >
        <Typography.Text>
          {selectedArtifacts.length === 1
            ? t(
                'comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateOne',
                { name: selectedArtifacts[0].name },
              )
            : t(
                'comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateSome',
                { count: selectedArtifacts.length },
              )}
        </Typography.Text>
      </Modal>
    </BAIUnmountAfterClose>
  );
};

export default BAIActivateArtifactsModal;
