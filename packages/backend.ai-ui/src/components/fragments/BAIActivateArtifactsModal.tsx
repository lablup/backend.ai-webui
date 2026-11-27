import { BAIActivateArtifactsModalArtifactsFragment$key } from '../../__generated__/BAIActivateArtifactsModalArtifactsFragment.graphql';
import { BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation } from '../../__generated__/BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation.graphql';
import { App } from '../../app-shim';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIBulkErrorModal from '../BAIBulkErrorModal';
import BAIModal, { type BAIModalProps } from '../BAIModal';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { Text } from '@lablup/ui-common/Text';
import { useState } from 'react';
import { graphql, useFragment, useMutation } from 'react-relay';

export type BAIActivateArtifactsModalArtifactsFragmentKey =
  BAIActivateArtifactsModalArtifactsFragment$key;

export interface BAIActivateArtifactsModalProps extends Omit<
  BAIModalProps,
  'onOk'
> {
  selectedArtifactsFragment: BAIActivateArtifactsModalArtifactsFragmentKey;
  /** Called once the request settles; `failedArtifactIds` are the Relay ids of the artifacts that were not activated. */
  onOk?: (
    e: React.MouseEvent<HTMLButtonElement>,
    failedArtifactIds: string[],
  ) => void;
}

interface ArtifactActivationFailure {
  key: string;
  name: string;
  error: string;
}

const BAIActivateArtifactsModal = ({
  selectedArtifactsFragment,
  onOk,
  onCancel,
  ...props
}: BAIActivateArtifactsModalProps) => {
  const { t } = useBAIi18n();
  const { message } = App.useApp();
  const [failures, setFailures] = useState<ArtifactActivationFailure[]>([]);

  const selectedArtifacts =
    useFragment<BAIActivateArtifactsModalArtifactsFragment$key>(
      graphql`
        fragment BAIActivateArtifactsModalArtifactsFragment on Artifact
        @relay(plural: true) {
          id
          entityId
          name
        }
      `,
      selectedArtifactsFragment,
    );

  const [restoreArtifacts, isInflightRestoreArtifacts] =
    useMutation<BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation>(
      graphql`
        mutation BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation(
          $input: PartialBulkRestoreArtifactsInput!
        ) {
          partialBulkRestoreArtifacts(input: $input) {
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
      `,
    );

  const reportFailures = (
    e: React.MouseEvent<HTMLButtonElement>,
    items: ArtifactActivationFailure[],
  ) => {
    message.error(
      t('comp:BAIActivateArtifactsModal.SomeArtifactsFailedToActivate', {
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
          title={t('comp:BAIActivateArtifactsModal.ActivateArtifacts')}
          centered
          {...props}
          onOk={(e) => {
            restoreArtifacts({
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
                          'comp:BAIActivateArtifactsModal.FailedToActivateArtifacts',
                        ),
                    })),
                  );
                  return;
                }
                const { failed } = res.partialBulkRestoreArtifacts;
                if (failed.length === 0) {
                  message.success(
                    t('comp:BAIActivateArtifactsModal.SuccessfullyActivated'),
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
                        'comp:BAIActivateArtifactsModal.FailedToActivateArtifacts',
                      ),
                  })),
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
      <BAIBulkErrorModal<ArtifactActivationFailure>
        open={failures.length > 0}
        title={t(
          'comp:BAIActivateArtifactsModal.SomeArtifactsFailedToActivate',
          {
            count: failures.length,
          },
        )}
        columns={[
          {
            key: 'name',
            dataIndex: 'name',
            title: t('comp:BAIActivateArtifactsModal.Name'),
          },
          {
            key: 'error',
            dataIndex: 'error',
            title: t('comp:BAIActivateArtifactsModal.Error'),
          },
        ]}
        dataSource={failures}
        onRequestClose={() => setFailures([])}
      />
    </>
  );
};

export default BAIActivateArtifactsModal;
