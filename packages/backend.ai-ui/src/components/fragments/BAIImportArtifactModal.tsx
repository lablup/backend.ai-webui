import { BAIImportArtifactModalArtifactFragment$key } from '../../__generated__/BAIImportArtifactModalArtifactFragment.graphql';
import { BAIImportArtifactModalArtifactRevisionFragment$key } from '../../__generated__/BAIImportArtifactModalArtifactRevisionFragment.graphql';
import { filterOutNullAndUndefined } from '../../helper';
import BAIFlex from '../BAIFlex';
import BAILink from '../BAILink';
import BAIText from '../BAIText';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { Alert, List, Modal, ModalProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type BAIImportArtifactModalArtifactFragmentKey =
  BAIImportArtifactModalArtifactFragment$key;
export type BAIImportArtifactModalArtifactRevisionFragmentKey =
  BAIImportArtifactModalArtifactRevisionFragment$key;

export interface BAIImportArtifactModalProps
  extends Omit<ModalProps, 'onOk' | 'onCancel'> {
  selectedArtifactFrgmt: BAIImportArtifactModalArtifactFragment$key | null;
  selectedArtifactRevisionFrgmt: BAIImportArtifactModalArtifactRevisionFragment$key;
  onOk: () => void;
  onCancel: () => void;
}

const BAIImportArtifactModal = ({
  selectedArtifactFrgmt,
  selectedArtifactRevisionFrgmt,
  onOk,
  onCancel,
  ...modalProps
}: BAIImportArtifactModalProps) => {
  const { t } = useTranslation();

  const selectedArtifact =
    useFragment<BAIImportArtifactModalArtifactFragment$key>(
      graphql`
        fragment BAIImportArtifactModalArtifactFragment on Artifact {
          id
          name
          type
          description
          source {
            name
            url
          }
        }
      `,
      selectedArtifactFrgmt,
    );
  const selectedArtifactRevision =
    useFragment<BAIImportArtifactModalArtifactRevisionFragment$key>(
      graphql`
        fragment BAIImportArtifactModalArtifactRevisionFragment on ArtifactRevision
        @relay(plural: true) {
          id
          version
          size
          status
        }
      `,
      selectedArtifactRevisionFrgmt,
    );

  // const [importArtifacts, isInflightImportArtifacts] = useMutation(graphql`
  //   mutation BAIImportArtifactModalImportArtifactsMutation(
  //     $artifactId: ImportArtifactsInput!
  //   ) {
  //     importArtifacts(input: $artifactId) {
  //       taskIds
  //     }
  //   }
  // `);

  const hasPulledRevisions = selectedArtifactRevision.some(
    (revision) => revision.status === 'PULLED',
  );
  const filteredSelectedRevisions = hasPulledRevisions
    ? selectedArtifactRevision.filter(
        (revision) => revision.status === 'SCANNED',
      )
    : selectedArtifactRevision;

  return (
    <BAIUnmountAfterClose>
      <Modal
        title={t('comp:BAIImportArtifactModal.PullArtifact')}
        onOk={() => {
          onOk();
          // importArtifact({
          //   variables: {
          //     artifactId: selectedVersion.id,
          //   },
          //   onCompleted: () => {
          //     onOk();
          //   },
          //   onError: (error) => {
          //     onOk();
          //   },
          // });
        }}
        onCancel={() => {
          onCancel();
        }}
        okText={t('comp:BAIImportArtifactModal.Pull')}
        cancelText={t('general.button.Cancel')}
        okButtonProps={{
          loading: false,
          disabled: false,
        }}
        {...modalProps}
      >
        <BAIFlex direction="column" gap="md" align="stretch">
          {!hasPulledRevisions ? (
            <Alert
              type="info"
              showIcon
              message={t(
                'comp:BAIImportArtifactModal.PulledVersionsAreExcluded',
              )}
            />
          ) : null}
          <BAIFlex direction="column" gap="sm" align="start">
            <BAIText>
              <BAIText strong>{t('comp:BAIImportArtifactModal.Name')}:</BAIText>{' '}
              {selectedArtifact?.name}
            </BAIText>
            <BAIText>
              <BAIText strong>
                {t('comp:BAIImportArtifactModal.Description')}:
              </BAIText>{' '}
              {selectedArtifact?.description}
            </BAIText>
            <BAIText>
              <BAIText strong>{t('comp:BAIImportArtifactModal.Type')}:</BAIText>{' '}
              {selectedArtifact?.type}
            </BAIText>
            <BAIText>
              <BAIText strong>
                {t('comp:BAIImportArtifactModal.Source')}:
              </BAIText>{' '}
              <BAILink to={selectedArtifact?.source?.url ?? ''} target="_blank">
                {selectedArtifact?.source?.name}
              </BAILink>
            </BAIText>
          </BAIFlex>
          <List
            size="small"
            dataSource={filterOutNullAndUndefined(filteredSelectedRevisions)}
            renderItem={(item) => (
              <List.Item>
                <BAIText>
                  <BAIText monospace>{item.version}</BAIText>: {item.size}
                </BAIText>
              </List.Item>
            )}
            pagination={{
              pageSize: 5,
              showTotal: (total) => total,
            }}
          />
        </BAIFlex>
      </Modal>
    </BAIUnmountAfterClose>
  );
};

export default BAIImportArtifactModal;
