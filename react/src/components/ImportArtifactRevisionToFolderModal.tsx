/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImportArtifactRevisionToFolderModalArtifactRevisionFragment$key } from '../__generated__/ImportArtifactRevisionToFolderModalArtifactRevisionFragment.graphql';
import { ImportArtifactRevisionToFolderModalModelStoreProjectsFragment$key } from '../__generated__/ImportArtifactRevisionToFolderModalModelStoreProjectsFragment.graphql';
import { ImportArtifactRevisionToFolderModalMutation } from '../__generated__/ImportArtifactRevisionToFolderModalMutation.graphql';
import { toProjectContext } from '../types/projectContext';
import FolderCreateModalV2 from './FolderCreateModalV2';
import { useToggle } from 'ahooks';
import { Alert, App, Form, FormInstance, theme, Tooltip } from 'antd';
import {
  BAIButton,
  BAIModalProps,
  BAIVFolderSelectRef,
  BAIModal,
  BAIFlex,
  BAISelect,
  BAIVFolderSelect,
  toGlobalId,
  convertToUUID,
  useBAILogger,
  toLocalId,
  mergeFilterValues,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation, useFragment } from 'react-relay';

export interface ImportArtifactRevisionToFolderModalProps extends Omit<
  BAIModalProps,
  'onOk'
> {
  selectedArtifactRevisionFrgmt: ImportArtifactRevisionToFolderModalArtifactRevisionFragment$key;
  /**
   * Every model-store project the page resolved (ADR-0001, FR-3415 —
   * derive-from-resource tier). An artifact import always lands in the model
   * store, never in the ambient current project, so the destination is picked
   * from this list. Previously the modal read the ambient project and offered
   * a "Change Project" confirmation that WROTE the global selection; both are
   * gone. When several model-store projects exist the in-modal selector is
   * how the user chooses between them.
   */
  modelStoreProjectsFrgmt?: ImportArtifactRevisionToFolderModalModelStoreProjectsFragment$key;
  onOk?: (
    e: React.MouseEvent<HTMLElement>,
    tasks: {
      taskId: string;
      version: string;
      artifact: {
        id: string;
        name: string;
      };
    }[],
    vfolderId: string,
  ) => void;
}

type ImportArtifactRevisionToFolderModalInput = {
  vfolderId: string;
};

