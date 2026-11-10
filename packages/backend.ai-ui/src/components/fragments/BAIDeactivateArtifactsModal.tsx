import { BAIDeactivateArtifactsModalArtifactsFragment$key } from '../../__generated__/BAIDeactivateArtifactsModalArtifactsFragment.graphql';
import { BAIDeactivateArtifactsModalDeleteArtifactsMutation } from '../../__generated__/BAIDeactivateArtifactsModalDeleteArtifactsMutation.graphql';
import { App } from '../../app-shim';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIBulkErrorModal from '../BAIBulkErrorModal';
import BAIModal, { type BAIModalProps } from '../BAIModal';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { Text } from '@lablup/ui-common/Text';
import { useState } from 'react';
import { graphql, useFragment, useMutation } from 'react-relay';

export type BAIDeactivateArtifactsModalArtifactsFragmentKey =
  BAIDeactivateArtifactsModalArtifactsFragment$key;

export interface BAIDeactivateArtifactsModalProps extends Omit<
  BAIModalProps,
  'onOk'
> {
  selectedArtifactsFragment: BAIDeactivateArtifactsModalArtifactsFragmentKey;
  /** Called once the request settles; `failedArtifactIds` are the Relay ids of the artifacts that were not deactivated. */
  onOk?: (
    e: React.MouseEvent<HTMLButtonElement>,
    failedArtifactIds: string[],
  ) => void;
}

interface ArtifactDeactivationFailure {
  key: string;
  name: string;
  error: string;
}

const BAIDeactivateArtifactsModal = ({
  selectedArtifactsFragment,
  onOk,
  onCancel,
  ...modalProps
}: BAIDeactivateArtifactsModalProps) => {
  const { t } = useBAIi18n();
  const { message } = App.useApp();
  const selectedArtifacts =
    useFragment<BAIDeactivateArtifactsModalArtifactsFragment$key>(
      graphql`
        fragment BAIDeactivateArtifactsModalArtifactsFragment on Artifact
        @relay(plural: true) {
          id
          entityId
          name
        }
      `,
      selectedArtifactsFragment,
    );

  const [deleteArtifacts, isInflightDeleteArtifacts] =
    useMutation<BAIDeactivateArtifactsModalDeleteArtifactsMutation>(graphql`
      mutation BAIDeactivateArtifactsModalDeleteArtifactsMutation(
        $input: PartialBulkDeleteArtifactsInput!
      ) {
        partialBulkDeleteArtifacts(input: $input) {
          successes {
            id
            availability
          }
          failed {
            id
            message
          }
        }
      }
    `);
  const [failures, setFailures] = useState<ArtifactDeactivationFailure[]>([]);

  const reportFailures = (
    e: React.MouseEvent<HTMLButtonElement>,
    items: ArtifactDeactivationFailure[],
  ) => {
    message.error(
      t('comp:BAIDeactivateArtifactsModal.SomeArtifactsFailedToDeactivate', {
        count: items.length,
      }),
    );
    setFailures(items);
    onOk?.(
      e,
      items.map((item) => item.key),
    );
  };

  return (
    <>
      <BAIUnmountAfterClose>
        <BAIModal
          title={t('comp:BAIDeactivateArtifactsModal.DeactivateArtifacts')}
          centered
          okText={t('comp:BAIDeactivateArtifactsModal.Deactivate')}
          onOk={(e) => {
            deleteArtifacts({
              variables: {
                input: {
                  ids: selectedArtifacts.map((a) => a.entityId),
                },
              },
              onCompleted: (res, errors) => {
                if (errors && errors.length > 0) {
                  reportFailures(
                    e,
                    selectedArtifacts.map((a) => ({
                      key: a.id,
                      name: a.name,
                      error:
                        errors[0]?.message ??
                        t(
                          'comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts',
                        ),
                    })),
                  );
                  return;
                }
                const { failed } = res.partialBulkDeleteArtifacts;
                if (failed.length === 0) {
                  message.success(
                    t(
                      'comp:BAIDeactivateArtifactsModal.SuccessfullyDeactivated',
                    ),
                  );
                  onOk?.(e, []);
                  return;
                }
                reportFailures(
                  e,
                  failed.map((failure) => {
                    const artifact = selectedArtifacts.find(
                      (a) => a.entityId === failure.id,
                    );
                    return {
                      key: artifact?.id ?? failure.id,
                      name: artifact?.name ?? failure.id,
                      error: failure.message,
                    };
                  }),
                );
              },
              onError: (err) => {
                // A rejected request counts every requested artifact as failed.
                reportFailures(
                  e,
                  selectedArtifacts.map((a) => ({
                    key: a.id,
                    name: a.name,
                    error:
                      err.message ??
                      t(
                        'comp:BAIDeactivateArtifactsModal.FailedToDeactivateArtifacts',
                      ),
                  })),
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
          <Text>
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
          </Text>
        </BAIModal>
      </BAIUnmountAfterClose>
      <BAIBulkErrorModal<ArtifactDeactivationFailure>
        open={failures.length > 0}
        title={t(
          'comp:BAIDeactivateArtifactsModal.SomeArtifactsFailedToDeactivate',
          {
            count: failures.length,
          },
        )}
        columns={[
          {
            key: 'name',
            dataIndex: 'name',
            title: t('comp:BAIDeactivateArtifactsModal.Name'),
          },
          {
            key: 'error',
            dataIndex: 'error',
            title: t('comp:BAIDeactivateArtifactsModal.Error'),
          },
        ]}
        dataSource={failures}
        onRequestClose={() => setFailures([])}
      />
    </>
  );
};

export default BAIDeactivateArtifactsModal;
