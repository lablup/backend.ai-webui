import { BAIActivateArtifactsModalArtifactsFragment$key } from '../../__generated__/BAIActivateArtifactsModalArtifactsFragment.graphql';
import { BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation } from '../../__generated__/BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation.graphql';
import { App } from '../../app-shim';
import { toLocalId } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIModal, { type BAIModalProps } from '../BAIModal';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { Text } from '@astryxdesign/core/Text';
import { graphql, useFragment, useMutation } from 'react-relay';

export type BAIActivateArtifactsModalArtifactsFragmentKey =
  BAIActivateArtifactsModalArtifactsFragment$key;

export interface BAIActivateArtifactsModalProps extends BAIModalProps {
  selectedArtifactsFragment: BAIActivateArtifactsModalArtifactsFragmentKey;
}

const BAIActivateArtifactsModal = ({
  selectedArtifactsFragment,
  onOk,
  onCancel,
  ...props
}: BAIActivateArtifactsModalProps) => {
  const { t } = useBAIi18n();
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
      <BAIModal
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
        <Text>
          {selectedArtifacts.length === 1
            ? t(
                'comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateOne',
                { name: selectedArtifacts[0].name },
              )
            : t(
                'comp:BAIActivateArtifactsModal.AreYouSureYouWantToActivateSome',
                { count: selectedArtifacts.length },
              )}
        </Text>
      </BAIModal>
    </BAIUnmountAfterClose>
  );
};

export default BAIActivateArtifactsModal;
