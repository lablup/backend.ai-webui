import { BAIImportArtifactModalArtifactFragment$key } from '../../__generated__/BAIImportArtifactModalArtifactFragment.graphql';
import { BAIImportArtifactModalArtifactRevisionFragment$key } from '../../__generated__/BAIImportArtifactModalArtifactRevisionFragment.graphql';
// import { BAIImportArtifactModalImportArtifactsMutation } from '../../__generated__/BAIImportArtifactModalImportArtifactsMutation.graphql';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { Modal } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type ArtifactRevisionForModal = NonNullable<
  NonNullable<BAIImportArtifactModalArtifactRevisionFragment$key>[number]
>;

export type BAIImportArtifactModalProps = {
  selectedArtifactFrgmt:
    | BAIImportArtifactModalArtifactFragment$key
    | undefined
    | null;
  selectedArtifactRevisionFrgmt:
    | BAIImportArtifactModalArtifactRevisionFragment$key
    | [];
  onOk: () => void;
  onCancel: () => void;
};

const BAIImportArtifactModal = ({
  selectedArtifactFrgmt,
  selectedArtifactRevisionFrgmt,
  onOk,
  onCancel,
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
        }
      `,
      selectedArtifactRevisionFrgmt,
    );
  console.log(selectedArtifact, selectedArtifactRevision);

  // const [importArtifacts, isInflightImportArtifact] =
  //   useMutation<BAIImportArtifactModalImportArtifactsMutation>(graphql`
  //     mutation BAIImportArtifactModalImportArtifactsMutation(
  //       $input: ImportArtifactsInput!
  //     ) {
  //       importArtifacts(input: $input) {
  //         taskIds
  //         artifactRevisions {
  //           edges {
  //             node {
  //               id
  //             }
  //           }
  //         }
  //       }
  //     }
  //   `);

  return selectedArtifact && selectedArtifactRevision.length > 0 ? (
    <BAIUnmountAfterClose>
      <Modal
        title={t('comp:BAIImportArtifactModal.PullArtifact')}
        open={!_.isEmpty(selectedArtifact)}
        onOk={() => {
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
        okText="Pull"
        cancelText="Cancel"
        okButtonProps={{
          loading: false,
          disabled: false,
        }}
      >
        <div></div>
      </Modal>
    </BAIUnmountAfterClose>
  ) : null;
};

export default BAIImportArtifactModal;
