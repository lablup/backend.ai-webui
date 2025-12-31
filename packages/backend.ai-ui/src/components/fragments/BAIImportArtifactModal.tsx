import { BAIImportArtifactModalArtifactFragment$key } from '../../__generated__/BAIImportArtifactModalArtifactFragment.graphql';
import {
  BAIImportArtifactModalArtifactRevisionFragment$data,
  BAIImportArtifactModalArtifactRevisionFragment$key,
} from '../../__generated__/BAIImportArtifactModalArtifactRevisionFragment.graphql';
import { BAIImportArtifactModalImportArtifactsMutation } from '../../__generated__/BAIImportArtifactModalImportArtifactsMutation.graphql';
import {
  convertToDecimalUnit,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
} from '../../helper';
import BAIFlex from '../BAIFlex';
import BAIText from '../BAIText';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { BAIColumnsType, BAITable } from '../Table';
import BAIArtifactDescriptions from './BAIArtifactDescriptions';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Alert, App, Modal, ModalProps, Tooltip } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type ArtifactRevision =
  NonNullable<BAIImportArtifactModalArtifactRevisionFragment$data>[number];

export type BAIImportArtifactModalArtifactFragmentKey =
  BAIImportArtifactModalArtifactFragment$key;
export type BAIImportArtifactModalArtifactRevisionFragmentKey =
  BAIImportArtifactModalArtifactRevisionFragment$key;

export interface BAIImportArtifactModalProps
  extends Omit<ModalProps, 'onOk' | 'onCancel'> {
  selectedArtifactFrgmt: BAIImportArtifactModalArtifactFragment$key | null;
  selectedArtifactRevisionFrgmt: BAIImportArtifactModalArtifactRevisionFragment$key;
  onOk: (
    e: React.MouseEvent<HTMLElement>,
    tasks: {
      taskId: string;
      version: string;
      artifact: {
        id: string;
        name: string;
      };
    }[],
  ) => void;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  connectionIds?: string[];
}

const BAIImportArtifactModal = ({
  selectedArtifactFrgmt,
  selectedArtifactRevisionFrgmt,
  onOk,
  onCancel,
  connectionIds,
  ...modalProps
}: BAIImportArtifactModalProps) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const selectedArtifact =
    useFragment<BAIImportArtifactModalArtifactFragment$key>(
      graphql`
        fragment BAIImportArtifactModalArtifactFragment on Artifact {
          id @required(action: THROW)
          name @required(action: THROW)
          ...BAIArtifactDescriptionsFragment
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

  const [importArtifacts, isInflightImportArtifacts] =
    useMutation<BAIImportArtifactModalImportArtifactsMutation>(graphql`
      mutation BAIImportArtifactModalImportArtifactsMutation(
        $input: ImportArtifactsInput!
        $connectionIds: [ID!]!
      ) {
        importArtifacts(input: $input) {
          tasks {
            taskId
            artifactRevision {
              version
            }
          }
          artifactRevisions {
            edges @appendEdge(connections: $connectionIds) {
              node {
                id
                status
              }
            }
          }
        }
      }
    `);

  const filteredSelectedRevisions = selectedArtifactRevision.filter(
    (revision) => revision.status === 'SCANNED',
  );

  const columns: BAIColumnsType<ArtifactRevision> = [
    {
      title: t('comp:BAIImportArtifactModal.Version'),
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => <BAIText monospace>{version}</BAIText>,
      width: '50%',
    },
    {
      title: t('comp:BAIImportArtifactModal.Size'),
      dataIndex: 'size',
      key: 'size',
      render: (size: string) => (
        <BAIText monospace>
          {size ? convertToDecimalUnit(size, 'auto')?.displayValue : 'N/A'}
        </BAIText>
      ),
    },
  ];

  return (
    <BAIUnmountAfterClose>
      <Modal
        title={t('comp:BAIImportArtifactModal.PullVersion')}
        centered
        onOk={(e) => {
          importArtifacts({
            variables: {
              input: {
                artifactRevisionIds: filteredSelectedRevisions.map((revision) =>
                  toLocalId(revision.id),
                ),
              },
              connectionIds: connectionIds ?? [],
            },
            onCompleted: (res, errors) => {
              if (errors && errors.length > 0) {
                errors.forEach((err) =>
                  message.error(
                    err.message ??
                      t('comp:BAIImportArtifactModal.FailedToPullVersions'),
                  ),
                );
                return;
              }
              message.success(
                t('comp:BAIImportArtifactModal.SuccessFullyPulled', {
                  count: res.importArtifacts.artifactRevisions.edges.length,
                }),
              );
              onOk(
                e,
                res.importArtifacts.tasks
                  .filter((task) => task.taskId != null)
                  .map((task) => ({
                    taskId: task.taskId!,
                    version: task.artifactRevision.version,
                    artifact: {
                      id: toLocalId(selectedArtifact?.id ?? ''),
                      name: selectedArtifact?.name ?? '',
                    },
                  })),
              );
            },
            onError: (err) => {
              message.error(
                err.message ??
                  t('comp:BAIImportArtifactModal.FailedToPullVersions'),
              );
            },
          });
        }}
        onCancel={(e) => {
          onCancel(e);
        }}
        okText={t('comp:BAIImportArtifactModal.Pull')}
        cancelText={t('general.button.Cancel')}
        okButtonProps={{
          loading: isInflightImportArtifacts,
          disabled:
            isInflightImportArtifacts || _.isEmpty(filteredSelectedRevisions),
        }}
        {...modalProps}
      >
        <BAIFlex direction="column" gap="md" align="stretch">
          {filteredSelectedRevisions.length !==
            selectedArtifactRevision.length && (
            <Alert
              icon={
                <Tooltip
                  title={t(
                    'comp:BAIImportArtifactModal.OnlySCANNEDVersionsCanBePulled',
                  )}
                >
                  <QuestionCircleFilled />
                </Tooltip>
              }
              showIcon
              title={t('comp:BAIImportArtifactModal.ExcludedVersions', {
                count:
                  selectedArtifactRevision.length -
                  filteredSelectedRevisions.length,
              })}
            />
          )}
          {selectedArtifact && (
            <BAIArtifactDescriptions artifactFrgmt={selectedArtifact} />
          )}
          <BAITable<ArtifactRevision>
            columns={filterOutEmpty(columns)}
            dataSource={filterOutNullAndUndefined(filteredSelectedRevisions)}
            pagination={{
              showSizeChanger: false,
            }}
          />
        </BAIFlex>
      </Modal>
    </BAIUnmountAfterClose>
  );
};

export default BAIImportArtifactModal;
