import { BAIDeleteArtifactModalArtifactFragment$key } from '../../__generated__/BAIDeleteArtifactModalArtifactFragment.graphql';
import {
  BAIDeleteArtifactModalArtifactRevisionFragment$data,
  BAIDeleteArtifactModalArtifactRevisionFragment$key,
} from '../../__generated__/BAIDeleteArtifactModalArtifactRevisionFragment.graphql';
import { BAIDeleteArtifactModalCleanupVersionMutation } from '../../__generated__/BAIDeleteArtifactModalCleanupVersionMutation.graphql';
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
import { Alert, message, Modal, ModalProps, Tooltip } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type ArtifactRevision =
  NonNullable<BAIDeleteArtifactModalArtifactRevisionFragment$data>[number];

export type BAIDeleteArtifactModalArtifactFragmentKey =
  BAIDeleteArtifactModalArtifactFragment$key;

export type BAIDeleteArtifactModalArtifactRevisionFragmentKey =
  BAIDeleteArtifactModalArtifactRevisionFragment$key;

export interface BAIDeleteArtifactModalProps
  extends Omit<ModalProps, 'onOk' | 'onCancel'> {
  selectedArtifactFrgmt: BAIDeleteArtifactModalArtifactFragment$key | null;
  selectedArtifactRevisionFrgmt: BAIDeleteArtifactModalArtifactRevisionFragment$key;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
}

const BAIDeleteArtifactModal = ({
  selectedArtifactFrgmt,
  selectedArtifactRevisionFrgmt,
  onOk,
  onCancel,
  ...modalProps
}: BAIDeleteArtifactModalProps) => {
  const { t } = useTranslation();

  const [cleanupVersion, isInflightCleanupVersion] =
    useMutation<BAIDeleteArtifactModalCleanupVersionMutation>(graphql`
      mutation BAIDeleteArtifactModalCleanupVersionMutation(
        $input: CleanupArtifactRevisionsInput!
      ) {
        cleanupArtifactRevisions(input: $input) {
          artifactRevisions {
            edges {
              node {
                status
              }
            }
          }
        }
      }
    `);
  const selectedArtifact =
    useFragment<BAIDeleteArtifactModalArtifactFragment$key>(
      graphql`
        fragment BAIDeleteArtifactModalArtifactFragment on Artifact {
          id
          ...BAIArtifactDescriptionsFragment
        }
      `,
      selectedArtifactFrgmt,
    );

  const selectedArtifactRevision =
    useFragment<BAIDeleteArtifactModalArtifactRevisionFragment$key>(
      graphql`
        fragment BAIDeleteArtifactModalArtifactRevisionFragment on ArtifactRevision
        @relay(plural: true) {
          id
          version
          size
          status
        }
      `,
      selectedArtifactRevisionFrgmt,
    );

  const filteredSelectedRevisions = selectedArtifactRevision.filter(
    (revision) =>
      revision.status !== 'PULLING' && revision.status !== 'SCANNED',
  );

  const columns: BAIColumnsType<ArtifactRevision> = [
    {
      title: t('comp:BAIDeleteArtifactModal.Version'),
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => <BAIText monospace>{version}</BAIText>,
      width: '50%',
    },
    {
      title: t('comp:BAIDeleteArtifactModal.Size'),
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
        title={t('comp:BAIDeleteArtifactModal.RemoveVersions')}
        centered
        onOk={(e) => {
          cleanupVersion({
            variables: {
              input: {
                artifactRevisionIds: filteredSelectedRevisions.map((revision) =>
                  toLocalId(revision.id),
                ),
              },
            },
            onCompleted: (res, errors) => {
              if (errors && errors.length > 0) {
                errors.forEach((err) => {
                  message.error(
                    err.message ??
                      t('comp:BAIDeleteArtifactModal.FailedToRemoveVersions'),
                  );
                });
                return;
              }
              message.success(
                t('comp:BAIDeleteArtifactModal.SuccessFullyRemoved', {
                  count:
                    res.cleanupArtifactRevisions.artifactRevisions.edges.length,
                }),
              );
              onOk(e);
            },
            onError: (err) => {
              message.error(
                err.message ??
                  t('comp:BAIDeleteArtifactModal.FailedToRemoveVersions'),
              );
            },
          });
        }}
        onCancel={(e) => {
          onCancel(e);
        }}
        okText={t('general.button.Remove')}
        cancelText={t('general.button.Cancel')}
        okButtonProps={{
          danger: true,
          loading: isInflightCleanupVersion,
          disabled:
            _.isEmpty(filteredSelectedRevisions) || isInflightCleanupVersion,
        }}
        {...modalProps}
      >
        <BAIFlex direction="column" gap={'sm'} align="stretch">
          {filteredSelectedRevisions.length !==
          selectedArtifactRevision.length ? (
            <Alert
              icon={
                <Tooltip
                  title={t(
                    'comp:BAIDeleteArtifactModal.OnlyVersionsNotInPULLINGOrSCANNED',
                  )}
                >
                  <QuestionCircleFilled />
                </Tooltip>
              }
              showIcon
              message={t('comp:BAIDeleteArtifactModal.ExcludedVersions', {
                count:
                  selectedArtifactRevision.length -
                  filteredSelectedRevisions.length,
              })}
            />
          ) : null}
          {selectedArtifact && (
            <BAIArtifactDescriptions artifactFrgmt={selectedArtifact} />
          )}
          <BAITable<ArtifactRevision>
            columns={filterOutEmpty(columns)}
            dataSource={filterOutNullAndUndefined(selectedArtifactRevision)}
            pagination={{
              showSizeChanger: false,
            }}
          />
        </BAIFlex>
      </Modal>
    </BAIUnmountAfterClose>
  );
};

export default BAIDeleteArtifactModal;
