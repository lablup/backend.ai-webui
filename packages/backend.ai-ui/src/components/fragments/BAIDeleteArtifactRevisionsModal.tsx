import { BAIDeleteArtifactRevisionsModalArtifactFragment$key } from '../../__generated__/BAIDeleteArtifactRevisionsModalArtifactFragment.graphql';
import {
  BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$data,
  BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key,
} from '../../__generated__/BAIDeleteArtifactRevisionsModalArtifactRevisionFragment.graphql';
import { BAIDeleteArtifactRevisionsModalCleanupVersionMutation } from '../../__generated__/BAIDeleteArtifactRevisionsModalCleanupVersionMutation.graphql';
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
import { Alert, message, Modal, theme, Tooltip, type ModalProps } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type ArtifactRevision =
  NonNullable<BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$data>[number];

export type BAIDeleteArtifactRevisionsModalArtifactFragmentKey =
  BAIDeleteArtifactRevisionsModalArtifactFragment$key;

export type BAIDeleteArtifactRevisionsModalArtifactRevisionFragmentKey =
  BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key;

export interface BAIDeleteArtifactRevisionsModalProps
  extends Omit<ModalProps, 'onOk' | 'onCancel'> {
  selectedArtifactFrgmt: BAIDeleteArtifactRevisionsModalArtifactFragment$key | null;
  selectedArtifactRevisionFrgmt: BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
}

const BAIDeleteArtifactRevisionsModal = ({
  selectedArtifactFrgmt,
  selectedArtifactRevisionFrgmt,
  onOk,
  onCancel,
  ...modalProps
}: BAIDeleteArtifactRevisionsModalProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [cleanupVersion, isInflightCleanupVersion] =
    useMutation<BAIDeleteArtifactRevisionsModalCleanupVersionMutation>(graphql`
      mutation BAIDeleteArtifactRevisionsModalCleanupVersionMutation(
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
    useFragment<BAIDeleteArtifactRevisionsModalArtifactFragment$key>(
      graphql`
        fragment BAIDeleteArtifactRevisionsModalArtifactFragment on Artifact {
          id
          ...BAIArtifactDescriptionsFragment
        }
      `,
      selectedArtifactFrgmt,
    );

  const selectedArtifactRevision =
    useFragment<BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key>(
      graphql`
        fragment BAIDeleteArtifactRevisionsModalArtifactRevisionFragment on ArtifactRevision
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
                  <QuestionCircleFilled
                    style={{
                      color: token.colorInfo,
                      marginRight: token.marginXS,
                    }}
                  />
                </Tooltip>
              }
              showIcon
              title={t('comp:BAIDeleteArtifactModal.ExcludedVersions', {
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

export default BAIDeleteArtifactRevisionsModal;