const ImportArtifactRevisionToFolderModal = ({
  selectedArtifactRevisionFrgmt,
  modelStoreProjectsFrgmt,
  onOk,
  ...modalProps
}: ImportArtifactRevisionToFolderModalProps) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const formRef =
    useRef<FormInstance<ImportArtifactRevisionToFolderModalInput>>(null);
  const vfolderSelectRef = useRef<BAIVFolderSelectRef>(null);
  const [isOpenCreateModal, { toggle: toggleIsOpenCreateModal }] =
    useToggle(false);

  const { logger } = useBAILogger();

  const selectedArtifactRevisions = useFragment(
    graphql`
      fragment ImportArtifactRevisionToFolderModalArtifactRevisionFragment on ArtifactRevision
      @relay(plural: true) {
        id @required(action: THROW)
      }
    `,
    selectedArtifactRevisionFrgmt,
  );

  const modelStoreProjects = useFragment(
    graphql`
      fragment ImportArtifactRevisionToFolderModalModelStoreProjectsFragment on Group
      @relay(plural: true) {
        id
        name
      }
    `,
    modelStoreProjectsFrgmt,
  );

  const modelStoreProjectOptions = _.map(
    _.filter(modelStoreProjects, (project) => !!project?.id),
    (project) => ({
      label: project.name,
      value: project.id as string,
    }),
  );

  // ADR-0001: the destination project comes exclusively from the model-store
  // projects the page passed in. `undefined` falls back to the first one, so a
  // single-model-store deployment (the common case) needs no interaction while
  // the choice stays visible on screen.
  const [pickedProjectId, setPickedProjectId] = useState<string | undefined>();
  const destinationProject =
    _.find(modelStoreProjects, (project) => project?.id === pickedProjectId) ??
    modelStoreProjects?.[0];

  const [importArtifacts, isInflightImportArtifacts] =
    useMutation<ImportArtifactRevisionToFolderModalMutation>(graphql`
      mutation ImportArtifactRevisionToFolderModalMutation(
        $input: ImportArtifactsInput!
      ) {
        importArtifacts(input: $input) {
          artifactRevisions {
            count
          }
          tasks {
            taskId
            artifactRevision {
              id
              version
              artifact {
                id
                name
              }
            }
          }
        }
      }
    `);

  const selectedArtifactRevisionIds = _.map(
    selectedArtifactRevisions,
    (revision) => revision.id,
  );

  return (
    <>
      <BAIModal
        title={t('importArtifactRevisionToFolderModal.ImportToFolder')}
        okText={t('importArtifactRevisionToFolderModal.Import')}
        centered
        destroyOnHidden
        {...modalProps}
        okButtonProps={{
          loading: isInflightImportArtifacts,
          disabled:
            isInflightImportArtifacts || _.isEmpty(selectedArtifactRevisions),
        }}
        onOk={(e) => {
          formRef.current
            ?.validateFields()
            .then((values) => {
              if (_.isEmpty(selectedArtifactRevisions)) {
                message.error(
                  t('importArtifactRevisionToFolderModal.NoArtifactsSelected'),
                );
                return;
              }

              importArtifacts({
                variables: {
                  input: {
                    artifactRevisionIds: _.map(
                      selectedArtifactRevisionIds,
                      (id) => toLocalId(id),
                    ),
                    vfolderId: values.vfolderId
                      ? toLocalId(values.vfolderId)
                      : null,
                    options: {
                      force: true,
                    },
                  },
                },
                onCompleted: (res, errors) => {
                  if (errors && errors.length > 0) {
                    errors.forEach((err) =>
                      message.error(
                        err.message ??
                          t(
                            'importArtifactRevisionToFolderModal.FailedToImport',
                          ),
                      ),
                    );
                    return;
                  }
                  const importArtifacts = res.importArtifacts;
                  if (!importArtifacts) {
                    message.error(
                      t('importArtifactRevisionToFolderModal.FailedToImport'),
                    );
                    return;
                  }

                  if (importArtifacts.artifactRevisions?.count > 0) {
                    message.success(
                      t(
                        'importArtifactRevisionToFolderModal.SuccessfullyImported',
                      ),
                    );

                    const tasks = importArtifacts.tasks
                      .filter((task) => task.taskId != null)
                      .map((task) => {
                        const artifact = task.artifactRevision.artifact!;
                        return {
                          taskId: task.taskId!,
                          version: task.artifactRevision.version,
                          artifact: {
                            id: toLocalId(artifact.id ?? ''),
                            name: artifact.name ?? '',
                          },
                        };
                      });

                    onOk?.(e, tasks, values.vfolderId);
                  } else {
                    message.error(
                      t('importArtifactRevisionToFolderModal.FailedToImport'),
                    );
                  }
                },
                onError: (error) => {
                  message.error(
                    error.message ??
                      t('importArtifactRevisionToFolderModal.FailedToImport'),
                  );
                },
              });
            })
            .catch((error) => {
              logger.error(
                'ImportArtifactRevisionToFolderModal: Form validation failed',
                {
                  error,
                },
              );
            });
        }}
      >
        <Form
          ref={formRef}
          layout="vertical"
          preserve={false}
          validateTrigger={['onChange', 'onBlur']}
        >
          <BAIFlex direction="column" align="stretch">
            <Alert
              type="warning"
              title={t('importArtifactRevisionToFolderModal.OverwriteWarning')}
              showIcon
              style={{ marginBottom: token.marginMD }}
            />
            {/* The destination project is chosen here, in the modal — the
                admin surface below must never mutate the global selection. */}
            <Form.Item
              label={t('importArtifactRevisionToFolderModal.ModelStoreProject')}
            >
              <BAISelect
                data-testid="import-artifact-model-store-project-select"
                value={destinationProject?.id ?? undefined}
                options={modelStoreProjectOptions}
                disabled={_.isEmpty(modelStoreProjectOptions)}
                status={
                  _.isEmpty(modelStoreProjectOptions) ? 'error' : undefined
                }
                tooltip={
                  _.isEmpty(modelStoreProjectOptions)
                    ? t(
                        'importArtifactRevisionToFolderModal.FailedToRetrieveModelStoreProject',
                      )
                    : undefined
                }
                popupMatchSelectWidth={false}
                onChange={(value) => {
                  setPickedProjectId(value as string);
                  // The folder list is scoped to the destination project;
                  // clear a selection made under the previous one.
                  formRef.current?.setFieldsValue({ vfolderId: undefined });
                }}
              />
            </Form.Item>
            <Form.Item
              label={t(
                'importArtifactRevisionToFolderModal.FolderMountForModelStore',
              )}
              name="vfolderId"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <BAIFlex gap="xs" align="center">
                <Form.Item name="vfolderId" noStyle>
                  <BAIVFolderSelect
                    ref={vfolderSelectRef}
                    excludeDeleted
                    // Disabled rather than unfiltered without a destination:
                    // dropping the `group` predicate would list every
                    // group-owned folder and allow an import outside the
                    // model store.
                    disabled={!destinationProject?.id}
                    // model-store-exclusive project folders only
                    filter={mergeFilterValues([
                      'ownership_type == "group"',
                      `group == "${destinationProject?.id ?? ''}"`,
                    ])}
                  />
                </Form.Item>
                <Tooltip
                  title={
                    destinationProject?.id
                      ? undefined
                      : t(
                          'importArtifactRevisionToFolderModal.FailedToRetrieveModelStoreProject',
                        )
                  }
                >
                  <BAIButton
                    icon={<PlusIcon />}
                    data-testid="import-artifact-create-folder-button"
                    disabled={!destinationProject?.id}
                    onClick={() => {
                      toggleIsOpenCreateModal();
                    }}
                  />
                </Tooltip>
              </BAIFlex>
            </Form.Item>
          </BAIFlex>
        </Form>
      </BAIModal>
      <FolderCreateModalV2
        open={isOpenCreateModal}
        // ADR-0001: the new folder lands in the model-store project the user
        // picked above — the same project the folder list is filtered by.
        project={toProjectContext(destinationProject ?? {})}
        initialValidate={true}
        folderType="model_project"
        onRequestClose={(result) => {
          toggleIsOpenCreateModal();
          if (result) {
            // Set the created folder as the selected value in the vfolderId
            // TODO: FolderCreateModalV2 returns id without '-'.
            formRef.current?.setFieldsValue({
              vfolderId: toGlobalId(
                'VirtualFolderNode',
                convertToUUID(result.id),
              ),
            });
            vfolderSelectRef.current?.refetch();
          }
        }}
      />
    </>
  );
};

export default ImportArtifactRevisionToFolderModal;
